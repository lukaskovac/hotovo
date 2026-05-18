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

// Our Work — hover slows the carousel; drag scrubs its timeline manually
document.querySelectorAll('.ow-cases').forEach((cases) => {
    const track = cases.querySelector('.ow-cases-track');
    const DURATION = 45000;

    let anim = null;
    const getAnim = () => anim || (anim = track.getAnimations()[0]);

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startTime = 0;
    let halfWidth = 1;

    cases.addEventListener('mouseenter', () => {
        if (!dragging && getAnim()) getAnim().playbackRate = 0.5;
    });
    cases.addEventListener('mouseleave', () => {
        if (!dragging && getAnim()) getAnim().playbackRate = 1;
    });

    cases.addEventListener('pointerdown', (e) => {
        const a = getAnim();
        if (!a) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        halfWidth = track.scrollWidth / 2 || 1;
        startTime = Number(a.currentTime) || 0;
        a.pause();
        cases.setPointerCapture(e.pointerId);
        cases.classList.add('is-dragging');
    });

    cases.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        let t = startTime - (dx / halfWidth) * DURATION;
        t = ((t % DURATION) + DURATION) % DURATION;
        getAnim().currentTime = t;
    });

    const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        const a = getAnim();
        a.play();
        a.playbackRate = cases.matches(':hover') ? 0.5 : 1;
        cases.classList.remove('is-dragging');
    };
    cases.addEventListener('pointerup', endDrag);
    cases.addEventListener('pointercancel', endDrag);

    // Suppress link clicks that follow an actual drag
    cases.addEventListener('click', (e) => {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    track.addEventListener('dragstart', (e) => e.preventDefault());
});

// Our Work — seamless scroll: clone track content so animation can loop at -50%
document.querySelectorAll('.ow-cases-track').forEach((track) => {
    const clone = track.innerHTML;
    track.insertAdjacentHTML('beforeend', clone);
});

// Our Work — stamp data-text so ::after can reserve bold width, preventing layout shift
document.querySelectorAll('.ow-tab').forEach((tab) => {
    const textSpan = tab.querySelector('.ow-tab-text');
    if (textSpan) {
        textSpan.dataset.text = textSpan.textContent.trim();
    }
});

// Our Work — desktop tabs
document.querySelectorAll('.ow-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
        const key = tab.dataset.tab;
        if (key === 'other') return;
        document.querySelectorAll('.ow-tab').forEach((t) => {
            const active = t === tab;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('.ow-panel').forEach((p) => {
            const active = p.dataset.panel === key;
            p.classList.toggle('is-active', active);
            p.classList.toggle('is-open', active);
            const accHeader = p.querySelector('.ow-acc-header');
            if (accHeader) {
                accHeader.setAttribute('aria-expanded', active ? 'true' : 'false');
            }
        });
    });
});

// Our Work — mobile accordion
document.querySelectorAll('.ow-acc-header').forEach((header) => {
    header.addEventListener('click', () => {
        const panel = header.closest('.ow-panel');
        const key = panel.dataset.panel;
        if (key === 'other') return;
        const willOpen = !panel.classList.contains('is-open');
        document.querySelectorAll('.ow-panel').forEach((p) => {
            p.classList.remove('is-open');
            p.querySelector('.ow-acc-header').setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
            panel.classList.add('is-open');
            header.setAttribute('aria-expanded', 'true');
            
            // Also sync active desktop tab!
            document.querySelectorAll('.ow-tab').forEach((t) => {
                const active = t.dataset.tab === key;
                t.classList.toggle('is-active', active);
                t.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            document.querySelectorAll('.ow-panel').forEach((p) => {
                p.classList.toggle('is-active', p.dataset.panel === key);
            });
        }
    });
});

window.addEventListener('scroll', handleParallax);
window.addEventListener('resize', handleParallax);

// Initial run
assignTileStaggers();
initMetricCounts();
syncTheme();
handleParallax();
