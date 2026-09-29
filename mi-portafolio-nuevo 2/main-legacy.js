/**
 * Portafolio — interacciones
 */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var threshold = 12;
    function onScroll() {
      if (window.scrollY > threshold) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".site-nav__toggle");
    var nav = document.getElementById("site-nav");
    if (!header || !toggle || !nav) return;

    function setOpen(open) {
      header.classList.toggle("is-nav-open", open);
      document.body.classList.toggle("is-nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function close() {
      setOpen(false);
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    window.addEventListener(
      "resize",
      function () {
        if (window.matchMedia("(min-width: 768px)").matches) close();
      },
      { passive: true }
    );
  }

  function initReveal() {
    if (prefersReducedMotion) return;

    var nodes = document.querySelectorAll(".js-reveal");
    if (!nodes.length) return;

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  /**
   * Fondo tipo “digital rain” (decorativo).
   */
  function initMatrixRain() {
    if (prefersReducedMotion) return;

    var canvas = document.getElementById("matrix-bg");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;
    var columns = 0;
    var drops = [];
    var charset =
      "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789ｦｧｨｩｪｫｬｭｮｯﾞﾟ";

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var fontSize = Math.max(12, Math.min(16, w / 64));
      columns = Math.ceil(w / fontSize);
      ctx.font = "600 " + fontSize + "px monospace";
      drops = [];
      for (var i = 0; i < columns; i++) {
        drops[i] = Math.random() * -40;
      }
    }

    function draw() {
      ctx.fillStyle = "rgba(2, 8, 5, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#00ff41";

      var fontSize = Math.max(12, Math.min(16, w / 64));
      for (var i = 0; i < drops.length; i++) {
        var char = charset[Math.floor(Math.random() * charset.length)];
        var x = i * fontSize;
        var y = drops[i] * fontSize;
        var alpha = 0.35 + Math.random() * 0.55;
        ctx.globalAlpha = alpha;
        ctx.fillText(char, x, y);
        ctx.globalAlpha = 1;

        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.55 + Math.random() * 0.45;
      }
    }

    var raf = 0;
    var running = true;

    function tick() {
      if (!running) return;
      draw();
      raf = window.requestAnimationFrame(tick);
    }

    resize();
    tick();

    window.addEventListener(
      "resize",
      function () {
        resize();
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = window.requestAnimationFrame(tick);
      }
    });
  }

  function initRecommendationsCarousel() {
    var root = document.querySelector("[data-reco]");
    if (!root) return;

    var viewport = root.querySelector(".reco__viewport");
    var track = root.querySelector(".reco__track");
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-reco-slide]"));
    var prevBtn = document.querySelector("[data-reco-prev]");
    var nextBtn = document.querySelector("[data-reco-next]");
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-reco-dot]"));

    if (!viewport || !track || !slides.length) return;

    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function getActiveIndex() {
      var vRect = viewport.getBoundingClientRect();
      var best = 0;
      var bestScore = -Infinity;
      for (var i = 0; i < slides.length; i++) {
        var r = slides[i].getBoundingClientRect();
        var overlap = Math.min(r.right, vRect.right) - Math.max(r.left, vRect.left);
        var score = overlap / Math.max(1, Math.min(r.width, vRect.width));
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      }
      return best;
    }

    function scrollToIndex(idx) {
      idx = clamp(idx, 0, slides.length - 1);
      var target = slides[idx];
      if (!target) return;

      var left = target.offsetLeft;
      viewport.scrollTo({ left: left, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    function setActive(idx) {
      dots.forEach(function (d, i) {
        d.setAttribute("aria-selected", i === idx ? "true" : "false");
        d.setAttribute("tabindex", i === idx ? "0" : "-1");
      });
    }

    // Init dots state
    setActive(0);

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        scrollToIndex(getActiveIndex() - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollToIndex(getActiveIndex() + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var idx = Number(dot.getAttribute("data-reco-dot"));
        if (!Number.isFinite(idx)) return;
        scrollToIndex(idx);
      });
    });

    // Keyboard in viewport: left/right to move
    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToIndex(getActiveIndex() - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollToIndex(getActiveIndex() + 1);
      }
    });

    // Update active dot on scroll (throttled via rAF)
    var raf = 0;
    function onScroll() {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        setActive(getActiveIndex());
      });
    }
    viewport.addEventListener("scroll", onScroll, { passive: true });
    setActive(getActiveIndex());
  }

  function init() {
    setYear();
    initHeaderScroll();
    initMobileNav();
    initReveal();
    initMatrixRain();
    initRecommendationsCarousel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
