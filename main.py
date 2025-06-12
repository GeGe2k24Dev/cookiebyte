import sqlite3
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import jwt  # PyJWT
from passlib.context import CryptContext  # Hash de senhas

# ----- Configurações de autenticação -----
SECRET_KEY = "minha_chave_super_secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # rota /login

# ----- Modelos Pydantic -----
class Produto(BaseModel):
    id: Optional[int]
    nome: str
    preco: float
    imagem: str

class UsuarioCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "user"

class UsuarioSaida(BaseModel):
    id: int
    username: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CarrinhoItem(BaseModel):
    id: Optional[int]
    user_id: int
    produto_id: int
    quantidade: int

# ----- Banco de Dados SQLite -----
def get_db():
    conn = sqlite3.connect("cakebite.db")
    conn.row_factory = sqlite3.Row
    return conn

def criar_tabelas():
    db = get_db()
    cursor = db.cursor()
    # produtos
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            imagem TEXT NOT NULL
        )
        """
    )
    # usuarios
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
        )
        """
    )
    # carrinho
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS carrinho (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            produto_id INTEGER NOT NULL,
            quantidade INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES usuarios(id),
            FOREIGN KEY(produto_id) REFERENCES produtos(id)
        )
        """
    )
    db.commit()
    db.close()

criar_tabelas()

# ----- Funções de Segurança -----
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_username(username: str):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = ?", (username,))
    user = cursor.fetchone()
    db.close()
    return user

# ----- Dependências de Autenticação -----
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    user = get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user

def require_admin(user: sqlite3.Row = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado: admin requerido")
    return user

# ----- Aplicação FastAPI -----
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Endpoints de Usuário -----
@app.post("/register", response_model=UsuarioSaida, status_code=201)
def register(user: UsuarioCreate):
    """Registra um novo usuário"""
    if get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username já existente")
    hashed = hash_password(user.password)
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO usuarios (username, password, role) VALUES (?,?,?)",
        (user.username, hashed, user.role)
    )
    db.commit()
    user_id = cur.lastrowid
    db.close()
    return UsuarioSaida(id=user_id, username=user.username, role=user.role)

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Faz login e retorna token JWT"""
    user = get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/usuario/me", response_model=UsuarioSaida)
def read_current_user(user: sqlite3.Row = Depends(get_current_user)):
    """Retorna dados do usuário logado"""
    return UsuarioSaida(id=user["id"], username=user["username"], role=user["role"])

# ----- Endpoints de Produtos -----
@app.get("/produtos", response_model=List[Produto])
def get_produtos():
    """Lista todos os produtos"""
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM produtos")
    produtos = [Produto(**dict(row)) for row in cur.fetchall()]
    db.close()
    return produtos

@app.post("/produtos", status_code=201)
def create_produto(prod: Produto, admin: sqlite3.Row = Depends(require_admin)):
    """Adiciona produto (admin)"""
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO produtos (nome, preco, imagem) VALUES (?,?,?)",
        (prod.nome, prod.preco, prod.imagem)
    )
    db.commit()
    db.close()
    return {"mensagem": "Produto criado"}

# ----- Endpoints de Carrinho -----
@app.get("/carrinho", response_model=List[CarrinhoItem])
def read_cart(user: sqlite3.Row = Depends(get_current_user)):
    """Lista itens do carrinho do usuário logado"""
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM carrinho WHERE user_id = ?", (user["id"],))
    items = [CarrinhoItem(**dict(r)) for r in cur.fetchall()]
    db.close()
    return items

@app.post("/carrinho/add", status_code=201)
def add_to_cart(item: CarrinhoItem, user: sqlite3.Row = Depends(get_current_user)):
    """Adiciona ou atualiza item no carrinho"""
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT id, quantidade FROM carrinho WHERE user_id = ? AND produto_id = ?",
        (user["id"], item.produto_id)
    )
    row = cur.fetchone()
    if row:
        new_qt = row["quantidade"] + item.quantidade
        cur.execute(
            "UPDATE carrinho SET quantidade = ? WHERE id = ?",
            (new_qt, row["id"])
        )
    else:
        cur.execute(
            "INSERT INTO carrinho (user_id, produto_id, quantidade) VALUES (?,?,?)",
            (user["id"], item.produto_id, item.quantidade)
        )
    db.commit()
    db.close()
    return {"mensagem": "Carrinho atualizado"}

@app.delete("/carrinho/remove/{item_id}")
def remove_from_cart(item_id: int, user: sqlite3.Row = Depends(get_current_user)):
    """Remove item do carrinho"""
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "DELETE FROM carrinho WHERE id = ? AND user_id = ?",
        (item_id, user["id"])  
    )
    if cur.rowcount == 0:
        db.close()
        raise HTTPException(status_code=404, detail="Item não encontrado")
    db.commit()
    db.close()
    return {"mensagem": "Item removido"}


"""
Instruções para rodar este servidor:

1. Instale as dependências (via terminal):
    pip install fastapi uvicorn passlib[bcrypt] PyJWT python-multipart

2. Navegue até a pasta do projeto (no terminal):
    Exemplo: cd caminho/para/a/pasta/cake-bite

3. Rode o servidor:
    python -m uvicorn main:app --reload

4. Acesso da documentação da API no navegador:
    http://127.0.0.1:8000/docs

5. Rode o front-end:
    - Recomendo usar Live Server (extensão) no VSCode
    - OU rode no terminal:
      python -m http.server 5500
    → Acesse: http://127.0.0.1:5500/index.html
"""
