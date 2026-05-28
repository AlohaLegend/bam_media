const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".nav-toggle");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroVideo = document.querySelector(".hero-video");
const mobileHeroQuery = window.matchMedia("(max-width: 620px)");

const getHeroVideoSource = () => {
  if (!heroVideo) {
    return "";
  }

  return mobileHeroQuery.matches ? heroVideo.dataset.mobileSrc : heroVideo.dataset.desktopSrc;
};

const syncHeroVideoSource = () => {
  const nextSource = getHeroVideoSource();

  if (!nextSource) {
    return;
  }

  const nextUrl = new URL(nextSource, window.location.href).href;
  const currentUrl = heroVideo.currentSrc || heroVideo.src;

  if (currentUrl !== nextUrl) {
    heroVideo.classList.remove("is-ready");
    heroVideo.src = nextSource;
    heroVideo.load();
  }
};

const markHeroVideoReady = () => {
  if (heroVideo && heroVideo.currentTime > 0) {
    heroVideo.classList.add("is-ready");
  }
};

const playHeroVideo = () => {
  if (!heroVideo || prefersReducedMotion) {
    return;
  }

  syncHeroVideoSource();

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
    syncHeroVideoSource();
    heroVideo.setAttribute("autoplay", "");
    heroVideo.addEventListener("playing", markHeroVideoReady);
    heroVideo.addEventListener("timeupdate", markHeroVideoReady);
    heroVideo.addEventListener("canplay", playHeroVideo);
    markHeroVideoReady();

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

    const handleHeroSourceChange = () => {
      syncHeroVideoSource();
      playHeroVideo();
    };

    if (typeof mobileHeroQuery.addEventListener === "function") {
      mobileHeroQuery.addEventListener("change", handleHeroSourceChange);
    } else {
      mobileHeroQuery.addListener(handleHeroSourceChange);
    }
  }
}

let headerIsScrolled = null;
let headerFrame = 0;

const syncHeader = () => {
  const scrollThreshold = mobileHeroQuery.matches ? Math.min(360, window.innerHeight * 0.42) : 12;
  const shouldBeScrolled = window.scrollY > scrollThreshold;

  if (shouldBeScrolled === headerIsScrolled) {
    return;
  }

  headerIsScrolled = shouldBeScrolled;
  header.classList.toggle("is-scrolled", shouldBeScrolled);
};

const scheduleHeaderSync = () => {
  if (headerFrame) {
    return;
  }

  headerFrame = requestAnimationFrame(() => {
    headerFrame = 0;
    syncHeader();
  });
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

  return section;
};

const scrollToHash = (hash, updateHash = true, instant = false) => {
  const target = getScrollTarget(hash);

  if (!target) {
    return false;
  }

  const isTop = hash === "#top";
  const headerOffset = header.getBoundingClientRect().height;
  const top = isTop ? 0 : window.scrollY + target.getBoundingClientRect().top - headerOffset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: instant || prefersReducedMotion ? "auto" : "smooth",
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

    if (hash && getScrollTarget(hash)) {
      event.preventDefault();
      closeNav();
      window.setTimeout(() => scrollToHash(hash), 0);
      return;
    }

    closeNav();
  });
});

syncHeader();
window.addEventListener("scroll", scheduleHeaderSync, { passive: true });

const handleHeaderViewportChange = () => {
  headerIsScrolled = null;
  syncHeader();
};

if (typeof mobileHeroQuery.addEventListener === "function") {
  mobileHeroQuery.addEventListener("change", handleHeaderViewportChange);
} else {
  mobileHeroQuery.addListener(handleHeaderViewportChange);
}

if (window.location.hash) {
  const syncInitialHash = () => scrollToHash(window.location.hash, false, true);

  requestAnimationFrame(syncInitialHash);
  window.setTimeout(syncInitialHash, 160);
  window.setTimeout(syncInitialHash, 720);
  window.setTimeout(syncInitialHash, 1600);
  window.setTimeout(syncInitialHash, 2600);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncInitialHash);
  }

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(syncInitialHash);
      window.setTimeout(syncInitialHash, 160);
      window.setTimeout(syncInitialHash, 900);
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
    ".content-proof-copy",
    ".content-card",
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

const reelCards = Array.from(document.querySelectorAll(".content-card.is-reel"));
const reelVisibility = new Map();
let activeReelCard = null;
let priorityReelCard = null;
let reelFrame = 0;

const loadReelPreview = (video) => {
  if (!video || video.dataset.loaded === "true") {
    return Boolean(video);
  }

  const src = video.dataset.src;

  if (!src) {
    return false;
  }

  video.src = src;
  video.dataset.loaded = "true";
  video.load();
  return true;
};

const pauseReelPreview = (card) => {
  const video = card?.querySelector(".reel-preview");

  if (!video) {
    return;
  }

  video.pause();

  if (video.readyState > 0) {
    try {
      video.currentTime = 0;
    } catch (error) {
      // Some mobile browsers briefly block seeking while media is settling.
    }
  }

  card.classList.remove("is-previewing");
};

