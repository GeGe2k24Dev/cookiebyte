// Funcionalidades para a página de produtos

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar filtros de categorias
    initCategoryFilters();
    
    // Inicializar botões de adicionar ao carrinho (já implementado no carrinho.js)
    // initAddToCartButtons();
});

// Inicializar filtros de categorias
function initCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.grupo-btn');
    const productGroups = document.querySelectorAll('.grupo-produtos');
    
    if (!categoryButtons.length || !productGroups.length) return;
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe ativo de todos os botões
            categoryButtons.forEach(btn => btn.classList.remove('ativo'));
            
            // Adicionar classe ativo ao botão clicado
            this.classList.add('ativo');
            
            // Obter o grupo de produtos correspondente
            const targetGroup = this.getAttribute('data-grupo');
            
            // Esconder todos os grupos de produtos
            productGroups.forEach(group => group.classList.remove('ativo'));
            
            // Mostrar o grupo de produtos correspondente
            document.getElementById(targetGroup).classList.add('ativo');
        });
    });
}

// Função para pesquisar produtos
function searchProducts(query) {
    query = query.toLowerCase().trim();
    
    if (!query) {
        // Se a pesquisa estiver vazia, mostrar todos os produtos
        showAllProducts();
        return;
    }
    
    const productCards = document.querySelectorAll('.produto-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.produto-nome').textContent.toLowerCase();
        const productDesc = card.querySelector('.produto-desc').textContent.toLowerCase();
        
        if (productName.includes(query) || productDesc.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Função para mostrar todos os produtos
function showAllProducts() {
    const productCards = document.querySelectorAll('.produto-card');
    
    productCards.forEach(card => {
        card.style.display = 'block';
    });
}

// Adicionar campo de pesquisa
function addSearchField() {
    const productHeader = document.querySelector('.produtos-header');
    
    if (!productHeader) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" id="search-input" placeholder="Buscar produtos...">
        <button id="search-button"><i class="fas fa-search"></i></button>
    `;
    
    productHeader.appendChild(searchContainer);
    
    // Adicionar event listeners
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    searchInput.addEventListener('input', function() {
        searchProducts(this.value);
    });
    
    searchButton.addEventListener('click', function() {
        searchProducts(searchInput.value);
    });
    
    // Adicionar estilos para o campo de pesquisa
    const style = document.createElement('style');
    style.textContent = `
        .search-container {
            display: flex;
            margin: 1rem auto;
            max-width: 500px;
        }
        
        #search-input {
            flex: 1;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 5px 0 0 5px;
            font-size: 1rem;
        }
        
        #search-button {
            background-color: var(--rosa-principal);
            color: white;
            border: none;
            padding: 0 1rem;
            border-radius: 0 5px 5px 0;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

// Inicializar campo de pesquisa se estiver na página de produtos
if (document.querySelector('.produtos-header')) {
    document.addEventListener('DOMContentLoaded', addSearchField);
}
