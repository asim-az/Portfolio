/* ==========================================================================
   MOHAMMAD ASIM — PORTFOLIO SCRIPT
   Handles: mobile nav toggle, scroll-based nav style, scroll-reveal
   animations, the hero terminal typing sequence, and the cursor dot.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------
     1. Footer year
  ------------------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     2. Sticky nav — add a border once the page has scrolled
  ------------------------------------------------------------------ */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 8) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. Mobile menu toggle
  ------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the mobile menu whenever a link is tapped
    navLinks.querySelectorAll(".nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------
     4. Custom cursor dot (desktop pointer devices only)
  ------------------------------------------------------------------ */
  const cursorDot = document.querySelector(".cursor-dot");
  const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursorDot && supportsFinePointer) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  /* ------------------------------------------------------------------
     5. Scroll-reveal — fade/slide elements up as they enter the viewport
  ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(
    ".about__text, .about__stats, .skills__intro, .skill-card, .project, .contact__inner"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    // Respect the user's motion preference: show everything immediately
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Small stagger for elements revealed together (e.g. skill cards)
            const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 60;
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     6. Hero terminal — typewriter sequence introducing Mohammad Asim
     Skipped instantly (all lines shown at once) if the user prefers
     reduced motion.
  ------------------------------------------------------------------ */
  const terminalBody = document.getElementById("terminalBody");

  if (terminalBody) {
    // Each entry is either a command that gets "typed", or a plain
    // output line that appears instantly beneath it.
    const script = [
      { type: "command", text: "whoami" },
      { type: "output", text: "Mohammad Asim — IT Engineer" },
      { type: "command", text: "cat education.txt" },
      { type: "output", text: "B.Tech, Information Technology\nGovernment College of Engineering, Aurangabad" },
      { type: "command", text: "cat skills.txt | head -4" },
      { type: "output", text: "HTML · CSS · JavaScript · React.js" },
      { type: "command", text: "docker --version && uname -a" },
      { type: "output", text: "Comfortable shipping on Docker + Linux" },
      { type: "command", text: "echo $STATUS" },
      { type: "output", text: "Available for new opportunities ✓" },
    ];

    if (prefersReducedMotion) {
      script.forEach((line) => terminalBody.appendChild(buildStaticLine(line)));
    } else {
      typeScript(terminalBody, script);
    }
  }

  /**
   * Builds a fully-rendered (non-animated) terminal line.
   * @param {{type: string, text: string}} line
   * @returns {HTMLElement}
   */
  function buildStaticLine(line) {
    const el = document.createElement("div");
    el.className = "terminal__line";
    if (line.type === "command") {
      el.innerHTML = `<span class="terminal__prompt">$ ${escapeHtml(line.text)}</span>`;
    } else {
      el.innerHTML = `<span class="terminal__output">${escapeHtml(line.text).replace(/\n/g, "<br>")}</span>`;
    }
    return el;
  }

  /**
   * Types out a sequence of command/output lines inside the terminal,
   * one character at a time for commands, with a blinking cursor that
   * follows the most recently typed line.
   * @param {HTMLElement} container
   * @param {{type: string, text: string}[]} lines
   */
  function typeScript(container, lines) {
    let lineIndex = 0;

    function nextLine() {
      if (lineIndex >= lines.length) return;

      const line = lines[lineIndex];
      const lineEl = document.createElement("div");
      lineEl.className = "terminal__line";
      container.appendChild(lineEl);

      if (line.type === "command") {
        typeCommand(lineEl, line.text, () => {
          lineIndex++;
          setTimeout(nextLine, 220);
        });
      } else {
        // Output lines appear as a block (feels like real shell output)
        lineEl.innerHTML = `<span class="terminal__output">${escapeHtml(line.text).replace(/\n/g, "<br>")}</span>`;
        lineIndex++;
        setTimeout(nextLine, 420);
      }
    }

    function typeCommand(lineEl, text, done) {
      const promptSpan = document.createElement("span");
      promptSpan.className = "terminal__prompt";
      promptSpan.textContent = "$ ";
      lineEl.appendChild(promptSpan);

      const textSpan = document.createElement("span");
      textSpan.className = "terminal__prompt";
      lineEl.appendChild(textSpan);

      const cursor = document.createElement("span");
      cursor.className = "terminal__cursor";
      lineEl.appendChild(cursor);

      let i = 0;
      const typingSpeed = 38; // ms per character

      const interval = setInterval(() => {
        textSpan.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          cursor.remove(); // drop the blinking cursor once the line is done
          done();
        }
      }, typingSpeed);
    }

    nextLine();
  }

  /**
   * Minimal HTML-escaping helper so terminal content is inserted safely.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
