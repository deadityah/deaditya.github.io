// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Master Timeline tied to the pinned hero section
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero-pinned",
      start: "top top",
      end: "+=1800", // Tightened runway for Stages 1 to 4 with zero dead space
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: false
    }
  });

  // Set explicit initial transform states:
  // Portrait anchored toward the bottom edge (avoiding any bottom crop)
  gsap.set("#portraitLayer", { xPercent: -50, yPercent: 0, left: "50%", bottom: 0, top: "auto", autoAlpha: 1, x: 0, y: 0 });
  gsap.set("#stageIntro", { autoAlpha: 0 });
  gsap.set("#stageAbout", { autoAlpha: 0, x: 0, y: 0 });
  gsap.set("#stageSkills", { autoAlpha: 0 });

  // Fast, subtle page load animation (< 1.5s) before hero settles
  const pageIntroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
  pageIntroTl.fromTo("#outlineTextLayer",
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.85 }
  )
  .fromTo(".float-card-1",
    { opacity: 0, y: -20, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6 },
    "-=0.45"
  );

  // Live Typing Effect for Hero Terminal Badge
  function initHeroTypingEffect() {
    const badge = document.getElementById("heroTerminalBadge");
    const textEl = document.getElementById("heroTerminalText");
    if (!badge || !textEl) return;

    const fullText = "initializing_portfolio.exe --mode=fullstack --ai=enabled";
    let charIdx = 0;

    gsap.to(badge, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.2,
      ease: "power2.out",
      onComplete: () => {
        const timer = setInterval(() => {
          if (charIdx < fullText.length) {
            textEl.textContent += fullText.charAt(charIdx);
            charIdx++;
          } else {
            clearInterval(timer);
          }
        }, 34);
      }
    });
  }

  initHeroTypingEffect();

  // Stage 2: Photo slides right, PORTFOLIO text & terminal badge fade out, expanded intro fades in
  const stage2Start = 0.05;

  heroTl.to(["#outlineTextLayer", "#heroTerminalBadge"], {
    opacity: 0,
    ease: "power2.out",
    duration: 0.6
  }, stage2Start);

  heroTl.to("#portraitLayer", {
    x: () => window.innerWidth <= 768 ? 0 : window.innerWidth * 0.22,
    ease: "power2.out",
    duration: 0.8
  }, stage2Start);

  heroTl.fromTo("#stageIntro",
    { autoAlpha: 0, y: 30 },
    { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.8 },
    stage2Start
  );

  // Concise buffer between Stage 2 and Stage 3
  heroTl.to({}, { duration: 0.5 });

  // Stage 3: Fade out intro, fade in About Me description
  const stage3Start = 1.35;

  heroTl.to("#stageIntro", {
    autoAlpha: 0,
    y: -20,
    ease: "power2.inOut",
    duration: 0.45
  }, stage3Start);

  heroTl.fromTo("#stageAbout",
    { autoAlpha: 0, y: 30, x: 0 },
    { autoAlpha: 1, y: 0, x: 0, ease: "power2.out", duration: 0.6 },
    stage3Start + 0.25
  );

  // Buffer between Stage 3 and Stage 4
  heroTl.to({}, { duration: 0.5 });

  // Stage 4 (Core Capabilities):
  // 1. About Me text exits by sliding to the LEFT while fading out
  // 2. Photo (self.png) exits by moving UP while fading out
  // 3. Smooth crossfade of background from 'main background.png' to custom dark tech mesh
  // 4. Reveal balanced two-column Core Capabilities
  const stage4Start = 2.45;

  // About Me text exits by sliding to the LEFT while fading out
  heroTl.to("#stageAbout", {
    x: -140,
    autoAlpha: 0,
    ease: "power2.inOut",
    duration: 0.6
  }, stage4Start);

  // Photo exits by moving UP while fading out
  heroTl.to("#portraitLayer", {
    y: -140,
    autoAlpha: 0,
    ease: "power2.inOut",
    duration: 0.6
  }, stage4Start);

  // Fade and rise in balanced Core Capabilities (Two-Column Layout)
  heroTl.fromTo("#stageSkills",
    { autoAlpha: 0, y: 30 },
    { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.6 },
    stage4Start + 0.2
  );

  // Stagger in Left Column Categories
  heroTl.fromTo("#stageSkills .category-item",
    { autoAlpha: 0, x: -15 },
    { autoAlpha: 1, x: 0, stagger: 0.04, ease: "power2.out", duration: 0.45 },
    stage4Start + 0.3
  );

  // Stagger in Right Column Stats and Tech Card
  heroTl.fromTo(["#stageSkills .stat-card", "#stageSkills .capabilities-tools-card"],
    { autoAlpha: 0, y: 15 },
    { autoAlpha: 1, y: 0, stagger: 0.08, ease: "power2.out", duration: 0.45 },
    stage4Start + 0.4
  );

  // Micro-Interactions on Scroll: Numeric Stat Count-Up
  let countersTriggered = false;
  function triggerStatCounters() {
    if (countersTriggered) return;
    countersTriggered = true;
    document.querySelectorAll(".stat-number").forEach(el => {
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      const countObj = { val: 0 };
      gsap.to(countObj, {
        val: target,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(countObj.val);
        }
      });
    });
  }

  heroTl.call(triggerStatCounters, null, stage4Start + 0.45);

  // Reading hold for Core Capabilities before unpinning cleanly into next section
  heroTl.to({}, { duration: 0.8 });

  // Expose timeline globally
  window.heroTl = heroTl;

  // ==========================================================================
  // Sticky Header Nav Logic (Quick hide on scroll UP, show on scroll DOWN past hero)
  // ==========================================================================
  const siteHeader = document.getElementById("siteHeader");
  let lastScrollY = window.scrollY;
  const heroThreshold = window.innerHeight * 0.35;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Within top hero landing: always hide header
    if (currentScrollY <= heroThreshold) {
      if (siteHeader) siteHeader.classList.remove("header-visible");
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY > lastScrollY) {
      // User is scrolling DOWN past the hero: show header
      if (siteHeader) siteHeader.classList.add("header-visible");
    } else if (currentScrollY < lastScrollY) {
      // User is scrolling UP (moving back toward top/hero): hide immediately
      if (siteHeader) siteHeader.classList.remove("header-visible");
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // Smooth scroll for nav links & brand
  document.querySelectorAll(".nav-link, .nav-brand").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");

      if (target === "about") {
        if (heroTl && heroTl.scrollTrigger) {
          const st = heroTl.scrollTrigger;
          const totalDur = heroTl.duration();
          const targetY = st.start + (1.5 / totalDur) * (st.end - st.start);
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      } else if (target === "capabilities") {
        if (heroTl && heroTl.scrollTrigger) {
          const st = heroTl.scrollTrigger;
          const totalDur = heroTl.duration();
          const targetY = st.start + (2.7 / totalDur) * (st.end - st.start);
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      } else if (target === "process") {
        const processSec = document.getElementById("howItWorks");
        if (processSec) {
          const top = processSec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      } else if (target === "projects") {
        const projSec = document.getElementById("projects-section");
        if (projSec) {
          const top = projSec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      } else if (target === "contact") {
        const contactSec = document.getElementById("contact");
        if (contactSec) {
          const top = contactSec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // ==========================================================================
  // Section Dot Navigation Click & Active Scroll Tracking
  // ==========================================================================
  function initSectionDotNav() {
    const dotItems = document.querySelectorAll(".dot-nav-item");
    if (!dotItems.length) return;

    function navigateToSection(sectionId) {
      if (sectionId === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (sectionId === "about") {
        if (heroTl && heroTl.scrollTrigger) {
          const st = heroTl.scrollTrigger;
          const targetY = st.start + (1.5 / heroTl.duration()) * (st.end - st.start);
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      } else if (sectionId === "skills") {
        if (heroTl && heroTl.scrollTrigger) {
          const st = heroTl.scrollTrigger;
          const targetY = st.start + (2.7 / heroTl.duration()) * (st.end - st.start);
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      } else if (sectionId === "philosophy") {
        const sec = document.getElementById("giant-statement");
        if (sec) {
          const top = sec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else if (sectionId === "process") {
        const sec = document.getElementById("howItWorks");
        if (sec) {
          const top = sec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else if (sectionId === "projects") {
        const sec = document.getElementById("projects-section");
        if (sec) {
          const top = sec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else if (sectionId === "contact") {
        const sec = document.getElementById("contact");
        if (sec) {
          const top = sec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    }

    dotItems.forEach(dot => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = dot.getAttribute("data-section");
        navigateToSection(sectionId);
      });
    });

    // Update active dot on scroll
    function updateActiveDot() {
      const scrollY = window.scrollY;
      let currentSection = "hero";

      if (heroTl && heroTl.scrollTrigger) {
        const st = heroTl.scrollTrigger;
        if (scrollY < st.start + 0.35 * (st.end - st.start)) {
          currentSection = "hero";
        } else if (scrollY < st.start + 0.72 * (st.end - st.start)) {
          currentSection = "about";
        } else if (scrollY <= st.end) {
          currentSection = "skills";
        }
      }

      // If beyond hero pinned runway
      const stEnd = heroTl && heroTl.scrollTrigger ? heroTl.scrollTrigger.end : window.innerHeight;
      if (scrollY > stEnd) {
        const sections = [
          { id: "philosophy", el: document.getElementById("giant-statement") },
          { id: "process", el: document.getElementById("howItWorks") },
          { id: "projects", el: document.getElementById("projects-section") },
          { id: "contact", el: document.getElementById("contact") }
        ];

        const viewMid = scrollY + window.innerHeight * 0.45;
        sections.forEach(({ id, el }) => {
          if (!el) return;
          const top = el.offsetTop;
          if (viewMid >= top) {
            currentSection = id;
          }
        });
      }

      dotItems.forEach(dot => {
        dot.classList.toggle("active", dot.getAttribute("data-section") === currentSection);
      });
    }

    window.addEventListener("scroll", updateActiveDot, { passive: true });
    updateActiveDot();
  }

  initSectionDotNav();

  // ==========================================================================
  // Scroll Progress Indicator (0% to 100%)
  // ==========================================================================
  const progressBar = document.getElementById("scrollProgressBar");
  function updateScrollProgress() {
    if (!progressBar) return;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
    progressBar.style.width = `${progress}%`;
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  // ==========================================================================
  // Custom Trailing Cursor (Disabled on Touch / Coarse Devices)
  // ==========================================================================
  const cursor = document.getElementById("customCursor");
  const cursorDot = document.getElementById("customCursorDot");
  const ambientGlow = document.getElementById("ambientCursorGlow");

  if (cursor && cursorDot && !window.matchMedia("(pointer: coarse)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let isVisible = false;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursor.style.opacity = "1";
        cursorDot.style.opacity = "1";
        if (ambientGlow) ambientGlow.style.opacity = "1";
      }
      gsap.set(cursorDot, { x: mouseX, y: mouseY });
    });

    document.addEventListener("mouseleave", () => {
      isVisible = false;
      cursor.style.opacity = "0";
      cursorDot.style.opacity = "0";
      if (ambientGlow) ambientGlow.style.opacity = "0";
    });

    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(1.0 - 0.18, gsap.ticker.deltaRatio());
      cursorX += (mouseX - cursorX) * dt;
      cursorY += (mouseY - cursorY) * dt;
      gsap.set(cursor, { x: cursorX, y: cursorY });

      // Ambient glow with softer, floating lag
      const glowDt = 1.0 - Math.pow(1.0 - 0.08, gsap.ticker.deltaRatio());
      glowX += (mouseX - glowX) * glowDt;
      glowY += (mouseY - glowY) * glowDt;
      if (ambientGlow) gsap.set(ambientGlow, { x: glowX, y: glowY });
    });

    // Expand cursor on interactive hover
    const clickables = document.querySelectorAll(
      "a, button, [role='button'], .project-card, .tech-node-item, .tech-wall-item, .category-item, .process-step-card, input, select, textarea"
    );
    clickables.forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
    });
  }

  // ==========================================================================
  // Stage 2 Transforming Words Rotator (Cycles words in place every ~2.2s)
  // ==========================================================================
  const rotatingWords = document.querySelectorAll("#rotatingWordWrap .rotating-word");
  if (rotatingWords.length > 1) {
    let currentWordIdx = 0;
    setInterval(() => {
      const current = rotatingWords[currentWordIdx];
      current.classList.remove("active");
      current.classList.add("exit");

      setTimeout(() => {
        current.classList.remove("exit");
      }, 450);

      currentWordIdx = (currentWordIdx + 1) % rotatingWords.length;
      rotatingWords[currentWordIdx].classList.add("active");
    }, 2200);
  }

  // ==========================================================================
  // Magnetic Buttons (Subtle Cursor Attraction & Elastic Snap-back)
  // ==========================================================================
  if (!window.matchMedia("(pointer: coarse)").matches) {
    document.querySelectorAll(".magnetic-btn").forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.32;
        const deltaY = (e.clientY - centerY) * 0.32;

        gsap.to(btn, {
          x: deltaX,
          y: deltaY,
          duration: 0.25,
          ease: "power2.out"
        });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1.1, 0.4)"
        });
      });
    });
  }

  // ==========================================================================
  // Portrait Constellation Tech Stack Wall with Dynamic Network Graph
  // ==========================================================================
  function initTechStackNetwork() {
    const stage = document.getElementById("techConstellation");
    const svg = document.getElementById("techNetworkSvg");
    if (!stage || !svg) return;

    // Dense organic constellation mesh with crossing edges
    const connections = [
      ["nodejs", "express"],
      ["nodejs", "supabase"],
      ["nodejs", "mysql"],
      ["nodejs", "tailscale"],     // Crossing diagonal (top-left -> mid-right)
      ["supabase", "express"],
      ["supabase", "mysql"],       // Crossing diagonal (top-right -> mid-left)
      ["supabase", "tailscale"],
      ["supabase", "n8n"],         // Long diagonal cross
      ["express", "mysql"],
      ["express", "tailscale"],     // Crossing edge across center
      ["express", "n8n"],
      ["express", "htmx"],         // Vertical downward cross
      ["mysql", "tailscale"],      // Horizontal cross through center
      ["mysql", "n8n"],
      ["mysql", "htmx"],
      ["tailscale", "n8n"],
      ["tailscale", "htmx"],       // Crossing diagonal (mid-right -> lower-left)
      ["n8n", "htmx"]
    ];

    function getNodeCenter(toolId) {
      const node = stage.querySelector(`.tech-node-item[data-tool='${toolId}']`);
      if (!node) return null;
      const stageRect = stage.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      return {
        x: nodeRect.left - stageRect.left + nodeRect.width / 2,
        y: nodeRect.top - stageRect.top + nodeRect.height / 2
      };
    }

    // Create persistent line elements once
    svg.innerHTML = "";
    const lineMap = connections.map(([source, target]) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "network-edge");
      line.setAttribute("data-source", source);
      line.setAttribute("data-target", target);
      svg.appendChild(line);
      return { el: line, source, target };
    });

    function updateNetworkLines() {
      lineMap.forEach(({ el, source, target }) => {
        const p1 = getNodeCenter(source);
        const p2 = getNodeCenter(target);
        if (!p1 || !p2) return;
        el.setAttribute("x1", p1.x);
        el.setAttribute("y1", p1.y);
        el.setAttribute("x2", p2.x);
        el.setAttribute("y2", p2.y);
      });
    }

    // Initial positioning & redraw on window resize
    updateNetworkLines();
    window.addEventListener("resize", updateNetworkLines, { passive: true });
    setTimeout(updateNetworkLines, 200);

    // Interactive Hover Highlighting
    const nodes = stage.querySelectorAll(".tech-node-item");
    nodes.forEach(node => {
      const toolId = node.getAttribute("data-tool");
      node.addEventListener("mouseenter", () => {
        lineMap.forEach(({ el, source, target }) => {
          if (source === toolId || target === toolId) {
            el.classList.add("edge-active");
          }
        });
      });
      node.addEventListener("mouseleave", () => {
        lineMap.forEach(({ el }) => {
          el.classList.remove("edge-active");
        });
      });
    });

    // Subtle organic floating drift for scattered nodes with dynamic line updates
    nodes.forEach((node, i) => {
      const yOffset = (i % 2 === 0 ? 1 : -1) * (4 + (i % 3) * 2);
      const xOffset = (i % 3 === 0 ? 1 : -1) * (3 + (i % 2) * 2);
      gsap.to(node, {
        y: `+=${yOffset}`,
        x: `+=${xOffset}`,
        duration: 3.2 + (i % 4) * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.16,
        onUpdate: updateNetworkLines
      });
    });
  }

  initTechStackNetwork();

  // ==========================================================================
  // Midway Giant Statement Section ScrollTrigger Reveal
  // ==========================================================================
  const statementQuote = document.getElementById("statementQuote");
  if (statementQuote) {
    gsap.fromTo(statementQuote,
      { opacity: 0, y: 45, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#giant-statement",
          start: "top 75%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }

  // ==========================================================================
  // "How I Work" Process Steps Staggered ScrollTrigger Reveal
  // ==========================================================================
  const processSteps = document.querySelectorAll(".process-step-card");
  if (processSteps.length > 0) {
    gsap.fromTo(processSteps,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.14,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#howItWorks",
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }

  // ==========================================================================
  // Scroll-Scrubbed Canvas Background Sequence (Images/BACKGROUND REAL)
  // Preloads 151 frames in ASCENDING order (frame_000000 -> frame_000300)
  // Maps scroll progress strictly 000000 -> 000300 (and reverses on scroll up)
  // ==========================================================================
  function initBgSequenceCanvas() {
    const canvas = document.getElementById("bgSequenceCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const TOTAL_FRAMES = 151; // Sample every 2nd frame (0, 2, ..., 300)
    const frameImages = new Array(TOTAL_FRAMES);
    let currentDrawnIndex = 0;

    function getFramePath(index) {
      const frameNum = index * 2;
      const pad = String(frameNum).padStart(6, "0");
      return `Images/BACKGROUND REAL/frame_${pad}.jpg`;
    }

    // High-DPI canvas resizing
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      renderFrame(currentDrawnIndex);
    }

    // Aspect-ratio "cover" image rendering
    function renderFrame(targetIndex) {
      targetIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, targetIndex));

      // Use target frame or nearest loaded frame as fallback
      let img = frameImages[targetIndex];
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let i = targetIndex - 1; i >= 0; i--) {
          if (frameImages[i] && frameImages[i].complete && frameImages[i].naturalWidth > 0) {
            img = frameImages[i];
            break;
          }
        }
        if (!img || !img.complete || img.naturalWidth === 0) {
          for (let i = targetIndex + 1; i < TOTAL_FRAMES; i++) {
            if (frameImages[i] && frameImages[i].complete && frameImages[i].naturalWidth > 0) {
              img = frameImages[i];
              break;
            }
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      currentDrawnIndex = targetIndex;

      const cW = canvas.width;
      const cH = canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cW / cH;
      let dW, dH, dX, dY;

      if (canvasRatio > imgRatio) {
        dW = cW;
        dH = cW / imgRatio;
        dX = 0;
        dY = (cH - dH) / 2;
      } else {
        dH = cH;
        dW = cH * imgRatio;
        dX = (cW - dW) / 2;
        dY = 0;
      }

      ctx.clearRect(0, 0, cW, cH);
      ctx.drawImage(img, dX, dY, dW, dH);
    }

    // Preload frames in strict ASCENDING order
    function preloadSequence() {
      // Step 1: Immediately dispatch and render Frame 0
      const img0 = new Image();
      img0.src = getFramePath(0);
      frameImages[0] = img0;
      img0.onload = () => {
        renderFrame(0);
      };

      // Step 2: Queue remaining frames in ascending order (1 to 150)
      let nextIndex = 1;
      const CONCURRENCY = 6;
      let activeJobs = 0;

      function pumpQueue() {
        while (activeJobs < CONCURRENCY && nextIndex < TOTAL_FRAMES) {
          const idx = nextIndex++;
          activeJobs++;
          const img = new Image();
          img.src = getFramePath(idx);
          frameImages[idx] = img;

          img.onload = () => {
            activeJobs--;
            pumpQueue();
          };
          img.onerror = () => {
            activeJobs--;
            pumpQueue();
          };
        }
      }

      pumpQueue();
    }

    resizeCanvas();
    preloadSequence();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // Scroll-scrub mapped across the entire document scroll
    // Scrolling down moves strictly forward (0 -> 150), scrolling up reverses
    const scrubState = { frame: 0 };
    gsap.to(scrubState, {
      frame: TOTAL_FRAMES - 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        onUpdate: (self) => {
          const frameIdx = Math.round(self.progress * (TOTAL_FRAMES - 1));
          renderFrame(frameIdx);
        }
      }
    });
  }

  initBgSequenceCanvas();

  // ==========================================================================
  // Section 2: Projects Showcase - Infinite Loop Ticker & Expanded View
  // ==========================================================================
  initProjectsSection();
});

// Full Data Set of Real Projects with Multi-Screenshot Sets
const projectsData = [
  {
    id: "automation-platform",
    title: "AI Automation Platform",
    tagline: "Enterprise workflow automation engine connecting webhooks, LLMs, and legacy business logic.",
    description: "An end-to-end automation infrastructure built to streamline complex business workflows, lead capture pipelines, and data synchronization between CRM, ERP, and AI models with asynchronous queuing and real-time failure recovery.",
    tech: ["Node.js", "Python", "OpenAI API", "Webhooks", "Redis", "Docker"],
    capability: "AI Pipeline Engineering, Webhook Infrastructure & Event-Driven Architecture",
    images: [
      "Projects/Automation Platform/Screenshot 2026-09-09 142815.png",
      "Projects/Automation Platform/Screenshot 2026-09-09 142825.png",
      "Projects/Automation Platform/Screenshot 2026-09-09 142950.png"
    ]
  },
  {
    id: "ecommerce-store",
    title: "Next-Gen E-Commerce Store",
    tagline: "High-conversion headless storefront with dynamic inventory management.",
    description: "A high-performance headless e-commerce experience engineered for speed, conversion, and global reach. Features dynamic multi-attribute product customizers, localized currency conversions, instant search indexing, and automated order fulfillment pipelines.",
    tech: ["React", "TypeScript", "Tailwind CSS", "Stripe API", "PostgreSQL", "Supabase"],
    capability: "Full-Stack Web Architecture, Payment Integration & Conversion Optimization",
    images: [
      "Projects/E-Commerce Store/Screenshot 2026-09-09 140523.png",
      "Projects/E-Commerce Store/Screenshot 2026-09-09 140540.png",
      "Projects/E-Commerce Store/Screenshot 2026-09-09 140631.png"
    ]
  },
  {
    id: "project-mgmt-saas",
    title: "Project Management SaaS",
    tagline: "Collaborative sprint workspace with granular velocity tracking.",
    description: "Cloud-based collaboration suite enabling distributed engineering and product teams to track sprints, manage issue backlogs, visualize velocity burn-down charts, and automate team stand-up summaries with granular access controls.",
    tech: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS", "Socket.io"],
    capability: "Real-time Collaboration Systems, Cloud SaaS Product Architecture & State Management",
    images: [
      "Projects/Project Management SaaS/Screenshot 2026-09-08 193509.png"
    ]
  },
  {
    id: "api-testing-workspace",
    title: "API Development & Testing Suite",
    tagline: "Interactive API test runner with automated mock services.",
    description: "A specialized developer suite designed to compose, inspect, and benchmark REST and GraphQL endpoints. Offers automated schema assertion tests, mock server responses, token management, and latency breakdown charts.",
    tech: ["TypeScript", "GraphQL", "Node.js", "Fastify", "Jest"],
    capability: "Developer Tooling, High-Throughput Networking & Schema Validation",
    images: [
      "Projects/API Development and Testing Workspace/Screenshot 2026-09-10 012427.png",
      "Projects/Repository/Screenshot 2026-09-10 012438.png"
    ]
  },
  {
    id: "recipe-costing-analyzer",
    title: "Recipe Costing & Plate Margin Analyzer",
    tagline: "Precision ingredient costing and plate margin intelligence tool.",
    description: "An intuitive operational finance application built for culinary and hospitality businesses to calculate dynamic ingredient fluctuations, plate food cost percentages, batch yields, and menu profitability in real time.",
    tech: ["JavaScript", "HTML5", "CSS3", "Chart.js", "IndexedDB"],
    capability: "Operational Financial UX, Dynamic Calculation Engines & Data Visualization",
    images: [
      "Projects/Other Projects/Recipe Costing and Plate Margin Analyzer/Screenshot 2026-09-08 132137.png"
    ]
  },
  {
    id: "staff-shift-roster",
    title: "Staff Shift Roster & SOP Board",
    tagline: "Workforce shift coordination and digital standard operating procedure tracker.",
    description: "Workforce scheduling tool built for operational compliance, tracking shift rotations, task checklists, and SOP adherence with instant alert dispatches for manager approvals.",
    tech: ["React", "CSS Modules", "Node.js", "REST APIs", "PostgreSQL"],
    capability: "Process Digitization, Workforce Coordination & Compliance Workflow Management",
    images: [
      "Projects/Other Projects/Staff Shift Roster and SOP Quality Board/Screenshot 2026-09-07 173754.png"
    ]
  },
  {
    id: "business-dashboard",
    title: "Executive Business Dashboard",
    tagline: "Real-time KPI telemetry, revenue analytics, and overhead burn monitoring.",
    description: "Executive command cockpit unifying revenue metrics, overhead utility expenses, customer acquisition velocity, and daily operational burn rates into interactive, drill-down analytics.",
    tech: ["Vue.js", "Tailwind CSS", "D3.js", "REST APIs", "PostgreSQL"],
    capability: "Executive Business Intelligence, Data Telemetry & Financial Modeling",
    images: [
      "Projects/Other Projects/Business Dashboard/Screenshot 2026-08-31 154647.png",
      "Projects/Other Projects/Dailt Utility and OVerhead Burn Monitor/Screenshot 2026-09-08 140002.png"
    ]
  },
  {
    id: "daily-inventory-calc",
    title: "Daily Inventory & Stock Predictor",
    tagline: "Automated stock balance and daily consumption prediction engine.",
    description: "A streamlined inventory tracking tool for stock replenishment forecasting, variance detection, waste tracking, and automated supplier reorder alerts.",
    tech: ["JavaScript", "CSS3", "Web Storage API", "Data Export Engine"],
    capability: "Inventory Optimization & Predictive Stock Telemetry",
    images: [
      "Projects/Other Projects/Daily Inventory Calculator/Screenshot 2026-09-01 113305.png"
    ]
  }
];

function initProjectsSection() {
  const tickerTrack = document.getElementById("tickerTrack");
  const tickerContainer = document.getElementById("projectsTickerContainer");
  const expandedOverlay = document.getElementById("projectExpandedView");
  const expandedContainer = document.getElementById("expandedContainer");
  const btnClose = document.getElementById("btnCloseExpanded");
  const expandedBackdrop = document.getElementById("expandedBackdrop");

  if (!tickerTrack || !tickerContainer) return;

  // 1. Generate HTML for Project Cards
  function createCardHTML(project, index) {
    const mainThumbnail = project.images && project.images.length > 0 ? project.images[0] : "";
    const tagsHTML = project.tech.slice(0, 3).map(t => `<span class="card-tag-pill">${t}</span>`).join("");

    return `
      <div class="project-card" data-project-id="${project.id}" role="button" tabindex="0">
        <div class="card-image-wrap">
          <img src="${mainThumbnail}" alt="${project.title}" class="card-thumbnail" loading="lazy" decoding="async">
        </div>
        <div class="card-details">
          <div>
            <div class="card-title-row">
              <h3 class="card-project-name">${project.title}</h3>
              <span class="card-expand-icon">↗</span>
            </div>
            <p class="card-tagline">${project.tagline}</p>
          </div>
          <div class="card-tags-row">
            ${tagsHTML}
          </div>
        </div>
      </div>
    `;
  }

  // Populate two identical sets for an unbroken infinite loop
  const cardsHTML = projectsData.map((p, i) => createCardHTML(p, i)).join("");
  tickerTrack.innerHTML = cardsHTML + cardsHTML;

  // 2. Setup GSAP Continuous Marquee Ticker (Slowed down noticeably for readability)
  const tickerTween = gsap.to(tickerTrack, {
    xPercent: -50,
    ease: "none",
    duration: 85,
    repeat: -1
  });

  // 3. Pause entirely on hover over ANY card or ticker track
  let isExpanded = false;

  const cardElements = tickerTrack.querySelectorAll(".project-card");
  cardElements.forEach(card => {
    card.addEventListener("mouseenter", () => {
      if (!isExpanded) tickerTween.pause();
    });
    card.addEventListener("mouseleave", () => {
      if (!isExpanded) tickerTween.play();
    });
    card.addEventListener("click", () => {
      const projectId = card.getAttribute("data-project-id");
      openProjectDetail(projectId);
    });
  });

  // 4. Expanded Detail Modal View Logic & Scroll Lock
  let activeProject = null;
  let currentImageIdx = 0;
  let savedScrollY = 0;
  let isScrollLocked = false;
  let isClosing = false;
  const originalWindowScrollTo = window.scrollTo.bind(window);
  const originalWindowScrollBy = window.scrollBy.bind(window);

  function lockBodyScroll() {
    if (isScrollLocked) return;
    isScrollLocked = true;
    savedScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Compensate for scrollbar removal to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      const header = document.getElementById("siteHeader");
      if (header) header.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");

    // Intercept any programmatic scroll attempts while locked
    window.scrollTo = function(...args) {
      if (isScrollLocked) return;
      originalWindowScrollTo(...args);
    };
    window.scrollBy = function(...args) {
      if (isScrollLocked) return;
      originalWindowScrollBy(...args);
    };
  }

  function unlockBodyScroll() {
    if (!isScrollLocked) return;
    isScrollLocked = false;

    window.scrollTo = originalWindowScrollTo;
    window.scrollBy = originalWindowScrollBy;

    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    const header = document.getElementById("siteHeader");
    if (header) header.style.paddingRight = "";

    // Restore exact scroll position cleanly without jumping to top
    originalWindowScrollTo(0, savedScrollY);
  }

  function openProjectDetail(projectId) {
    activeProject = projectsData.find(p => p.id === projectId);
    if (!activeProject) return;

    isExpanded = true;
    isClosing = false;
    tickerTween.pause();
    currentImageIdx = 0;

    // Lock page scrolling in the background
    lockBodyScroll();

    // Fill Right Pane (Project Info)
    document.getElementById("expandedTitle").textContent = activeProject.title;
    document.getElementById("expandedCapability").textContent = activeProject.capability;
    document.getElementById("expandedDescription").textContent = activeProject.description;

    const techContainer = document.getElementById("expandedTech");
    techContainer.innerHTML = activeProject.tech.map(tech => `<span class="tech-tag-pill">${tech}</span>`).join("");

    // Setup Left Pane (Images & Dot Navigation)
    renderCarousel(activeProject);

    // Reset right pane scroll to top when opening a new project
    const rightPane = document.querySelector(".expanded-right-pane");
    if (rightPane) rightPane.scrollTop = 0;

    // GSAP Transition: Fade out ticker row & reveal expanded modal
    gsap.to(tickerContainer, {
      opacity: 0,
      scale: 0.96,
      duration: 0.35,
      ease: "power2.inOut"
    });

    gsap.set(expandedOverlay, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.fromTo(expandedContainer,
      { y: 35, scale: 0.95, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "power3.out" }
    );
  }

  function renderCarousel(project) {
    const mainImg = document.getElementById("expandedMainImg");
    const dotsContainer = document.getElementById("carouselDots");
    const counter = document.getElementById("carouselCounter");
    const prevBtn = document.getElementById("btnPrevImg");
    const nextBtn = document.getElementById("btnNextImg");

    const images = project.images || [];
    mainImg.src = images[currentImageIdx] || "";
    counter.textContent = `${currentImageIdx + 1} / ${images.length}`;

    // Show/hide navigation arrows based on count
    if (images.length <= 1) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
      dotsContainer.style.display = "none";
      counter.style.display = "none";
    } else {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
      dotsContainer.style.display = "flex";
      counter.style.display = "inline-block";
    }

    // Render dot indicators
    dotsContainer.innerHTML = images.map((_, idx) => `
      <button class="carousel-dot ${idx === currentImageIdx ? 'active' : ''}" 
              data-index="${idx}" 
              aria-label="View screenshot ${idx + 1}"></button>
    `).join("");

    // Dot click events
    dotsContainer.querySelectorAll(".carousel-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        const targetIdx = parseInt(dot.getAttribute("data-index"), 10);
        switchImage(targetIdx);
      });
    });
  }

  function switchImage(index) {
    if (!activeProject || !activeProject.images || index === currentImageIdx) return;
    const images = activeProject.images;
    currentImageIdx = (index + images.length) % images.length;

    const mainImg = document.getElementById("expandedMainImg");
    const counter = document.getElementById("carouselCounter");

    // Smooth image fade transition
    gsap.to(mainImg, {
      opacity: 0,
      duration: 0.15,
      ease: "power1.in",
      onComplete: () => {
        mainImg.src = images[currentImageIdx];
        gsap.to(mainImg, { opacity: 1, duration: 0.25, ease: "power1.out" });
      }
    });

    counter.textContent = `${currentImageIdx + 1} / ${images.length}`;

    // Highlight active dot with emerald green
    const dots = document.querySelectorAll("#carouselDots .carousel-dot");
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === currentImageIdx);
    });
  }

  // Arrow navigation
  document.getElementById("btnPrevImg")?.addEventListener("click", () => {
    switchImage(currentImageIdx - 1);
  });
  document.getElementById("btnNextImg")?.addEventListener("click", () => {
    switchImage(currentImageIdx + 1);
  });

  // Close / Collapse Modal
  function closeProjectDetail() {
    if (!isExpanded || isClosing) return;
    isClosing = true;
    isExpanded = false;

    // Restore normal page scrolling immediately exactly where user left off
    unlockBodyScroll();

    gsap.to(expandedOverlay, {
      autoAlpha: 0,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(expandedOverlay, { pointerEvents: "none" });
        isClosing = false;
        activeProject = null;

        // Restore ticker row & resume auto-scroll
        gsap.to(tickerContainer, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out"
        });
        tickerTween.play();
      }
    });
  }

  btnClose?.addEventListener("click", closeProjectDetail);
  expandedBackdrop?.addEventListener("click", closeProjectDetail);

  // Touch & wheel scroll lock handling (mobile & desktop)
  let touchStartY = 0;
  expandedOverlay.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  expandedOverlay.addEventListener("touchmove", (e) => {
    if (!isExpanded) return;
    const scrollable = e.target.closest(".expanded-right-pane");
    if (!scrollable) {
      e.preventDefault();
      return;
    }
    // Prevent mobile rubber-band scroll leakage when at boundaries
    const touchY = e.touches[0].clientY;
    const deltaY = touchStartY - touchY;
    const isAtTop = scrollable.scrollTop <= 0 && deltaY < 0;
    const isAtBottom = (scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1) && deltaY > 0;
    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
  }, { passive: false });

  expandedOverlay.addEventListener("wheel", (e) => {
    if (!isExpanded) return;
    const scrollable = e.target.closest(".expanded-right-pane");
    if (!scrollable) {
      e.preventDefault();
      return;
    }
    // Prevent wheel leakage at top/bottom of scrollable right pane
    const isAtTop = scrollable.scrollTop <= 0 && e.deltaY < 0;
    const isAtBottom = (scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1) && e.deltaY > 0;
    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
  }, { passive: false });

  // Keyboard navigation support (Escape to close, arrows for slides, block page scroll keys)
  window.addEventListener("keydown", (e) => {
    if (!isExpanded) return;
    if (e.key === "Escape") {
      closeProjectDetail();
    } else if (e.key === "ArrowRight") {
      switchImage(currentImageIdx + 1);
    } else if (e.key === "ArrowLeft") {
      switchImage(currentImageIdx - 1);
    } else if (["Space", "PageUp", "PageDown", "Home", "End"].includes(e.code) || e.key === " " || e.key === "PageUp" || e.key === "PageDown") {
      const isInsideScroll = document.activeElement && document.activeElement.closest(".expanded-right-pane");
      if (!isInsideScroll) {
        e.preventDefault();
      }
    }
  });

  // Safeguard: Lock window scroll position against any programmatic or browser shift while modal is open
  window.addEventListener("scroll", () => {
    if (isScrollLocked && typeof savedScrollY === "number") {
      if (window.scrollY !== savedScrollY) {
        window.scrollTo(0, savedScrollY);
      }
    }
  }, { passive: false });

  // Smooth Back-to-Top Navigation
  const btnBackToTop = document.getElementById("btnBackToTop");
  if (btnBackToTop) {
    btnBackToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}
