const syncTheme = () => {
    const section = document.getElementById('services-section');
    if (!section) return;
    const expanded = document.querySelector('.service.is-expanded');
    const theme = expanded ? expanded.dataset.theme : '';
    if (theme) section.dataset.theme = theme;
    else delete section.dataset.theme;
};

const assignTileStaggers = () => {
    document.querySelectorAll('.service').forEach((service) => {
        const tiles = Array.from(service.querySelectorAll('.service-grid .tile'));
        const order = tiles
            .map((_, index) => index)
            .sort(() => Math.random() - 0.5);

        order.forEach((tileIndex, sequenceIndex) => {
            const delay = 0.08 + sequenceIndex * 0.07;
            tiles[tileIndex].style.setProperty('--tile-delay', `${delay}s`);
        });
    });
};

const animateCount = (element) => {
    const target = Number(element.dataset.target || 0);
    if (!target) return;

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.max(1, Math.round(1 + (target - 1) * eased));
        element.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            element.textContent = target;
        }
    };

    requestAnimationFrame(tick);
};

const initMetricCounts = () => {
    const metricsSection = document.querySelector('.services-metrics');
    const counters = document.querySelectorAll('.count-up');

    if (!metricsSection || !counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            counters.forEach((counter, index) => {
                window.setTimeout(() => animateCount(counter), index * 160);
            });

            observer.disconnect();
        });
    }, {
        threshold: 0.35
    });

    observer.observe(metricsSection);
};

// Subtle Parallax Effect
const handleParallax = () => {
    const section = document.getElementById('services-section');
    const title = document.querySelector('.header-content');
    const hands = document.querySelector('.hands-container');
    const cards = document.querySelector('.services');

    if (!section || !title || !hands || !cards) return;

    const rect = section.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible) {
        const offset = Math.max(0, -rect.top);

        // Headline moves faster so it slides behind the hands more noticeably.
        title.style.transform = `translateY(${offset * 0.24}px)`;

        // Hands drift more slowly to create clearer separation between layers.
        hands.style.transform = `translateX(-50%) translateY(${offset * 0.06}px)`;

        // Cards keep a subtle counter-move for depth.
        cards.style.transform = `translateY(${offset * -0.04}px)`;
    } else {
        title.style.transform = '';
        hands.style.transform = 'translateX(-50%)';
        cards.style.transform = '';
    }
};

document.querySelectorAll('.service-header').forEach((header) => {
    header.addEventListener('click', () => {
        const service = header.closest('.service');
        if (service.classList.contains('is-expanded')) return;
        document.querySelectorAll('.service').forEach((s) => {
            s.classList.remove('is-expanded');
            s.querySelector('.service-header').setAttribute('aria-expanded', 'false');
        });
        service.classList.add('is-expanded');
        header.setAttribute('aria-expanded', 'true');
        syncTheme();
    });
});

window.addEventListener('scroll', handleParallax);
window.addEventListener('resize', handleParallax);

// Initial run
assignTileStaggers();
initMetricCounts();
syncTheme();
handleParallax();
