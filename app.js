/* ==========================================================================
   BADAR EDGE - INTERACTIVE WEB INTERFACES (VANILLA ES6)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // Initialize Lucide Icons (fallback if inline script missed)
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Also watch for dynamically added icons (e.g., after form submission)
    document.addEventListener("lucide-update", () => {
        if (typeof lucide !== "undefined") lucide.createIcons();
    });

    /* --------------------------------------------------------------------------
       1. Smooth Scrolling (Lenis) & GSAP ScrollTrigger Integration
       -------------------------------------------------------------------------- */
    let lenis;
    if (typeof Lenis !== "undefined") {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom premium ease-out
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1.1,
            infinite: false,
        });

        // Sync ScrollTrigger with Lenis
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
            
            lenis.on('scroll', ScrollTrigger.update);
            
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }

    /* --------------------------------------------------------------------------
       2. HTML5 Canvas Neural Network Background (60fps High-DPI Optimized)
       -------------------------------------------------------------------------- */
    const canvas = document.getElementById("neural-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");

        let width = window.innerWidth;
        let height = window.innerHeight;
        let nodes = [];
        let mouse = { x: null, y: null, radius: 150 };
        let maxNodes = width < 768 ? 40 : 85; // Scale density by device width
        const connectionDistance = 110;
        let animationFrameId;

        // Resize handler that compensates for high-DPI/Retina displays
        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
            
            maxNodes = width < 768 ? 40 : 85;
            initNodes();
        }

        // Node blueprint
        class Node {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.baseRadius = Math.random() * 2 + 1.5;
                this.radius = this.baseRadius;
                this.color = "rgba(168, 85, 247, 0.45)"; // Soft neon violet nodes
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Reactive repel logic from mouse cursor
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        
                        // Push away from cursor smoothly
                        const pushX = Math.cos(angle) * force * 1.5;
                        const pushY = Math.sin(angle) * force * 1.5;
                        
                        this.x += pushX;
                        this.y += pushY;
                        
                        // Expand slightly when interacted with
                        this.radius = this.baseRadius + force * 2.5;
                    } else {
                        this.radius = this.baseRadius;
                    }
                } else {
                    this.radius = this.baseRadius;
                }

                // Bleed edge boundary wrapping instead of rigid bounces for fluid continuity
                const margin = 20;
                if (this.x < -margin) this.x = width + margin;
                if (this.x > width + margin) this.x = -margin;
                if (this.y < -margin) this.y = height + margin;
                if (this.y > height + margin) this.y = -margin;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                
                // Add soft neon aura glow to expanded nodes
                if (this.radius > this.baseRadius + 0.5) {
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
                }
                ctx.fill();
                ctx.shadowBlur = 0; // Reset shadow state for connection rendering
            }
        }

        // Initialize neural node list
        function initNodes() {
            nodes = [];
            for (let i = 0; i < maxNodes; i++) {
                nodes.push(new Node());
            }
        }

        // Track cursor positions
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        // Canvas animation frame loop
        function animateNeuralGrid() {
            ctx.clearRect(0, 0, width, height);

            // Connect nearest nodes
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].update();
                nodes[i].draw();

                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        // Blend line opacity based on connection distance
                        const alpha = (1 - dist / connectionDistance) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);

                        // High fidelity transition: Color change & glowing lines when nodes interact with mouse
                        let isGlowing = false;
                        if (mouse.x !== null && mouse.y !== null) {
                            const mdx1 = mouse.x - nodes[i].x;
                            const mdy1 = mouse.y - nodes[i].y;
                            const mdist1 = Math.sqrt(mdx1 * mdx1 + mdy1 * mdy1);

                            const mdx2 = mouse.x - nodes[j].x;
                            const mdy2 = mouse.y - nodes[j].y;
                            const mdist2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2);

                            if (mdist1 < mouse.radius || mdist2 < mouse.radius) {
                                isGlowing = true;
                            }
                        }

                        if (isGlowing) {
                            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 2})`; // Glowing neon cyan
                            ctx.lineWidth = 1.1;
                        } else {
                            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`; // Soft indigo base
                            ctx.lineWidth = 0.65;
                        }
                        ctx.stroke();
                    }
                }

                // Interactive spiderweb connection directly to mouse pointer
                if (mouse.x !== null && mouse.y !== null) {
                    const mdx = mouse.x - nodes[i].x;
                    const mdy = mouse.y - nodes[i].y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                    if (mdist < mouse.radius) {
                        const alpha = (1 - mdist / mouse.radius) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                        ctx.lineWidth = 1.0;
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animateNeuralGrid);
        }

        // Run network loops
        animateNeuralGrid();

        // Energy saving link: Pause animation when the browser is backgrounded
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animateNeuralGrid();
            }
        });
    }

    /* --------------------------------------------------------------------------
        3. Dynamic Magnetic Hover Glow (Solution Cards)
        -------------------------------------------------------------------------- */
    const cards = document.querySelectorAll(".solution-card");
    cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });

    /* --------------------------------------------------------------------------
       4. GSAP Entrance & ScrollTrigger Animations
       -------------------------------------------------------------------------- */
    if (typeof gsap !== "undefined") {
        
        // Custom Navbar Floating Dock Morph Trigger
        gsap.to("#floating-dock", {
            scrollTrigger: {
                trigger: "body",
                start: "100px top",
                end: "220px top",
                scrub: true,
            },
            maxWidth: "640px",
            y: 10,
            borderRadius: "30px",
            background: "rgba(4, 2, 12, 0.88)",
            borderColor: "rgba(99, 102, 241, 0.22)",
            boxShadow: "0 12px 35px -12px rgba(99, 102, 241, 0.25)",
            ease: "power2.out"
        });

        // Hero Entrance Sequencing Timeline
        const heroTimeline = gsap.timeline();
        heroTimeline.from(".hero-headline", { y: 40, opacity: 0, duration: 1.1, ease: "power4.out" })
                    .from(".hero-subtext", { y: 25, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.65")
                    .from(".hero-actions", { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.55");

        // Nav logo typewriter: write in 2s, hold 10s, remove backward, repeat
        const navLogo = document.getElementById("navLogo");
        if (navLogo) {
            const text = navLogo.textContent;
            navLogo.textContent = '';
            text.split('').forEach((char) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.className = 'char';
                span.style.opacity = '0';
                navLogo.appendChild(span);
            });
            const chars = Array.from(navLogo.querySelectorAll('.char'));
            function startLoop() {
                const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(0.3, startLoop) });
                tl.to(chars, { opacity: 1, duration: 0.08, stagger: 0.2, ease: 'none' });
                tl.to({}, { duration: 10 });
                tl.to([...chars].reverse(), { opacity: 0, duration: 0.06, stagger: 0.04, ease: 'none' });
            }
            gsap.delayedCall(0.5, startLoop);
        }

        // Universal Title/Subtitle ScrollTrigger reveal
        gsap.utils.toArray(".section-header").forEach(header => {
            gsap.fromTo(header, 
                { opacity: 0, y: 30 },
                {
                    opacity: 1, 
                    y: 0, 
                    duration: 1, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: header,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // Live Dashboard animations
        const counterCards = document.querySelectorAll(".stat-card");

        // Staggered card entry — wave from top-left
        if (counterCards.length > 0) {
            const mm = gsap.matchMedia();
            mm.add("(min-width: 769px)", () => {
                gsap.fromTo(".stat-card",
                    { opacity: 0, y: 50, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        stagger: { each: 0.08, from: "start" },
                        ease: "power4.out",
                        scrollTrigger: {
                            trigger: ".db-grid",
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            });
            mm.add("(max-width: 768px)", () => {
                gsap.fromTo(".stat-card",
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: ".db-grid",
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            });
        }

        // Count-up animation — smooth count-up once on scroll
        counterCards.forEach((card) => {
            const counterElement = card.querySelector(".counter");
            if (!counterElement) return;
            const targetVal = parseFloat(card.getAttribute("data-metric")) || 0;
            const ringFill = card.querySelector(".ring-fill");

            const valObj = { val: 0 };
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#impact",
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });

            tl.to(valObj, {
                val: targetVal,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    counterElement.textContent = Math.floor(valObj.val);
                }
            });

            if (ringFill) {
                tl.to(ringFill, { strokeDashoffset: 0, duration: 2, ease: "power2.out" }, 0);
            }
        });

        // Benchmark count-up animation (loops every 5s)
        const benchmarkCounts = document.querySelectorAll(".bm-count");
        if (benchmarkCounts.length > 0) {
            const benchmarkTrigger = document.querySelector(".benchmarks-grid") || document.querySelector("#solutions");
            benchmarkCounts.forEach((el) => {
                const target = parseInt(el.getAttribute("data-target")) || 0;
                const valObj = { val: 0 };
                const tl = gsap.timeline({
                    repeat: -1,
                    repeatDelay: 2.6,
                    paused: true,
                    scrollTrigger: {
                        trigger: benchmarkTrigger,
                        start: "top 75%",
                        toggleActions: "play none none none"
                    }
                });
                tl.to(valObj, {
                    val: target,
                    duration: 2.2,
                    ease: "power3.out",
                    onUpdate: () => {
                        el.textContent = Math.floor(valObj.val);
                    }
                });
                tl.to(valObj, {
                    val: 0,
                    duration: 0.01,
                    ease: "none",
                    onUpdate: () => {
                        el.textContent = "0";
                    }
                }, "+=2.6");
            });
        }

        // Solutions section header entry
        const solutionsHeader = document.querySelector("#solutions .section-header");
        if (solutionsHeader) {
            gsap.fromTo(solutionsHeader,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                    scrollTrigger: {
                        trigger: solutionsHeader,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Enhanced solutions hub — premium staggered entry
        const solutionsHub = document.querySelector(".solutions-hub");
        if (solutionsHub) {
            gsap.fromTo(solutionsHub.querySelector(".hub-node"),
                { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" },
                {
                    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
                    duration: 0.8, ease: "power3.out",
                    scrollTrigger: {
                        trigger: solutionsHub,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
            gsap.fromTo(solutionsHub.querySelectorAll(".hub-branch-line"),
                { scaleY: 0, opacity: 0 },
                {
                    scaleY: 1, opacity: 1,
                    duration: 0.5,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: solutionsHub,
                        start: "top 75%",
                        toggleActions: "play none none none"
                    }
                }
            );
            gsap.fromTo(solutionsHub.querySelectorAll(".hub-branch-card"),
                { opacity: 0, y: 30, scale: 0.95, filter: "blur(3px)" },
                {
                    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
                    duration: 0.9,
                    stagger: 0.2,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: solutionsHub,
                        start: "top 75%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Hub WhatsApp CTA entry
        const hubWA = document.querySelector(".hub-whatsapp-cta");
        if (hubWA) {
            gsap.fromTo(hubWA,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
                    scrollTrigger: {
                        trigger: hubWA,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Staggered entry for Solution Cards

        // Staggered entry for Solution Cards
        const solutionCards = document.querySelectorAll(".solution-card-grid");
        solutionCards.forEach(grid => {
            gsap.fromTo(grid.querySelectorAll(".solution-card"), 
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.85,
                    stagger: 0.15,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: grid,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // Problem section cards entry
        const problemGrid = document.querySelector(".problem-grid");
        if (problemGrid) {
            gsap.fromTo(".problem-card", 
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: problemGrid,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Problem outcome line animation
        const outcomeLine = document.querySelector(".problem-outcome");
        if (outcomeLine) {
            gsap.fromTo(outcomeLine, 
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: outcomeLine,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Speed-to-Lead deep dive entry
        const stlDeepdive = document.querySelector(".stl-deepdive");
        if (stlDeepdive) {
            gsap.fromTo(stlDeepdive, 
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: stlDeepdive,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Problem stats strip — entrance + count-up
        const stlStats = document.querySelectorAll(".stl-problem-stat");
        if (stlStats.length > 0) {
            const stlST = {
                trigger: ".stl-problem-strip",
                start: "top 82%",
                toggleActions: "play none none none"
            };
            gsap.fromTo(stlStats, 
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: stlST
                }
            );
            stlStats.forEach(stat => {
                const target = parseInt(stat.dataset.target) || 0;
                const prefix = stat.dataset.prefix || '';
                const suffix = stat.dataset.suffix || '';
                const numEl = stat.querySelector(".stl-stat-num");
                if (!numEl) return;
                const valObj = { val: 0 };
                gsap.to(valObj, {
                    val: target,
                    duration: 1.8,
                    ease: "power3.out",
                    scrollTrigger: stlST,
                    onUpdate: () => {
                        numEl.textContent = prefix + Math.floor(valObj.val) + suffix;
                    }
                });
            });
        }

        // Benefit items staggered
        const benefitGrid = document.querySelector(".stl-benefit-grid");
        if (benefitGrid) {
            gsap.fromTo(".stl-benefit-item", 
                { opacity: 0, x: -20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: benefitGrid,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Category badges hover glow (subtle entrance)
        gsap.utils.toArray(".cat-badge").forEach(badge => {
            gsap.fromTo(badge,
                { opacity: 0, scale: 0.9 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: badge,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // Workflow steps staggered entry
        const workflowContainer = document.querySelector(".workflow-container");
        if (workflowContainer) {
            gsap.fromTo(".workflow-step", 
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: workflowContainer,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // ROI Scenario cards entry
        const roiScenarios = document.querySelector(".roi-scenarios");
        if (roiScenarios) {
            gsap.fromTo(".roi-scenario-card", 
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: roiScenarios,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Why Badar section presentation sequence
        const whyGrid = document.querySelector(".why-grid");
        if (whyGrid) {
            gsap.fromTo(".why-card", 
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.0,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: whyGrid,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Process step sequential lighting scroll triggers
        const processSteps = document.querySelectorAll(".process-step");
        
        // Entrance animation for steps
        if (processSteps.length > 0) {
            gsap.fromTo(".process-step",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".process-timeline",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Lighting activation highlights
        processSteps.forEach((step, idx) => {
            gsap.to(step, {
                scrollTrigger: {
                    trigger: step,
                    start: "top 80%",
                    end: "bottom 50%",
                    toggleClass: { targets: step, className: "active" },
                    onEnter: () => {
                        // Dynamically fill the pipeline timeline progress tracker bar
                        const timelineFill = document.getElementById("timeline-progress");
                        if (timelineFill) {
                            const progressPercentage = ((idx + 1) / processSteps.length) * 100;
                            gsap.to(timelineFill, { width: `${progressPercentage}%`, duration: 0.5, ease: "power2.out" });
                        }
                    }
                }
            });
        });

        // Sidebar link active state highlights based on scrolling position
        const sidebarLinks = document.querySelectorAll(".sidebar-link");
        const sidebarSections = document.querySelectorAll("section[id]");

        window.addEventListener("scroll", () => {
            let currentSec = "";
            sidebarSections.forEach((sec) => {
                const sectionTop = sec.offsetTop - 150;
                if (window.scrollY >= sectionTop) {
                    currentSec = sec.getAttribute("id");
                }
            });

            sidebarLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${currentSec}`) {
                    link.classList.add("active");
                }
            });
        });

        // Sidebar toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const sidebarClose = document.getElementById('sidebar-close');

        if (menuToggle && sidebar && overlay && sidebarClose) {
            function openSidebar() {
                sidebar.classList.add('open');
                overlay.classList.add('open');
                document.body.style.overflow = 'hidden';
            }

            function closeSidebar() {
                sidebar.classList.remove('open');
                overlay.classList.remove('open');
                document.body.style.overflow = '';
            }

            menuToggle.addEventListener('click', openSidebar);
            sidebarClose.addEventListener('click', closeSidebar);
            overlay.addEventListener('click', closeSidebar);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeSidebar();
            });

            // Close sidebar on link click
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.addEventListener('click', closeSidebar);
            });
        }
    }

    // ROI bar width animation on scroll
    const roiBars = document.querySelectorAll(".roi-bar[data-width]");
    if (roiBars.length > 0) {
        roiBars.forEach(bar => {
            gsap.to(bar, {
                width: bar.dataset.width,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: bar.closest(".roi-scenario-card"),
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });
        });
    }

    // ROI counter animation on scroll
    const roiCounters = document.querySelectorAll(".roi-counter");
    if (roiCounters.length > 0) {
        roiCounters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            if (isNaN(target)) return;
            gsap.fromTo(counter,
                { textContent: 0 },
                {
                    textContent: target,
                    duration: 2,
                    ease: "power2.out",
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: counter.closest(".roi-scenario-card"),
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });
    }

    // ROI magnetic hover effect
    document.querySelectorAll(".roi-scenario-card").forEach(card => {
        const glow = card.querySelector(".roi-scenario-card-glow");
        if (!glow) return;
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            glow.style.setProperty("--mx", x + "%");
            glow.style.setProperty("--my", y + "%");
        });
    });

    // ROI card click highlight + auto-rotate
    const roiCards = document.querySelectorAll(".roi-scenario-card");
    let roiRotateTimer = null;
    let roiActiveIdx = -1;

    function activateROICard(index) {
        roiCards.forEach((c, i) => c.classList.toggle("active", i === index));
        roiActiveIdx = index;
        resetROIRotateTimer();
    }

    function resetROIRotateTimer() {
        if (roiRotateTimer) clearTimeout(roiRotateTimer);
        roiRotateTimer = setTimeout(() => {
            const next = (roiActiveIdx + 1) % roiCards.length;
            activateROICard(next);
        }, 4000);
    }

    if (roiCards.length > 0) {
        roiCards.forEach((card, idx) => {
            card.addEventListener("click", () => activateROICard(idx));
        });
        // Start auto-rotate with first card active
        activateROICard(0);
    }

    // Pricing tier cards scroll entrance
    const allPricingTiers = document.querySelectorAll(".pricing-tier");
    if (allPricingTiers.length > 0 && typeof gsap !== "undefined") {
        gsap.fromTo(allPricingTiers,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.06,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "#pricing",
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            }
        );
    }

    /* --------------------------------------------------------------------------
       7. Conversational Form Submission, Validation & Confetti celebration
       -------------------------------------------------------------------------- */
    const leadForm = document.getElementById("lead-capture-form");
    
    if (leadForm) {
        const nameInput = document.getElementById("client-name");
        const emailInput = document.getElementById("client-email");
        const serviceSelect = document.getElementById("client-service");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function invalidateField(input) {
            input.classList.add("input-error");
            input.style.borderColor = "#ef4444";
            input.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.35)";
            gsap.fromTo(input, 
                { x: -10 },
                { 
                    x: 10, 
                    duration: 0.08, 
                    repeat: 5, 
                    yoyo: true, 
                    ease: "power1.inOut",
                    onComplete: () => gsap.set(input, { x: 0 }) 
                }
            );
        }

        function validateField(input) {
            input.classList.remove("input-error");
            input.style.borderColor = "";
            input.style.boxShadow = "";
        }

        nameInput.addEventListener("input", () => {
            if (nameInput.value.trim().length >= 2) validateField(nameInput);
        });

        emailInput.addEventListener("input", () => {
            if (emailRegex.test(emailInput.value.trim())) validateField(emailInput);
        });

        serviceSelect.addEventListener("change", () => {
            if (serviceSelect.value) validateField(serviceSelect);
        });

        window.handleFormSubmit = function(event) {
            event.preventDefault();

            const isNameValid = nameInput.value.trim().length >= 2;
            const isEmailValid = emailRegex.test(emailInput.value.trim());
            const isServiceValid = serviceSelect.value && serviceSelect.value !== "";

            if (!isNameValid) { invalidateField(nameInput); nameInput.focus(); return; }
            if (!isEmailValid) { invalidateField(emailInput); emailInput.focus(); return; }
            if (!isServiceValid) { invalidateField(serviceSelect); serviceSelect.focus(); return; }

            const submitBtn = leadForm.querySelector("button[type='submit']");
            const successState = document.getElementById("form-success");

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending Request...</span><i data-lucide='loader-2' class='icon-small icon-animate-spin'></i>`;
            lucide.createIcons();

            const formData = {
                name: leadForm.querySelector('[name="name"]').value,
                email: leadForm.querySelector('[name="email"]').value,
                phone: leadForm.querySelector('[name="phone"]').value,
                service: leadForm.querySelector('[name="service"]').value,
                background: leadForm.querySelector('[name="background"]').value,
                _replyto: leadForm.querySelector('[name="email"]').value
            };

            fetch("https://formspree.io/f/xeeddbvv", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            .then(response => {
                if (response.ok) {
                    leadForm.classList.add("hide-state");
                    successState.classList.remove("hide-state");
                    successState.classList.add("show-state");

                    gsap.fromTo(successState,
                        { opacity: 0, scale: 0.9 },
                        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
                    );

                    if (typeof confetti !== "undefined") {
                        const confettiDuration = 3.5 * 1000;
                        const stopTime = Date.now() + confettiDuration;
                        (function burstFrame() {
                            confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0.05, y: 0.75 }, colors: ['#06b6d4', '#a855f7', '#6366f1'] });
                            confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 0.95, y: 0.75 }, colors: ['#06b6d4', '#a855f7', '#6366f1'] });
                            if (Date.now() < stopTime) requestAnimationFrame(burstFrame);
                        }());
                    }
                } else {
                    throw new Error("Formspree error");
                }
            })
            .catch(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Send Inquiry</span><i data-lucide="send" class="icon-small"></i>`;
                lucide.createIcons();
            });
        };
    }
});
