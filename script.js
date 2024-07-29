// Register GSAP ScrollTrigger plugin and ScrollToPlugin
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Initialize Lenis
let lenis;

// Loader functionality
const loaderContainer = document.querySelector('.loader-container');
const mainContent = document.querySelector('.main-content');

window.addEventListener('load', () => {
    setTimeout(() => {
        gsap.to(loaderContainer, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                loaderContainer.style.display = 'none';
                mainContent.classList.add('loaded');
                initializeAllComponents();
            }
        });
    }, 2000); // Adjust this delay as needed
});

function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Integrate Lenis with GSAP
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Update ScrollTrigger on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis-driven scroll normalization to ScrollTrigger
    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value);
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
        },
        pinType: document.body.style.transform ? "transform" : "fixed"
    });
}

function initializeAllComponents() {
    initLenis();
    navSlide();
    initHeroAnimations();
    animateFeaturedCollections();
    initTestimonials();
    initVirtualTryOn();
    animateVirtualTryOn();
    initVideoShowcase();
    initWhatsNewSection();
    initSmoothScroll();
    initNavbarScrollEffect();
    animateAtelierSection();
    revealAtelierSection();
    initScatteredPhotos();
    initMobileOptimizations();
    lazyLoadImages();
}

// Navbar functionality
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });
}

// Hero animations
function initHeroAnimations() {
    const heroImages = document.querySelectorAll('.hero-image');
    let imagesLoaded = 0;

    function imageLoaded() {
        imagesLoaded++;
        if (imagesLoaded === heroImages.length) {
            initializeHeroSwiper();
            initHeroParallax(); // Initialize the parallax effect
        }
    }

    // Preload images
    heroImages.forEach(img => {
        const bgImage = new Image();
        bgImage.src = img.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
        bgImage.onload = imageLoaded;
        bgImage.onerror = imageLoaded; // Count errors as loaded to avoid blocking
    });

    function initializeHeroSwiper() {
        const heroSwiper = new Swiper('.hero-carousel', {
            loop: true,
            effect: 'fade',
            speed: 1000,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.carousel-nav',
                clickable: true,
                renderBullet: function (index, className) {
                    return '<div class="' + className + ' carousel-nav-item"></div>';
                },
            },
            on: {
                beforeInit: function () {
                    const swiper = this;
                    swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
                    const overwriteParams = {
                        slidesPerView: 1,
                        slidesPerColumn: 1,
                        slidesPerGroup: 1,
                        watchSlidesProgress: true,
                        spaceBetween: 0,
                        virtualTranslate: true,
                    };
                    swiper.params = Object.assign(swiper.params, overwriteParams);
                    swiper.params = Object.assign(swiper.originalParams, overwriteParams);
                },
                setTranslate: function () {
                    const swiper = this;
                    const { slides } = swiper;
                    for (let i = 0; i < slides.length; i += 1) {
                        const $slideEl = swiper.slides.eq(i);
                        const offset = $slideEl[0].swiperSlideOffset;
                        let tx = -offset;
                        if (!swiper.params.virtualTranslate) tx -= swiper.translate;
                        let ty = 0;
                        if (!swiper.isHorizontal()) {
                            ty = tx;
                            tx = 0;
                        }
                        const slideOpacity = swiper.params.fadeEffect.crossFade
                            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
                            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
                        $slideEl
                            .css({
                                opacity: slideOpacity,
                            })
                            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
                    }
                },
                setTransition: function (duration) {
                    const swiper = this;
                    const { slides, $wrapperEl } = swiper;
                    slides.transition(duration);
                    if (swiper.params.virtualTranslate && duration !== 0) {
                        let eventTriggered = false;
                        slides.transitionEnd(() => {
                            if (eventTriggered) return;
                            if (!swiper || swiper.destroyed) return;
                            eventTriggered = true;
                            swiper.animating = false;
                            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
                            for (let i = 0; i < triggerEvents.length; i += 1) {
                                $wrapperEl.trigger(triggerEvents[i]);
                            }
                        });
                    }
                },
            },
        });
    }

    function initHeroParallax() {
        heroImages.forEach(img => {
            gsap.to(img, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement, // Use the parent slide as the trigger
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        });
    }
}

// Featured Collections animations
function animateFeaturedCollections() {
    gsap.from('.featured-collections .section-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: '.featured-collections',
            start: 'top 80%',
        }
    });

    gsap.from('.collection-item', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.collections-grid',
            start: 'top 80%',
        }
    });
}

