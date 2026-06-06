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
       3. Dynamic Magnetic Hover Glow (System Cards)
       -------------------------------------------------------------------------- */
    const cards = document.querySelectorAll(".system-card");
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
            maxWidth: "760px",
            y: 10,
            borderRadius: "30px",
            background: "rgba(4, 2, 12, 0.88)",
            borderColor: "rgba(99, 102, 241, 0.22)",
            boxShadow: "0 12px 35px -12px rgba(99, 102, 241, 0.25)",
            ease: "power2.out"
        });

        // Hero Entrance Sequencing Timeline
        const heroTimeline = gsap.timeline();
        heroTimeline.from(".hero-badge", { y: -30, opacity: 0, duration: 0.9, ease: "power4.out" })
                    .from(".hero-headline", { y: 40, opacity: 0, duration: 1.1, ease: "power4.out" }, "-=0.55")
                    .from(".hero-subtext", { y: 25, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.65")
                    .from(".hero-actions", { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.55")
                    .from(".scroll-indicator", { opacity: 0, duration: 0.6 }, "-=0.2");

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
                        stagger: { each: 0.08, from: "start", grid: [2, 4] },
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

        // Count-up + ring fill animation (loops every 5s)
        counterCards.forEach((card) => {
            const counterElement = card.querySelector(".counter");
            if (!counterElement) return;
            const targetVal = parseFloat(card.getAttribute("data-metric")) || 0;
            const ringFill = card.querySelector(".ring-fill");

            const tl = gsap.timeline({
                repeat: -1,
                repeatDelay: 2.6,
                scrollTrigger: {
                    trigger: "#dashboard",
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            });

            const valObj = { val: 0 };
            tl.to(valObj, {
                val: targetVal,
                duration: 2.4,
                ease: "power3.out",
                onUpdate: () => {
                    counterElement.textContent = Math.floor(valObj.val);
                }
            }, 0);

            if (ringFill) {
                tl.to(ringFill, {
                    strokeDashoffset: 0,
                    duration: 2.4,
                    ease: "power3.out"
                }, 0);
            }
        });

        // Staggered entry for main Systems Cards
        const systemsGrid = document.querySelector(".systems-grid");
        if (systemsGrid) {
            gsap.fromTo(".system-card", 
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.85,
                    stagger: 0.15,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: systemsGrid,
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

        // Universal link navigation active state highlights based on scrolling position
        const navLinks = document.querySelectorAll(".nav-link");
        const sections = document.querySelectorAll("section[id]");

        window.addEventListener("scroll", () => {
            let currentSec = "";
            sections.forEach((sec) => {
                const sectionTop = sec.offsetTop - 150;
                if (window.scrollY >= sectionTop) {
                    currentSec = sec.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${currentSec}`) {
                    link.classList.add("active");
                }
            });
        });
    }

    /* --------------------------------------------------------------------------
       5. The Impact Engine (Interactive Tabs Panel with GSAP Counter Parsing)
       -------------------------------------------------------------------------- */
    const tabBtns = document.querySelectorAll(".impact-tab-btn");
    const tabPanels = document.querySelectorAll(".impact-panel");

    // Dynamic numeric parser and smooth GSAP counter animator
    function animatePanelNumbers(panel) {
        // Query potential metrics, gauge labels, and graphics percentages in current active panel
        const numericSpans = panel.querySelectorAll(".metric-value, .gauge-value, .stage-bar span, .bar-pill span");
        
        numericSpans.forEach(span => {
            // Retrieve or cache initial state configurations
            const originalText = span.getAttribute("data-orig-text") || span.textContent.trim();
            if (!span.getAttribute("data-orig-text")) {
                span.setAttribute("data-orig-text", originalText);
            }

            // Regular expression to parse integer or float formats
            const numberMatch = originalText.match(/(-?[0-9.]+)/);
            if (numberMatch) {
                const targetValue = parseFloat(numberMatch[1]);
                const isDecimal = numberMatch[1].includes(".");
                const numIndex = originalText.indexOf(numberMatch[1]);
                
                const prefix = originalText.substring(0, numIndex);
                const suffix = originalText.substring(numIndex + numberMatch[1].length);

                const tweenVal = { val: 0 };
                
                // Count up to matching value
                gsap.fromTo(tweenVal, 
                    { val: 0 },
                    {
                        val: targetValue,
                        duration: 1.5,
                        ease: "power3.out",
                        onUpdate: () => {
                            let valueFormatted = isDecimal ? tweenVal.val.toFixed(1) : Math.round(tweenVal.val);
                            span.textContent = prefix + valueFormatted + suffix;
                        }
                    }
                );
            }
        });
    }

    window.switchImpactTab = function(index) {
        if (!tabBtns[index] || !tabPanels[index]) return;

        // Toggle active states
        tabBtns.forEach(btn => btn.classList.remove("active"));
        tabPanels.forEach(panel => panel.classList.remove("active"));

        tabBtns[index].classList.add("active");
        tabPanels[index].classList.add("active");

        // Smooth panel entry transition
        gsap.fromTo(tabPanels[index], 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );

        // Reset and re-run active metric progress bar animations
        const activeProgressBar = tabPanels[index].querySelectorAll(".metric-progress-bar");
        activeProgressBar.forEach(bar => {
            const finalWidth = bar.style.width || "100%";
            gsap.fromTo(bar, 
                { width: "0%" }, 
                { width: finalWidth, duration: 1.4, ease: "power3.out" }
            );
        });

        // Reset and re-run active funnel stage layouts
        const activeStageBars = tabPanels[index].querySelectorAll(".stage-bar");
        activeStageBars.forEach(bar => {
            const finalWidth = bar.style.width || "100%";
            gsap.fromTo(bar, 
                { width: "0%" }, 
                { width: finalWidth, duration: 1.4, ease: "power3.out" }
            );
        });

        // Reset and re-run active column comparison metrics
        const activeComparisonPills = tabPanels[index].querySelectorAll(".bar-pill");
        activeComparisonPills.forEach(pill => {
            const finalHeight = pill.style.height || "100%";
            gsap.fromTo(pill, 
                { height: "0%" }, 
                { height: finalHeight, duration: 1.4, ease: "power3.out" }
            );
        });

        // Reset and re-run active speedometer gauges
        const activeGauge = tabPanels[index].querySelector(".gauge-progress");
        if (activeGauge) {
            gsap.fromTo(activeGauge,
                { strokeDashoffset: 126 },
                { strokeDashoffset: 25, duration: 1.8, ease: "power2.out" }
            );
        }

        // Run the dynamic numerical count-up systems
        animatePanelNumbers(tabPanels[index]);
    };

    // System cards redirect links
    window.activateImpactTab = function(index) {
        // Switch tab immediately
        switchImpactTab(index);

        // Smoothly scroll to the Impact Engine section
        const targetSection = document.getElementById("impact");
        if (targetSection && lenis) {
            lenis.scrollTo(targetSection, { offset: -80, duration: 1.2 });
        } else if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

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
       6. Dynamic ROI & Pricing Calculator with smooth GSAP Counter state
       -------------------------------------------------------------------------- */
    const hoursSlider = document.getElementById("hours-slider");
    const laborSlider = document.getElementById("labor-slider");
    const swarmsSlider = document.getElementById("swarms-slider");

    const hoursVal = document.getElementById("hours-val");
    const laborVal = document.getElementById("labor-val");
    const swarmsVal = document.getElementById("swarms-val");

    const savingsVal = document.getElementById("savings-val");
    const roiFillBar = document.getElementById("roi-fill-bar");
    const roiPercentLabel = document.getElementById("roi-percent-label");
    const annualSavings = document.getElementById("annual-savings");
    const timeFreed = document.getElementById("time-freed");

    // Hold calculator numeric state internally for smooth transition tweens
    const calculatorState = {
        savings: 0,
        annualSavings: 0,
        timeFreed: 0,
        roiPercent: 0
    };

    function calculateROI(isFirstLoad = false) {
        if (!hoursSlider || !laborSlider || !swarmsSlider) return;

        const hours = parseInt(hoursSlider.value);
        const labor = parseInt(laborSlider.value);
        const swarms = parseInt(swarmsSlider.value);

        // Update active labels instant values
        hoursVal.textContent = hours;
        laborVal.textContent = labor;
        swarmsVal.textContent = swarms;

        // ROI Formula Calculations
        const targetSavings = (hours * labor) + (swarms * 450); // Labor saved + system-driven speed efficiency
        const targetCost = swarms * 950; // Custom deploy subscription model estimate
        const targetAnnualSavings = targetSavings * 12;
        const targetTimeFreed = hours * 12;
        const targetRoiPercent = Math.max(0, Math.ceil(((targetSavings - targetCost) / (targetCost || 1)) * 100));

        // Kill any previous calculator animations to avoid conflicts
        if (window.calculatorTween) window.calculatorTween.kill();

        if (isFirstLoad) {
            // Instant load alignment
            calculatorState.savings = targetSavings;
            calculatorState.annualSavings = targetAnnualSavings;
            calculatorState.timeFreed = targetTimeFreed;
            calculatorState.roiPercent = targetRoiPercent;

            savingsVal.textContent = targetSavings.toLocaleString();
            annualSavings.textContent = `$${targetAnnualSavings.toLocaleString()}`;
            timeFreed.textContent = `${targetTimeFreed.toLocaleString()} hrs`;
            roiPercentLabel.textContent = `ROI: +${targetRoiPercent}%`;
            
            const maxPercentWidth = Math.min(100, Math.max(10, targetRoiPercent / 5));
            roiFillBar.style.width = `${maxPercentWidth}%`;
        } else {
            // Smoothly tween calculator numbers using GSAP (financial-terminal counts)
            window.calculatorTween = gsap.to(calculatorState, {
                savings: targetSavings,
                annualSavings: targetAnnualSavings,
                timeFreed: targetTimeFreed,
                roiPercent: targetRoiPercent,
                duration: 0.65,
                ease: "power2.out",
                onUpdate: () => {
                    savingsVal.textContent = Math.round(calculatorState.savings).toLocaleString();
                    annualSavings.textContent = `$${Math.round(calculatorState.annualSavings).toLocaleString()}`;
                    timeFreed.textContent = `${Math.round(calculatorState.timeFreed).toLocaleString()} hrs`;
                    
                    const sign = calculatorState.roiPercent > 0 ? '+' : '';
                    roiPercentLabel.textContent = `ROI: ${sign}${Math.round(calculatorState.roiPercent)}%`;

                    // Animate the progress bar width nicely
                    const currentPercentWidth = Math.min(100, Math.max(10, calculatorState.roiPercent / 5));
                    gsap.set(roiFillBar, { width: `${currentPercentWidth}%` });
                }
            });
        }
    }

    // Bind slider listeners
    if (hoursSlider) {
        hoursSlider.addEventListener("input", () => calculateROI(false));
        laborSlider.addEventListener("input", () => calculateROI(false));
        swarmsSlider.addEventListener("input", () => calculateROI(false));
        
        // Initial setup run
        calculateROI(true);
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
