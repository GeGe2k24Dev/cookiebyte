// Funcionalidades para o carrinho de compras

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar botões de adicionar ao carrinho
    initAddToCartButtons();
    // Atualizar contador do carrinho
    updateCartCount();
});

// Inicializar botões de adicionar ao carrinho
function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.produto-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-nome');
            const productPrice = parseFloat(this.getAttribute('data-preco'));
            const productImage = this.getAttribute('data-imagem');
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

// Adicionar produto ao carrinho
function addToCart(id, name, price, image) {
    let cartItems = getCartItems();
    
    // Verificar se o produto já está no carrinho
    const existingItemIndex = cartItems.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        // Incrementar quantidade se o produto já estiver no carrinho
        cartItems[existingItemIndex].quantity += 1;
    } else {
        // Adicionar novo item ao carrinho
        cartItems.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    // Salvar carrinho atualizado
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Atualizar contador do carrinho
    updateCartCount();
    
    // Mostrar notificação
    showNotification(`${name} adicionado ao carrinho!`, 'success');
}

// Remover produto do carrinho
function removeFromCart(id) {
    let cartItems = getCartItems();
    
    // Filtrar o item a ser removido
    cartItems = cartItems.filter(item => item.id !== id);
    
    // Salvar carrinho atualizado
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Atualizar contador do carrinho
    updateCartCount();
    
    // Se estiver na página do carrinho, atualizar a exibição
    if (document.querySelector('.carrinho-container')) {
        renderCart();
    }
}

// Atualizar quantidade de um produto no carrinho
function updateCartItemQuantity(id, quantity) {
    if (quantity < 1) return;
    
    let cartItems = getCartItems();
    
    // Encontrar o item no carrinho
    const itemIndex = cartItems.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        // Atualizar quantidade
        cartItems[itemIndex].quantity = quantity;
        
        // Salvar carrinho atualizado
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Se estiver na página do carrinho, atualizar a exibição
        if (document.querySelector('.carrinho-container')) {
            renderCart();
        }
    }
}

// Calcular total do carrinho
function calculateCartTotal() {
    const cartItems = getCartItems();
    
    return cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// Renderizar carrinho na página de carrinho
function renderCart() {
    const cartContainer = document.querySelector('.carrinho-container');
    if (!cartContainer) return;
    
    const cartItems = getCartItems();
    
    if (cartItems.length === 0) {
        // Carrinho vazio
        cartContainer.innerHTML = `
            <h1 class="carrinho-titulo">Seu Carrinho</h1>
            <div class="carrinho-vazio">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
                <a href="produtos.html" class="continuar-comprando">Ver Produtos</a>
            </div>
        `;
        return;
    }
    
    // Carrinho com itens
    let cartHTML = `
        <h1 class="carrinho-titulo">Seu Carrinho</h1>
        <div class="carrinho-itens">
    `;
    
    // Adicionar cada item do carrinho
    cartItems.forEach(item => {
        cartHTML += `
            <div class="carrinho-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="carrinho-item-imagem">
                <div class="carrinho-item-info">
                    <h3 class="carrinho-item-nome">${item.name}</h3>
                    <p class="carrinho-item-preco">R$ ${item.price.toFixed(2)}</p>
                    <div class="carrinho-item-quantidade">
                        <button class="quantidade-btn decrement">-</button>
                        <span class="quantidade-valor">${item.quantity}</span>
                        <button class="quantidade-btn increment">+</button>
                    </div>
                    <button class="carrinho-item-remover"><i class="fas fa-trash"></i> Remover</button>
                </div>
            </div>
        `;
    });
    
    // Fechar div de itens e adicionar resumo
    cartHTML += `
        </div>
        <div class="carrinho-resumo">
            <div class="resumo-linha">
                <span>Subtotal:</span>
                <span>R$ ${calculateCartTotal().toFixed(2)}</span>
            </div>
            <div class="resumo-linha">
                <span>Frete:</span>
                <span>Grátis</span>
            </div>
            <div class="resumo-linha total">
                <span>Total:</span>
                <span>R$ ${calculateCartTotal().toFixed(2)}</span>
            </div>
        </div>
        <div class="carrinho-botoes">
            <a href="produtos.html" class="continuar-comprando">Continuar Comprando</a>
            <button class="finalizar-compra">Finalizar Compra</button>
        </div>
    `;
    
    // Atualizar o conteúdo do carrinho
    cartContainer.innerHTML = cartHTML;
    
    // Adicionar event listeners para os botões
    initCartButtons();
}

// Inicializar botões na página do carrinho
function initCartButtons() {
    // Botões de incremento e decremento
    const incrementButtons = document.querySelectorAll('.quantidade-btn.increment');
    const decrementButtons = document.querySelectorAll('.quantidade-btn.decrement');
    const removeButtons = document.querySelectorAll('.carrinho-item-remover');
    const checkoutButton = document.querySelector('.finalizar-compra');
    
    // Incrementar quantidade
    incrementButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.carrinho-item');
            const id = cartItem.getAttribute('data-id');
            const quantityElement = cartItem.querySelector('.quantidade-valor');
            const currentQuantity = parseInt(quantityElement.textContent);
            
            updateCartItemQuantity(id, currentQuantity + 1);
        });
    });
    
    // Decrementar quantidade
    decrementButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.carrinho-item');
            const id = cartItem.getAttribute('data-id');
            const quantityElement = cartItem.querySelector('.quantidade-valor');
            const currentQuantity = parseInt(quantityElement.textContent);
            
            if (currentQuantity > 1) {
                updateCartItemQuantity(id, currentQuantity - 1);
            }
        });
    });
    
    // Remover item
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.carrinho-item');
            const id = cartItem.getAttribute('data-id');
            
            removeFromCart(id);
        });
    });
    
    // Finalizar compra
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            // Simular finalização de compra
            localStorage.removeItem('cartItems');
            showNotification('Compra finalizada com sucesso!', 'success');
            
            // Redirecionar para a página inicial após 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }
}

// Verificar se estamos na página do carrinho e renderizar
if (document.querySelector('.carrinho-container')) {
    document.addEventListener('DOMContentLoaded', renderCart);
}