const playReelPreview = (card) => {
  const video = card?.querySelector(".reel-preview");

  if (!video || prefersReducedMotion || !loadReelPreview(video)) {
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  card.classList.add("is-previewing");

  const playAttempt = video.play();

  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      if (activeReelCard === card) {
        activeReelCard = null;
        card.classList.remove("is-previewing");
      }
    });
  }
};

const isCardOnScreen = (card) => {
  if (!card) {
    return false;
  }

  const rect = card.getBoundingClientRect();

  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
};

const getBestVisibleReel = () => {
  let bestCard = null;
  let bestScore = 0;
  const viewportCenter = window.innerWidth / 2;

  reelVisibility.forEach((ratio, card) => {
    if (ratio < 0.42 || !isCardOnScreen(card)) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const centerDistance = Math.abs(rect.left + rect.width / 2 - viewportCenter) / Math.max(window.innerWidth, 1);
    const score = ratio - centerDistance * 0.2;

    if (score > bestScore) {
      bestScore = score;
      bestCard = card;
    }
  });

  return bestCard;
};

const setActiveReel = (nextCard) => {
  if (nextCard === activeReelCard) {
    return;
  }

  if (activeReelCard) {
    pauseReelPreview(activeReelCard);
  }

  activeReelCard = nextCard;

  if (activeReelCard) {
    playReelPreview(activeReelCard);
  }
};

const syncActiveReel = () => {
  reelFrame = 0;

  if (document.hidden) {
    setActiveReel(null);
    return;
  }

  const priorityCandidate = isCardOnScreen(priorityReelCard) ? priorityReelCard : null;
  setActiveReel(priorityCandidate || getBestVisibleReel());
};

const scheduleReelSync = () => {
  if (reelFrame) {
    return;
  }

  reelFrame = requestAnimationFrame(syncActiveReel);
};

if (reelCards.length && !prefersReducedMotion && "IntersectionObserver" in window) {
  const reelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector(".reel-preview");

        if (entry.intersectionRatio > 0.08) {
          loadReelPreview(video);
        }

        if (entry.isIntersecting) {
          reelVisibility.set(entry.target, entry.intersectionRatio);
        } else {
          reelVisibility.delete(entry.target);
        }
      });

      scheduleReelSync();
    },
    { rootMargin: "12% 0px -8% 0px", threshold: [0, 0.08, 0.25, 0.42, 0.6, 0.78] }
  );

  reelCards.forEach((card) => {
    reelObserver.observe(card);

    card.addEventListener("mouseenter", () => {
      priorityReelCard = card;
      scheduleReelSync();
    });

    card.addEventListener("mouseleave", () => {
      if (priorityReelCard === card) {
        priorityReelCard = null;
      }

      scheduleReelSync();
    });

    card.addEventListener("focusin", () => {
      priorityReelCard = card;
      scheduleReelSync();
    });

    card.addEventListener("focusout", () => {
      if (priorityReelCard === card) {
        priorityReelCard = null;
      }

      scheduleReelSync();
    });
  });

  document.addEventListener("visibilitychange", scheduleReelSync);
  window.addEventListener("resize", scheduleReelSync, { passive: true });
  document.querySelectorAll(".content-rail").forEach((rail) => {
    rail.addEventListener("scroll", scheduleReelSync, { passive: true });
  });
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

const scrollRails = document.querySelectorAll(".content-rail, .loop-steps, .service-grid, .metrics, .client-links");

const syncScrollableRails = () => {
  scrollRails.forEach((rail) => {
    rail.classList.toggle("is-scrollable", rail.scrollWidth > rail.clientWidth + 4);
  });
};

syncScrollableRails();
window.addEventListener("resize", syncScrollableRails, { passive: true });
window.addEventListener("load", syncScrollableRails, { once: true });

if (window.matchMedia("(pointer: fine)").matches) {
  scrollRails.forEach((rail) => {
    let isDown = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;

    rail.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !rail.classList.contains("is-scrollable")) {
        return;
      }

      isDown = true;
      didDrag = false;
      startX = event.clientX;
      startScrollLeft = rail.scrollLeft;
      rail.classList.add("is-dragging");
      if (typeof rail.setPointerCapture === "function") {
        rail.setPointerCapture(event.pointerId);
      }
    });

    rail.addEventListener("pointermove", (event) => {
      if (!isDown) {
        return;
      }

      const deltaX = event.clientX - startX;

      if (Math.abs(deltaX) > 4) {
        didDrag = true;
        rail.scrollLeft = startScrollLeft - deltaX;
        event.preventDefault();
      }
    });

    const endDrag = (event) => {
      if (!isDown) {
        return;
      }

      isDown = false;
      rail.classList.remove("is-dragging");

      if (typeof rail.hasPointerCapture === "function" && rail.hasPointerCapture(event.pointerId)) {
        rail.releasePointerCapture(event.pointerId);
      }
    };

    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("lostpointercapture", () => {
      isDown = false;
      rail.classList.remove("is-dragging");
    });

    rail.addEventListener(
      "click",
      (event) => {
        if (!didDrag) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
      },
      true
    );
  });
}

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
