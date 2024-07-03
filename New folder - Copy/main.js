document.addEventListener('DOMContentLoaded', () => {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const body = document.body;

    // Set first image as default background
    const defaultBgImage = carouselItems[0].getAttribute('data-bg');
    body.style.backgroundImage = `url(${defaultBgImage})`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';

    carouselItems.forEach(item => {
        item.addEventListener('click', () => {
            const bgImage = item.getAttribute('data-bg');
            body.style.backgroundImage = `url(${bgImage})`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.transition = 'background-image 0.5s ease';
        });
    });

    // GSAP and ScrollTrigger animations
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.info h2', {
        scrollTrigger: '.info h2',
        y: -50,
        opacity: 0,
        duration: 1
    });

    gsap.from('.info p', {
        scrollTrigger: '.info p',
        y: 50,
        opacity: 0,
        duration: 1
    });

    gsap.from('.carousel-item', {
        scrollTrigger: {
            trigger: '.carousel-item',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 100,
        duration: 1,
        stagger: 0.3
    });

    // Mouse trail effect
    document.addEventListener('mousemove', e => {
        const trail = document.createElement('div');
        trail.classList.add('mouse-trail');
        trail.style.left = `${e.pageX}px`;
        trail.style.top = `${e.pageY}px`;
        document.body.appendChild(trail);
        setTimeout(() => {
            trail.style.opacity = '0';
            setTimeout(() => trail.remove(), 1000);
        }, 300);
    });

    // Parallax effect
    const parallaxImages = document.querySelectorAll('.parallax-layer');
    parallaxImages.forEach(image => {
        const depth = image.getAttribute('data-depth');
        image.style.transform = `translateZ(${depth}px) scale(${1 + parseFloat(depth)})`;
    });

    window.addEventListener('scroll', () => {
        parallaxImages.forEach(image => {
            const depth = image.getAttribute('data-depth');
            const movement = -(window.scrollY * depth);
            image.style.transform = `translateY(${movement}px) translateZ(${depth}px) scale(${1 + parseFloat(depth)})`;
        });
    });
});
