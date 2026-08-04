// Orbit System: 4 rings, 12 cards (3 per ring), stylish connectors
(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Solution cards data: 4 rings × 3 cards each
    // Each ring represents an industry, cards are solution types
    const orbitData = [
        // Ring 1: Dental (innermost, r=55)
        {
            ring: 1,
            radius: 55,
            industry: 'Dental',
            color: '#3EA8FF',
            cards: [
                { label: 'Traditional', href: 'services/traditional.html', icon: 'layout-dashboard', angle: -90 },
                { label: 'Custom', href: 'services/custom.html', icon: 'brain', angle: 30 },
                { label: 'Recommended', href: 'services/packages.html', icon: 'package', angle: 150 }
            ]
        },
        // Ring 2: Real Estate (r=110)
        {
            ring: 2,
            radius: 110,
            industry: 'Real Estate',
            color: '#63C8FF',
            cards: [
                { label: 'Traditional', href: 'services/traditional.html', icon: 'layout-dashboard', angle: -60 },
                { label: 'Custom', href: 'services/custom.html', icon: 'brain', angle: 60 },
                { label: 'Recommended', href: 'services/packages.html', icon: 'package', angle: 180 }
            ]
        },
        // Ring 3: Ecommerce (r=165)
        {
            ring: 3,
            radius: 165,
            industry: 'Ecommerce',
            color: '#3EC70B',
            cards: [
                { label: 'Traditional', href: 'services/traditional.html', icon: 'layout-dashboard', angle: -30 },
                { label: 'Custom', href: 'services/custom.html', icon: 'brain', angle: 90 },
                { label: 'Recommended', href: 'services/packages.html', icon: 'package', angle: 210 }
            ]
        },
        // Ring 4: Startups (outermost, r=210)
        {
            ring: 4,
            radius: 210,
            industry: 'Startups',
            color: '#FFC857',
            cards: [
                { label: 'Traditional', href: 'services/traditional.html', icon: 'layout-dashboard', angle: 0 },
                { label: 'Custom', href: 'services/custom.html', icon: 'brain', angle: 120 },
                { label: 'Recommended', href: 'services/packages.html', icon: 'package', angle: 240 }
            ]
        }
    ];

    const centerX = 215;
    const centerY = 215;
    const connectorsGroup = document.getElementById('orbit-connectors');
    const cardsContainer = document.getElementById('orbit-cards');

    if (!connectorsGroup || !cardsContainer) return;

    // Create SVG path for curved connector from ring to card
    function createConnectorPath(ringRadius, cardAngle, cardDistance) {
        const startAngle = cardAngle * Math.PI / 180;
        const endAngle = startAngle; // Same angle, just different radius

        const startX = centerX + Math.cos(startAngle) * ringRadius;
        const startY = centerY + Math.sin(startAngle) * ringRadius;
        const endX = centerX + Math.cos(endAngle) * cardDistance;
        const endY = centerY + Math.sin(endAngle) * cardDistance;

        // Create a curved path with a control point for organic feel
        const midRadius = (ringRadius + cardDistance) / 2;
        const ctrlAngle = startAngle + (Math.PI / 6) * (Math.random() > 0.5 ? 1 : -1); // Slight curve variation
        const ctrlX = centerX + Math.cos(ctrlAngle) * midRadius;
        const ctrlY = centerY + Math.sin(ctrlAngle) * midRadius;

        return `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
    }

    // Build connectors
    orbitData.forEach(ringData => {
        ringData.cards.forEach(card => {
            // Card position: slightly outside its ring
            const cardDistance = ringData.radius + 65;
            const angle = card.angle;
            const rad = angle * Math.PI / 180;
            const cardX = centerX + Math.cos(rad) * cardDistance;
            const cardY = centerY + Math.sin(rad) * cardDistance;

            // Create connector path
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', createConnectorPath(ringData.radius, angle, cardDistance));
            path.setAttribute('stroke', 'url(#connector-gradient)');
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-dasharray', '8 4');
            path.setAttribute('class', `orbit-connector orbit-connector-ring-${ringData.ring}`);
            path.style.opacity = '0.5';
            path.style.transition = 'opacity 0.3s ease, stroke-width 0.3s ease';
            connectorsGroup.appendChild(path);

            // Store card position for hover effects
            path.dataset.cardX = cardX;
            path.dataset.cardY = cardY;
            path.dataset.ring = ringData.ring;
            path.dataset.angle = angle;
        });
    });

    // Build cards
    orbitData.forEach(ringData => {
        ringData.cards.forEach((card, i) => {
            const angle = card.angle;
            const rad = angle * Math.PI / 180;
            const cardDistance = ringData.radius + 65;
            const x = centerX + Math.cos(rad) * cardDistance;
            const y = centerY + Math.sin(rad) * cardDistance;

            const cardEl = document.createElement('a');
            cardEl.href = card.href;
            cardEl.className = 'orbit-card';
            cardEl.style.left = `${x}px`;
            cardEl.style.top = `${y}px`;
            cardEl.style.transform = 'translate(-50%, -50%)';
            cardEl.dataset.ring = ringData.ring;
            cardEl.dataset.angle = angle;
            cardEl.setAttribute('data-industry', ringData.industry);

            // Lucide icon
            const iconMap = {
                'layout-dashboard': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
                'brain': 'M12 5a3 3 0 1 0-3 3c0 1.5 1 2.5 2 3 1-.5 2-1.5 2-3A3 3 0 1 0 12 5z M12 2a10 10 0 0 0-10 10c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5A10 10 0 0 0 12 2z',
                'package': 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.29 7L12 12l8.71-5 M12 22V12 M12 22l8.71-5 M12 22l-8.71-5'
            };

            cardEl.innerHTML = `
                <svg class="orbit-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="${iconMap[card.icon]}"/>
                </svg>
                <span class="orbit-card-label">${card.label}</span>
                <span class="orbit-card-industry">${ringData.industry}</span>
            `;

            cardsContainer.appendChild(cardEl);
        });
    });

    // Hover interactions
    const connectors = connectorsGroup.querySelectorAll('.orbit-connector');
    const cards = cardsContainer.querySelectorAll('.orbit-card');

    function highlightRing(ringNum, highlight) {
        const ringEl = document.querySelector(`.orbit-ring-${ringNum}`);
        if (ringEl) {
            ringEl.style.strokeWidth = highlight ? '3' : '2';
            ringEl.style.filter = highlight ? 'url(#ring-glow) drop-shadow(0 0 8px currentColor)' : 'url(#ring-glow)';
            ringEl.style.transition = 'stroke-width 0.3s ease, filter 0.3s ease';
        }
        connectors.forEach(conn => {
            if (parseInt(conn.dataset.ring) === ringNum) {
                conn.style.opacity = highlight ? '1' : '0.5';
                conn.style.strokeWidth = highlight ? '2.5' : '1.5';
            }
        });
    }

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const ring = parseInt(card.dataset.ring);
            highlightRing(ring, true);
        });
        card.addEventListener('mouseleave', () => {
            const ring = parseInt(card.dataset.ring);
            highlightRing(ring, false);
        });
    });

    // Animation: slow rotation of rings
    let rotation = 0;
    function animateRings() {
        if (prefersReduced) return;
        rotation += 0.02;
        const rings = document.querySelectorAll('.orbit-ring');
        rings.forEach((ring, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            ring.style.transform = `rotate(${rotation * dir}deg)`;
            ring.style.transformOrigin = '215px 215px';
        });
        // Rotate connectors group too
        if (connectorsGroup) {
            connectorsGroup.style.transform = `rotate(${rotation}deg)`;
            connectorsGroup.style.transformOrigin = '215px 215px';
        }
        // Cards counter-rotate to stay upright
        cards.forEach(card => {
            const angle = parseFloat(card.dataset.angle);
            const cardRot = -rotation + angle;
            card.style.transform = `translate(-50%, -50%) rotate(${cardRot}deg)`;
        });
        requestAnimationFrame(animateRings);
    }

    if (!prefersReduced) {
        animateRings();
    }

    // Pause on hover
    const wrap = document.getElementById('hero-rings-wrap');
    if (wrap) {
        wrap.addEventListener('mouseenter', () => { prefersReduced = true; });
        wrap.addEventListener('mouseleave', () => { prefersReduced = false; animateRings(); });
    }

    // Keyboard support
    cards.forEach(card => {
        card.addEventListener('focus', () => {
            const ring = parseInt(card.dataset.ring);
            highlightRing(ring, true);
        });
        card.addEventListener('blur', () => {
            const ring = parseInt(card.dataset.ring);
            highlightRing(ring, false);
        });
    });
})();