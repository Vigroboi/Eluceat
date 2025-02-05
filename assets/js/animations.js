// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initial page load animations
function initLoadAnimations() {
    // Hero section animation
    gsap.from(".hero-content", {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: "power3.out"
    });

    gsap.from(".hero-3d", {
        duration: 1.2,
        scale: 0.8,
        opacity: 0,
        delay: 0.3,
        ease: "power3.out"
    });
}

// Scroll animations for pricing cards and service cards
function initScrollAnimations() {
    // Web Development Section
    gsap.from("#web-services .awe-section__header", {
        scrollTrigger: {
            trigger: "#web-services",
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        duration: 1,
        y: 60,
        opacity: 0,
        ease: "power3.out"
    });

    gsap.from("#web-services .pricing-card", {
        scrollTrigger: {
            trigger: "#web-services .pricing-grid",
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        duration: 0.8,
        y: 100,
        opacity: 0,
        stagger: 0.2,
        ease: "power2.out"
    });

    // Marketing Section
    gsap.from("#marketing .awe-section__header", {
        scrollTrigger: {
            trigger: "#marketing",
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        duration: 1,
        y: 60,
        opacity: 0,
        ease: "power3.out"
    });

    gsap.from("#marketing .service-card", {
        scrollTrigger: {
            trigger: "#marketing .services-grid",
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        duration: 0.8,
        y: 100,
        opacity: 0,
        stagger: 0.2,
        ease: "power2.out"
    });

    // Security Section
    gsap.from("#security .awe-section__header", {
        scrollTrigger: {
            trigger: "#security",
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        duration: 1,
        y: 60,
        opacity: 0,
        ease: "power3.out"
    });

    gsap.from("#security .service-card", {
        scrollTrigger: {
            trigger: "#security .services-grid",
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        duration: 0.8,
        y: 100,
        opacity: 0,
        stagger: 0.2,
        ease: "power2.out"
    });
}

// Enhanced hover animations
function initHoverAnimations() {
    const cards = document.querySelectorAll('.pricing-card, .service-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                y: -15,
                scale: 1.03,
                boxShadow: "0 20px 30px rgba(0,0,0,0.2)",
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                y: 0,
                scale: 1,
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                ease: "power2.out"
            });
        });
    });
}

// Add this to your animations.js
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    });
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    initLoadAnimations();
    initScrollAnimations();
    initHoverAnimations();
    initScrollProgress();
}); 