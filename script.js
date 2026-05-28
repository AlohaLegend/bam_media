const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".nav-toggle");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroVideo = document.querySelector(".hero-video");

const playHeroVideo = () => {
  if (!heroVideo || prefersReducedMotion) {
    return;
  }

  const playAttempt = heroVideo.play();

  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {});
  }
};

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;
  heroVideo.setAttribute("muted", "");
  heroVideo.setAttribute("playsinline", "");
  heroVideo.setAttribute("webkit-playsinline", "");

  if (prefersReducedMotion) {
    heroVideo.pause();
    heroVideo.removeAttribute("autoplay");
  } else {
    heroVideo.setAttribute("autoplay", "");

    if (heroVideo.readyState >= 2) {
      playHeroVideo();
    } else {
      heroVideo.addEventListener("loadeddata", playHeroVideo, { once: true });
    }

    window.addEventListener("pageshow", playHeroVideo);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        playHeroVideo();
      }
    });

    window.addEventListener("touchstart", playHeroVideo, { once: true, passive: true });
    window.addEventListener("pointerdown", playHeroVideo, { once: true, passive: true });
  }
}

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeNav = () => {
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("nav-open");
  header.classList.remove("is-open");
};

const getScrollTarget = (hash) => {
  if (!hash || hash === "#") {
    return null;
  }

  if (hash === "#top") {
    return document.getElementById("top");
  }

  const section = document.getElementById(hash.slice(1));

  if (!section) {
    return null;
  }

  return section.querySelector(".section-kicker, .eyebrow, h1, h2") || section;
};

const scrollToHash = (hash, updateHash = true) => {
  const target = getScrollTarget(hash);

  if (!target) {
    return false;
  }

  const isTop = hash === "#top";
  const headerOffset = header.getBoundingClientRect().height;
  const breathingRoom = window.matchMedia("(min-width: 901px)").matches ? 56 : 40;
  const top = isTop
    ? 0
    : window.scrollY + target.getBoundingClientRect().top - headerOffset - breathingRoom;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });

  if (updateHash && window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }

  return true;
};

toggle.addEventListener("click", () => {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  document.body.classList.toggle("nav-open", !isOpen);
  header.classList.toggle("is-open", !isOpen);
});

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");

    if (hash && scrollToHash(hash)) {
      event.preventDefault();
    }

    closeNav();
  });
});

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (window.location.hash) {
  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(() => scrollToHash(window.location.hash, false));
    },
    { once: true }
  );
}

document.body.classList.add("is-loaded");

const revealTargets = document.querySelectorAll(
  [
    ".thesis .section-kicker",
    ".thesis h2",
    ".thesis-copy",
    ".loop-copy",
    ".phone-wall",
    ".loop-steps article",
    ".section-head",
    ".service-grid article",
    ".proof .section-kicker",
    ".proof h2",
    ".metrics article",
    ".clients-copy",
    ".client-link",
    ".contact > *",
  ].join(",")
);

if (!prefersReducedMotion) {
  document.documentElement.classList.add("motion-ready");

  revealTargets.forEach((target, index) => {
    target.dataset.reveal = "";
    target.style.setProperty("--reveal-delay", `${(index % 5) * 55}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const countElements = document.querySelectorAll("[data-count]");

const easeOut = (value) => 1 - Math.pow(1 - value, 3);

const formatCount = (value, suffix) => {
  const rounded = suffix === "B+" ? Math.round(value) : Math.round(value);
  return `${rounded}${suffix}`;
};

const animateCount = (element) => {
  if (element.dataset.counted === "true") {
    return;
  }

  element.dataset.counted = "true";

  if (prefersReducedMotion) {
    return;
  }

  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = 1100;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = formatCount(target * easeOut(progress), suffix);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  element.textContent = formatCount(0, suffix);
  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.45 }
);

countElements.forEach((element) => countObserver.observe(element));

const serviceCards = document.querySelectorAll(".service-grid article");

const activateService = (activeCard) => {
  serviceCards.forEach((card) => card.classList.toggle("is-active", card === activeCard));
};

serviceCards.forEach((card, index) => {
  if (index === 0) {
    card.classList.add("is-active");
  }

  card.addEventListener("mouseenter", () => activateService(card));
  card.addEventListener("focus", () => activateService(card));
  card.addEventListener("click", () => activateService(card));
});

const loopSteps = document.querySelectorAll(".loop-steps article");

const stepObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loopSteps.forEach((step) => step.classList.toggle("is-active", step === entry.target));
      }
    });
  },
  { rootMargin: "-30% 0px -45% 0px", threshold: 0.2 }
);

loopSteps.forEach((step) => stepObserver.observe(step));

const hero = document.querySelector(".hero");

if (hero && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    hero.style.setProperty("--hero-x", `${x * -14}`);
    hero.style.setProperty("--hero-y", `${y * -10}`);
    hero.style.setProperty("--card-one-x", `${x * 12}px`);
    hero.style.setProperty("--card-two-y", `${y * -12}px`);
    hero.style.setProperty("--ticket-y", `${y * 10}px`);
  });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-x", "0");
    hero.style.setProperty("--hero-y", "0");
    hero.style.setProperty("--card-one-x", "0");
    hero.style.setProperty("--card-two-y", "0");
    hero.style.setProperty("--ticket-y", "0");
  });
}
