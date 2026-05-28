const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroVideo = document.querySelector(".hero-video");

if (prefersReducedMotion && heroVideo) {
  heroVideo.pause();
  heroVideo.removeAttribute("autoplay");
}

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

toggle.addEventListener("click", () => {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  document.body.classList.toggle("nav-open", !isOpen);
  header.classList.toggle("is-open", !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-open");
    header.classList.remove("is-open");
  });
});

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

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
