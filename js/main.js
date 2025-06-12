// Arquivo principal para funcionalidades gerais e carregamento de componentes

// Carregar componentes reutilizáveis
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    // Carregar o cabeçalho apropriado (logado ou não logado)
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        const headerFile = isLoggedIn ? 'components/header-logado.html' : 'components/header.html';
        fetch(headerFile)
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                // Inicializar funcionalidades do menu após carregar o cabeçalho
                initMobileMenu();
                updateCartCount();
                
                // Adicionar evento de logout se o usuário estiver logado
                if (isLoggedIn) {
                    const logoutBtn = document.getElementById('logout-btn');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            // Limpar dados de login
                            localStorage.removeItem('userLoggedIn');
                            localStorage.removeItem('userEmail');
                            
                            // Mostrar notificação
                            showNotification('Logout realizado com sucesso!', 'success');
                            
                            // Redirecionar para a página inicial após 1 segundo
                            setTimeout(() => {
                                window.location.href = 'index.html';
                            }, 1000);
                        });
                    }
                }
            });
    }

    // Carregar o rodapé
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        fetch('components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerContainer.innerHTML = data;
            });
    }
});

// Função para inicializar o menu mobile
function initMobileMenu() {
    const menuBtn = document.querySelector('.menu-mobile-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
}

// Função para atualizar o contador do carrinho
function updateCartCount() {
    const cartItems = getCartItems();
    const cartCountElements = document.querySelectorAll('.contador-carrinho');
    
    cartCountElements.forEach(element => {
        element.textContent = cartItems.length;
    });
}

// Função para obter itens do carrinho do localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
}

// Função para exibir notificações
function showNotification(message, type = 'success') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Adicionar estilos para notificações
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.5s forwards;
    }
    
    .notification.success {
        background-color: #4CAF50;
    }
    
    .notification.error {
        background-color: #f44336;
    }
    
    .notification.hide {
        animation: slideOut 0.5s forwards;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
