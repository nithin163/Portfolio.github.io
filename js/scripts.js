// ==========================================================================
//   Core Scripts: Elite SOC Analyst Portfolio
//   Handles GSAP animations, Vanta.js background, Quiz logic, and Nav.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------------------
       1. Navigation & Mobile Menu
    ----------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect for navbar (Glassmorphism trigger)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('ph-list', 'ph-x');
        } else {
            icon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Smooth scroll offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active');
            mobileBtn.querySelector('i').classList.replace('ph-x', 'ph-list');

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    /* -----------------------------------------------------------
       2. Vanta.js 3D Background Initialization
    ----------------------------------------------------------- */
    if (window.VANTA) {
        window.VANTA.NET({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x00f3ff,
            backgroundColor: 0x030610,
            points: 12.00,
            maxDistance: 22.00,
            spacing: 20.00,
            showDots: true
        });
    }

    /* -----------------------------------------------------------
       3. GSAP & ScrollTrigger Animations
    ----------------------------------------------------------- */
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Entrance
    const heroTl = gsap.timeline();
    heroTl.from('.terminal-badge', { y: -20, opacity: 0, duration: 0.6, ease: "power3.out" })
        .from('.hero-title', { x: -30, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .from('.typewriter-wrapper', { opacity: 0, duration: 1, stagger: 0.2 }, "-=0.2")
        .from('.hero-description', { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from('.hero-actions a', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.4")
        .from('.hero-graphics', { scale: 0.9, opacity: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" }, "-=1");

    // Generic Fade Up Elements
    gsap.utils.toArray('.gs-fade-up').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });
    });

    // Timeline nodes (Experience Section)
    gsap.utils.toArray('.gs-timeline-item').forEach(item => {
        const node = item.querySelector('.timeline-node');
        const content = item.querySelector('.timeline-content');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 80%"
            }
        });

        tl.from(node, { scale: 0, duration: 0.4, ease: "back.out(2)" })
            .from(content, { x: -30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.2");
    });

    // Counters (Cyber Stats Section)
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        ScrollTrigger.create({
            trigger: counter,
            start: "top 90%",
            once: true,
            onEnter: () => {
                const target = +counter.getAttribute('data-target');
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    snap: { innerHTML: 1 },
                    ease: "power1.out"
                });
            }
        });
    });

    /* -----------------------------------------------------------
       4. Mini-CTF Quiz Logic
    ----------------------------------------------------------- */
    const quizData = [
        {
            question: "Analyze the following log snippet: `Failed password for root from 192.168.1.100 port 22 ssh2`. If this repeats 50 times in 1 minute, what attack is likely occurring?",
            options: ["SQL Injection", "DDoS Attack", "SSH Brute Force", "Cross-Site Scripting"],
            answer: 2
        },
        {
            question: "Which MITRE ATT&CK tactic involves adversaries trying to maintain their foothold in a network?",
            options: ["Privilege Escalation", "Persistence", "Lateral Movement", "Exfiltration"],
            answer: 1
        },
        {
            question: "When investigating a suspicious email, which header field is most critical for verifying the true sender's server path and avoiding spoofing?",
            options: ["Subject", "Reply-To", "Received", "X-Priority"],
            answer: 2
        }
    ];

    let currentQuestion = 0;
    const qText = document.getElementById('q-text');
    const qOptions = document.getElementById('q-options');
    const qFeedback = document.getElementById('q-feedback');

    function loadQuestion() {
        if (currentQuestion >= quizData.length) {
            // Quiz Complete
            qText.innerHTML = `<span class="prompt">root@soc:~#</span> <span style="color:#0df268">ASSESSMENT_COMPLETE. Profile rating: Excellent.</span>`;
            qOptions.innerHTML = "";
            qFeedback.innerHTML = "> Access Granted. Proceed to Resume review.";
            return;
        }

        const current = quizData[currentQuestion];
        qText.innerHTML = `<span class="prompt">root@soc:~#</span> ${current.question}`;
        qOptions.innerHTML = "";
        qFeedback.innerHTML = "";

        current.options.forEach((opt, index) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.textContent = `[${index + 1}] ${opt}`;
            btn.addEventListener('click', () => handleAnswer(index, btn, current.answer));
            qOptions.appendChild(btn);
        });
    }

    function handleAnswer(selectedIndex, btnElement, correctIndex) {
        // Disable all buttons temporarily
        const allBtns = document.querySelectorAll('.quiz-option');
        allBtns.forEach(b => b.style.pointerEvents = 'none');

        if (selectedIndex === correctIndex) {
            btnElement.classList.add('correct');
            qFeedback.innerHTML = "<span style='color: #0df268;'>[+] VALID_MATCH: Correct alignment. Moving to next vector...</span>";
            setTimeout(() => {
                currentQuestion++;
                loadQuestion();
            }, 1500);
        } else {
            btnElement.classList.add('wrong');
            qFeedback.innerHTML = "<span style='color: #ff5f56;'>[-] ALERT: Incorrect. Recalculate logic and retry.</span>";
            setTimeout(() => {
                btnElement.classList.remove('wrong');
                allBtns.forEach(b => b.style.pointerEvents = 'auto');
            }, 800);
        }
    }

    // Init first question
    loadQuestion();

});