// Testimonials
function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    // Parallax effect on hover
    testimonialCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width - 0.5) * 20;
            const yPercent = (y / rect.height - 0.5) * 20;

            gsap.to(card, {
                rotationY: xPercent,
                rotationX: -yPercent,
                transformPerspective: 500,
                ease: 'power1.out',
                duration: 0.5
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                ease: 'power3.out',
                duration: 0.5
            });
        });
    });

    // Animate cards on scroll
    gsap.from(testimonialCards, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.testimonial-grid',
            start: 'top 80%'
        }
    });
}

// Virtual Try-On Experience
function initVirtualTryOn() {
    const designOptions = document.querySelectorAll('.design-option');
    const colorOptions = document.querySelectorAll('.color-option');
    const garmentOverlay = document.querySelector('.garment-overlay');

    const designs = {
        design1: './img/1.jpg',
        design2: './img/upscale.jpg',
        design3: './img/5.jpg'
    };

    let currentDesign = null;
    let currentColor = null;

    function updateGarment() {
        garmentOverlay.style.opacity = 0;

        setTimeout(() => {
            if (currentDesign) {
                garmentOverlay.style.backgroundImage = `url(${currentDesign})`;
                garmentOverlay.style.opacity = 1;

                if (currentColor) {
                    garmentOverlay.style.backgroundColor = currentColor;
                    garmentOverlay.style.mixBlendMode = 'multiply';
                } else {
                    garmentOverlay.style.backgroundColor = 'transparent';
                    garmentOverlay.style.mixBlendMode = 'normal';
                }
            }
        }, 300);
    }

    designOptions.forEach(option => {
        option.addEventListener('click', () => {
            const design = option.getAttribute('data-design');
            currentDesign = designs[design];
            updateGarment();

            designOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    colorOptions.forEach(option => {
        const color = option.getAttribute('data-color');
        option.style.backgroundColor = color;

        option.addEventListener('click', () => {
            currentColor = color;
            updateGarment();

            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Initialize with the first design
    designOptions[0].click();
}

// Virtual Try-On animations
function animateVirtualTryOn() {
    gsap.from('.virtual-try-on .section-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: '.virtual-try-on',
            start: 'top 80%',
        }
    });

    gsap.from('.model-container', {
        opacity: 0,
        x: -50,
        duration: 1,
        scrollTrigger: {
            trigger: '.try-on-container',
            start: 'top 80%',
        }
    });

    gsap.from('.controls-container', {
        opacity: 0,
        x: 50,
        duration: 1,
        scrollTrigger: {
            trigger: '.try-on-container',
            start: 'top 80%',
        }
    });
}

// Video Showcase Functionality
function initVideoShowcase() {
    const mainVideo = document.getElementById('main-video');
    const playPauseBtn = document.querySelector('.play-pause-btn');
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');
    const timelineItems = document.querySelectorAll('.timeline-item');

    function updateMainVideo(item) {
        const videoSrc = item.getAttribute('data-video');
        const title = item.getAttribute('data-title');
        const description = item.getAttribute('data-description');
        
        gsap.to(mainVideo, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                mainVideo.src = videoSrc;
                mainVideo.play();
                videoTitle.textContent = title;
                videoDescription.textContent = description;
                gsap.to(mainVideo, {
                    opacity: 1,
                    duration: 0.5
                });
            }
        });

        timelineItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }

    timelineItems.forEach(item => {
        item.addEventListener('click', () => updateMainVideo(item));
    });

    playPauseBtn.addEventListener('click', () => {
        if (mainVideo.paused) {
            mainVideo.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            mainVideo.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    mainVideo.addEventListener('play', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });

    mainVideo.addEventListener('pause', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    // Initialize with the first video
    updateMainVideo(timelineItems[0]);

    // Animate timeline on scroll
    gsap.from('.timeline-item', {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
            trigger: '.video-timeline',
            start: 'top 80%',
        }
    });
}

// What's New Section
function initWhatsNewSection() {
    const whatsNewSwiper = new Swiper('.whats-new-carousel', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.whats-new-nav',
            clickable: true,
            renderBullet: function (index, className) {
                return '<div class="' + className + ' whats-new-nav-item"></div>';
            },
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
    });

    // Animate the What's New section
    gsap.from('.whats-new .section-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: '.whats-new',
            start: 'top 80%',
        }
    });

    gsap.from('.whats-new-slide', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.whats-new-carousel',
            start: 'top 80%',
        }
    });
}

// Smooth scroll for nav links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -100,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
}

