// Efeito de partículas no rodapé
document.addEventListener('DOMContentLoaded', function() {
    const footerParticles = document.getElementById('footerParticles');
    
    if (!footerParticles) return;
    
    // Número de partículas
    const particleCount = 20;
    
    // Criar partículas
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'footer-particle';
        
        // Tamanho aleatório entre 2px e 6px
        const size = Math.random() * 4 + 2;
        
        // Posição aleatória
        const posX = Math.random() * 100;
        const delay = Math.random() * 5; // Atraso para animação
        const duration = 10 + Math.random() * 20; // Duração entre 10s e 30s
        
        // Aplicar estilos
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.bottom = '0';
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        // Adicionar ao container
        footerParticles.appendChild(particle);
        
        // Recriar a partícula quando a animação terminar
        particle.addEventListener('animationend', function() {
            particle.remove();
            createParticle();
        });
    }
    
    // Atualizar o ano atual
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
});
