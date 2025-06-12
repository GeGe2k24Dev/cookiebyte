// Funcionalidades específicas para o slider da página inicial

document.addEventListener('DOMContentLoaded', function() {
    initSlider();
});

function initSlider() {
    const slider = document.getElementById('slider');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    let currentSlide = 0;
    const slides = slider.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    // Configurar autoplay
    let autoplayInterval = setInterval(nextSlide, 5000);
    
    // Função para mover para o próximo slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSliderPosition();
    }
    
    // Função para mover para o slide anterior
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSliderPosition();
    }
    
    // Função para atualizar a posição do slider
    function updateSliderPosition() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    // Adicionar event listeners aos botões
    nextBtn.addEventListener('click', function() {
        clearInterval(autoplayInterval);
        nextSlide();
        autoplayInterval = setInterval(nextSlide, 5000);
    });
    
    prevBtn.addEventListener('click', function() {
        clearInterval(autoplayInterval);
        prevSlide();
        autoplayInterval = setInterval(nextSlide, 5000);
    });
    
    // Adicionar suporte para gestos de swipe em dispositivos móveis
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoplayInterval);
    }, { passive: true });
    
    slider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        autoplayInterval = setInterval(nextSlide, 5000);
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe para a esquerda (próximo slide)
            nextSlide();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe para a direita (slide anterior)
            prevSlide();
        }
    }
    
    // Pausar autoplay quando o mouse estiver sobre o slider
    slider.addEventListener('mouseenter', function() {
        clearInterval(autoplayInterval);
    });
    
    slider.addEventListener('mouseleave', function() {
        autoplayInterval = setInterval(nextSlide, 5000);
    });
    
    // Adicionar indicadores de slide
    addSlideIndicators();
    
    function addSlideIndicators() {
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'slider-indicators';
        
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('span');
            indicator.className = i === currentSlide ? 'indicator active' : 'indicator';
            indicator.addEventListener('click', function() {
                clearInterval(autoplayInterval);
                currentSlide = i;
                updateSliderPosition();
                updateIndicators();
                autoplayInterval = setInterval(nextSlide, 5000);
            });
            indicatorsContainer.appendChild(indicator);
        }
        
        slider.parentNode.appendChild(indicatorsContainer);
    }
    
    function updateIndicators() {
        const indicators = document.querySelectorAll('.slider-indicators .indicator');
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Adicionar estilos para os indicadores
    const style = document.createElement('style');
    style.textContent = `
        .slider-indicators {
            display: flex;
            justify-content: center;
            position: absolute;
            bottom: 20px;
            width: 100%;
            z-index: 10;
        }
        
        .indicator {
            width: 12px;
            height: 12px;
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            margin: 0 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .indicator.active {
            background-color: white;
        }
    `;
    document.head.appendChild(style);
}