// Navbar scroll effect
function initNavbarScrollEffect() {
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {className: 'navbar--scrolled', targets: '.navbar'}
    });
}

// Atelier section background animation
function animateAtelierSection() {
    const atelierSection = document.querySelector('.atelier-insights');

    ScrollTrigger.create({
        trigger: atelierSection,
        start: 'top center',
        onEnter: () => {
            gsap.to(atelierSection, {
                backgroundColor: "white",
                duration: 1,
                ease: 'power2.inOut'
            });
        },
        onLeaveBack: () => {
            gsap.to(atelierSection, {
                backgroundColor: "#f0ebe1",
                duration: 1,
                ease: 'power2.inOut'
            });
        }
    });
}

// Reveal Atelier section smoothly
function revealAtelierSection() {
    const atelierSection = document.querySelector('.atelier-insights');
    const whatsNewSection = document.querySelector('.whats-new');

    gsap.set(atelierSection, { yPercent: -100, zIndex: -1 });

    ScrollTrigger.create({
        trigger: whatsNewSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
            const progress = self.progress.toFixed(3);
            gsap.to(atelierSection, {
                yPercent: -100 + (progress * 100),
                ease: 'power2.out'
            });
        }
    });
}

// Add this new function
function initScatteredPhotos() {
    const photos = document.querySelectorAll('.photo');
    const fullscreenPhoto = document.querySelector('.fullscreen-photo');
    const fullscreenImg = fullscreenPhoto.querySelector('img');
    const closeBtn = document.querySelector('.close-btn');
    const photoFan = document.querySelector('.photo-fan');

    function arrangePhotos() {
        const fanAngle = 30; // Total angle of the fan
        const angleStep = fanAngle / (photos.length - 1);
        const startAngle = -fanAngle / 2;

        photos.forEach((photo, index) => {
            const angle = startAngle + (angleStep * index);
            const translateZ = -100 + (index * 10); // Adjust for overlapping
            photo.style.transform = `rotate(${angle}deg) translateZ(${translateZ}px)`;
            photo.style.zIndex = index;
        });
    }

    function spreadPhotos() {
        const spreadAngle = 60; // Total angle when spread
        const angleStep = spreadAngle / (photos.length - 1);
        const startAngle = -spreadAngle / 2;

        photos.forEach((photo, index) => {
            const angle = startAngle + (angleStep * index);
            photo.style.transform = `rotate(${angle}deg) translateZ(0) translateY(-50px)`;
            photo.style.zIndex = 10;
        });
    }

    function resetPhotos() {
        arrangePhotos();
    }

    photoFan.addEventListener('mouseenter', spreadPhotos);
    photoFan.addEventListener('mouseleave', resetPhotos);

    photos.forEach(photo => {
        photo.addEventListener('click', () => {
            const imgSrc = photo.getAttribute('data-img');
            fullscreenImg.src = imgSrc;
            fullscreenPhoto.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    closeBtn.addEventListener('click', () => {
        fullscreenPhoto.classList.remove('active');
        document.body.style.overflow = '';
    });

    fullscreenPhoto.addEventListener('click', (e) => {
        if (e.target === fullscreenPhoto) {
            fullscreenPhoto.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Initial arrangement
    arrangePhotos();

    // Animate photos on scroll
    gsap.from(photos, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.photo-fan',
            start: 'top 80%'
        }
    });
}



// Helper function to check if the device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Adjust animations for mobile devices
function adjustForMobile() {
    if (isMobile()) {
        // Reduce animation durations
        gsap.globalTimeline.timeScale(1.5);

        // Disable parallax effect on hero images for mobile
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.vars.trigger === '.hero') {
                trigger.kill();
            }
        });
    }
}

// Call this function after initializing animations
function initMobileOptimizations() {
    adjustForMobile();
    window.addEventListener('resize', adjustForMobile);
}

// Function to handle lazy loading of images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const config = {
        rootMargin: '50px 0px',
        threshold: 0.01
    };

    let observer = new IntersectionObserver((entries, self) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                preloadImage(entry.target);
                self.unobserve(entry.target);
            }
        });
    }, config);

    images.forEach(image => {
        observer.observe(image);
    });
}

function preloadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) { return; }
    img.src = src;
}

// Call this function after the DOM is loaded
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Kill ScrollTrigger on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});

// Initialize everything when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // The loader will handle calling initializeAllComponents()
});
