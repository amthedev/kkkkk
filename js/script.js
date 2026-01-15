// Menu hambúrguer para mobile
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});

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

function apiBase() {
    return window.location.protocol.startsWith('http') ? '' : 'http://localhost:5000';
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function renderMenuOnlineCard() {
    const imgSrc = 'images/ChatGPT%20Image%2014%20de%20jan.%20de%202026,%2021_06_23.png';
    const linkUrl = 'https://menuonline.squareweb.app';
    return `
        <div class="portfolio-item animate-on-scroll" data-category="sites">
            <div class="portfolio-img">
                <img src="${imgSrc}" alt="Menu Online" loading="lazy">

                <div class="menu-preview">
                    <div class="menu-header">
                        <h4>🌐 Projeto</h4>
                        <p>Menu Online Digital</p>
                    </div>
                    <div class="menu-items">
                        <div class="menu-item">
                            <span class="item-name">Clique para ver</span>
                            <span class="item-price">→</span>
                        </div>
                    </div>
                </div>

                <div class="portfolio-overlay">
                    <a href="${linkUrl}" class="view-project" title="Visualizar Site" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-link"></i>
                    </a>
                </div>
            </div>
            <div class="portfolio-info">
                <h3>Menu Online Digital</h3>
                <p>Sistema de cardápio para restaurantes</p>
                <span class="portfolio-category">Sites</span>
            </div>
        </div>
    `;
}

function renderPortfolioItem(item) {
    const titulo = escapeHtml(item.titulo || '');
    const descricao = escapeHtml(item.descricao || '');
    const categoriaLabel = escapeHtml((item.categoria || '').charAt(0).toUpperCase() + (item.categoria || '').slice(1));
    const src = escapeHtml(item.media_src || '');
    const linkUrl = escapeHtml(item.link_url || '#');

    let mediaHtml = '';
    let overlayActionHtml = '';

    if (item.media_tipo === 'video') {
        // Se tiver link_url (YouTube), usa embed clicável, senão carrega vídeo local
        if (linkUrl && linkUrl !== '#') {
            mediaHtml = `
                <div class="video-container">
                    <a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="video-link">
                        <iframe 
                            src="https://www.youtube.com/embed/${linkUrl.split('/').pop()}"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </a>
                </div>
            `;
        } else {
            mediaHtml = `
                <video controls preload="metadata">
                    <source src="${src}" type="video/mp4">
                    Seu navegador não suporta o elemento de vídeo.
                </video>
            `;
        }
        overlayActionHtml = ''; // Remove botões de overlay para vídeos
    } else if (item.media_tipo === 'image') {
        mediaHtml = `<img src="${src}" alt="${titulo}">`;
        overlayActionHtml = `
            <button type="button" class="view-image" title="Ampliar Imagem">
                <i class="fas fa-expand"></i>
            </button>
        `;
    } else {
        mediaHtml = `
            <div class="menu-preview">
                <div class="menu-header">
                    <h4>🌐 Projeto</h4>
                    <p>${titulo}</p>
                </div>
                <div class="menu-items">
                    <div class="menu-item">
                        <span class="item-name">Clique para ver</span>
                        <span class="item-price">→</span>
                    </div>
                </div>
            </div>
        `;
        overlayActionHtml = `
            <a href="${linkUrl}" class="view-project" title="Visualizar Site" target="_blank" rel="noopener noreferrer">
                <i class="fas fa-link"></i>
            </a>
        `;
    }

    return `
        <div class="portfolio-item animate-on-scroll" data-category="${escapeHtml(item.categoria || '')}">
            <div class="portfolio-img">
                ${mediaHtml}
                <div class="portfolio-overlay">
                    ${overlayActionHtml}
                </div>
            </div>
            <div class="portfolio-info">
                <h3>${titulo}</h3>
                <p>${descricao}</p>
                <span class="portfolio-category">${categoriaLabel}</span>
            </div>
        </div>
    `;
}

async function carregarPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    try {
        const res = await fetch(`${apiBase()}/api/portfolio`);
        const itens = await res.json();
        if (!res.ok || !Array.isArray(itens)) {
            return;
        }
        grid.innerHTML = [renderMenuOnlineCard(), ...itens.map(renderPortfolioItem)].join('');
        animateOnScroll();
    } catch (_) {
        return;
    }
}

