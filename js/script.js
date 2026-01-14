// Modal de vídeo
function createVideoModal() {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <span class="video-modal-close">&times;</span>
            <video id="modal-video" controls autoplay>
                <source src="" type="video/mp4">
                Seu navegador não suporta o elemento de vídeo.
            </video>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Event listeners
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    modal.querySelector('.video-modal-close').addEventListener('click', closeModal);
}

function openModal(videoSrc) {
    const modal = document.querySelector('.video-modal');
    const video = document.getElementById('modal-video');
    
    if (!modal) {
        createVideoModal();
        openModal(videoSrc);
        return;
    }
    
    video.querySelector('source').src = videoSrc;
    video.load();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.querySelector('.video-modal');
    const video = document.getElementById('modal-video');
    
    if (modal) {
        modal.style.display = 'none';
        video.pause();
        video.currentTime = 0;
        document.body.style.overflow = 'auto';
    }
}

// Event listeners para botões de vídeo
document.addEventListener('DOMContentLoaded', function() {
    // Botões de play no portfólio
    const playButtons = document.querySelectorAll('.view-video');
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const portfolioItem = this.closest('.portfolio-item');
            const video = portfolioItem.querySelector('video');
            if (video) {
                const videoSrc = video.querySelector('source').src;
                openModal(videoSrc);
            }
        });
    });
    
    // Botões de expandir imagem
    const expandButtons = document.querySelectorAll('.view-image');
    expandButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const portfolioItem = this.closest('.portfolio-item');
            const img = portfolioItem.querySelector('img');
            if (img) {
                // Criar modal para imagem
                const modal = document.createElement('div');
                modal.className = 'video-modal';
                modal.innerHTML = `
                    <div class="video-modal-content">
                        <span class="video-modal-close">&times;</span>
                        <img src="${img.src}" style="width: 100%; height: auto; max-height: 80vh; object-fit: contain;">
                    </div>
                `;
                document.body.appendChild(modal);
                
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                        document.body.style.overflow = 'auto';
                    }
                });
                
                modal.querySelector('.video-modal-close').addEventListener('click', function() {
                    document.body.removeChild(modal);
                    document.body.style.overflow = 'auto';
                });
                
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
});

// Navegação suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Formulário de agendamento
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coletar dados do formulário
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            service: document.getElementById('service').value,
            details: document.getElementById('details').value
        };
        
        // Aqui você pode adicionar o código para enviar os dados para um servidor
        // Por enquanto, vamos apenas mostrar um alerta
        alert('Solicitação de orçamento enviada com sucesso! Entraremos em contato em breve.');
        bookingForm.reset();
    });
}

// Adicionar classe ativa ao menu de navegação ao rolar
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const nav = document.querySelector('nav');
    
    // Ajustar a navbar ao rolar
    if (scrollPosition > 100) {
        nav.style.background = '#ffffff';
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        nav.style.padding = '15px 5%';
    } else {
        nav.style.background = '#ffffff';
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        nav.style.padding = '20px 5%';
    }
    
    // Destacar seção ativa no menu
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('nav a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Configuração da data mínima para o campo de data (hoje em diante)
const today = new Date().toISOString().split('T')[0];
const dataField = document.getElementById('data');
if (dataField) {
    dataField.min = today;
}

// Função para verificar se um elemento está visível na tela
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
        rect.bottom >= 0
    );
}

// Função para adicionar a classe 'visible' aos elementos visíveis
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

// Função para otimizações em dispositivos móveis
function setupMobileOptimizations() {
    // Ajusta o tamanho dos botões para toque
    const buttons = document.querySelectorAll('button, .btn, a[role="button"]');
    buttons.forEach(button => {
        button.style.minWidth = '44px';
        button.style.minHeight = '44px';
        button.style.padding = '12px 20px';
    });

    // Ajusta o tamanho da fonte para melhor legibilidade
    if (window.innerWidth <= 768) {
        document.documentElement.style.fontSize = '16px';
        
        // Ajusta o padding do cabeçalho
        const header = document.querySelector('header');
        if (header) {
            header.style.padding = '100px 20px';
        }
        
        // Ajusta o tamanho dos botões do cabeçalho
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        heroButtons.forEach(btn => {
            btn.style.display = 'block';
            btn.style.width = '100%';
            btn.style.margin = '10px 0';
            btn.style.padding = '15px 20px';
            btn.style.fontSize = '1.1em';
        });
    }
}

// Inicialização do carrossel de vídeos (simulado)
function initVideoCarousel() {
    // Aqui você pode adicionar um carrossel de vídeos real posteriormente
    console.log('Inicializando carrossel de vídeos...');
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Tenta reproduzir o vídeo (pode ser bloqueado por políticas de autoplay)
    const video = document.querySelector('.video-background');
    if (video) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay não permitido:', error);
                // Tenta reproduzir após a primeira interação do usuário
                document.addEventListener('click', function playVideoOnClick() {
                    video.play();
                    document.removeEventListener('click', playVideoOnClick);
                }, { once: true });
            });
        }
    }
    
    initVideoCarousel();
    setupMobileOptimizations();
    
    // Adiciona um ouvinte de redimensionamento para ajustes dinâmicos
    window.addEventListener('resize', setupMobileOptimizations);
    
    // Configura o botão do WhatsApp
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.setAttribute('aria-label', 'Fale conosco no WhatsApp');
    }
    
    // Adicionar classe ativa ao primeiro item do menu
    const firstNavItem = document.querySelector('nav a');
    if (firstNavItem) firstNavItem.classList.add('active');
    
    // Adicionar classe de animação aos elementos do portfólio
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        item.classList.add('animate-on-scroll');
        item.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Disparar a verificação inicial
    animateOnScroll();
    
    // Adicionar evento de rolagem para animação
    window.addEventListener('scroll', animateOnScroll);
    
    // Filtro do portfólio
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe 'active' de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe 'active' apenas ao botão clicado
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                if (filterValue === 'todos' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Adiciona uma animação suave
                    item.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Adiciona um ouvinte para os links do portfólio para prevenir o comportamento padrão
    const portfolioLinks = document.querySelectorAll('.portfolio-overlay a');
    portfolioLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Aqui você pode adicionar a lógica para abrir o lightbox ou modal
            console.log('Abrir projeto: ' + this.getAttribute('title'));
        });
    });
});

// Botão do WhatsApp
const whatsappBtn = document.querySelector('.whatsapp-btn');
if (whatsappBtn) {
    // Número de WhatsApp formatado (apenas números, sem espaços ou caracteres especiais)
    const phoneNumber = '558191498930';
    whatsappBtn.href = `https://wa.me/${phoneNumber}?text=Olá, gostaria de fazer um orçamento!`;
}