document.addEventListener('click', function(e) {
    const videoBtn = e.target.closest('.view-video');
    if (videoBtn) {
        e.preventDefault();
        e.stopPropagation(); // Evita qualquer comportamento padrão
        const portfolioItem = videoBtn.closest('.portfolio-item');
        
        // Tenta encontrar o vídeo local primeiro
        const video = portfolioItem ? portfolioItem.querySelector('video') : null;
        if (video) {
            const source = video.querySelector('source');
            const videoSrc = source ? source.src : '';
            openModal(videoSrc);
            return;
        }
        
        // Se não encontrar vídeo local, procura o iframe do YouTube
        const iframe = portfolioItem ? portfolioItem.querySelector('iframe') : null;
        if (iframe) {
            const modal = document.createElement('div');
            modal.className = 'video-modal';
            modal.innerHTML = `
                <div class="video-modal-content">
                    <span class="video-modal-close">&times;</span>
                    <iframe 
                        src="${iframe.src}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        style="width: 100%; height: 80vh; border: none;">
                    </iframe>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', function(ev) {
                if (ev.target === modal) {
                    document.body.removeChild(modal);
                    document.body.style.overflow = 'auto';
                }
            });
            document.body.style.overflow = 'hidden';
        }
        return;
    }

    // Novo: clique no overlay vazio de vídeos
    const videoOverlay = e.target.closest('.portfolio-overlay');
    if (videoOverlay && !e.target.closest('.view-project')) {
        e.preventDefault();
        e.stopPropagation();
        const portfolioItem = videoOverlay.closest('.portfolio-item');
        
        // Verifica se é um item de vídeo com link YouTube
        const videoLink = portfolioItem ? portfolioItem.querySelector('.video-link') : null;
        if (videoLink) {
            window.open(videoLink.href, '_blank', 'noopener,noreferrer');
            return;
        }
        
        // Se não for vídeo com link, procura iframe do YouTube
        const iframe = portfolioItem ? portfolioItem.querySelector('iframe') : null;
        if (iframe) {
            // Extrai o ID do vídeo do src do iframe
            const videoId = iframe.src.match(/\/embed\/([^?]+)/);
            if (videoId && videoId[1]) {
                window.open(`https://youtu.be/${videoId[1]}`, '_blank', 'noopener,noreferrer');
            }
        }
        return;
    }

    const imageBtn = e.target.closest('.view-image');
    if (imageBtn) {
        e.preventDefault();
        e.stopPropagation(); // Evita qualquer comportamento padrão
        const portfolioItem = imageBtn.closest('.portfolio-item');
        const img = portfolioItem ? portfolioItem.querySelector('img') : null;
        if (img) {
            const modal = document.createElement('div');
            modal.className = 'video-modal';
            modal.innerHTML = `
                <div class="video-modal-content">
                    <span class="video-modal-close">&times;</span>
                    <img src="${img.src}" style="width: 100%; height: auto; max-height: 80vh; object-fit: contain;">
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', function(ev) {
                if (ev.target === modal) {
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
    }
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
    createVideoModal();
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
            
            const currentPortfolioItems = document.querySelectorAll('.portfolio-item');
            currentPortfolioItems.forEach(item => {
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

    carregarPortfolio();
});

// Botão do WhatsApp
const whatsappBtn = document.querySelector('.whatsapp-btn');
if (whatsappBtn) {
    // Número de WhatsApp formatado (apenas números, sem espaços ou caracteres especiais)
    const phoneNumber = '558191498930';
    whatsappBtn.href = `https://wa.me/${phoneNumber}?text=Olá, gostaria de fazer um orçamento!`;
}
