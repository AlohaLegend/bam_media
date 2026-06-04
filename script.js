const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".nav-toggle");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroVideo = document.querySelector(".hero-video");
const mobileHeroQuery = window.matchMedia("(max-width: 620px)");
const entrance = document.querySelector("[data-entrance]");
const entranceActive = document.documentElement.classList.contains("entrance-active");
const canWarmScrollAssets = "requestIdleCallback" in window;
const editableContentUrls = [
  "https://bam-cms-auth.bammediaauth.workers.dev/content/site.json",
  "content/site.json",
];

const runWhenIdle = (callback, timeout = 1200) => {
  if (canWarmScrollAssets) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, 160);
};

const warmImage = (src) => {
  if (!src) {
    return;
  }

  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";
  image.src = src;

  if (typeof image.decode === "function") {
    image.decode().catch(() => {});
  }
};

let scrollAssetsWarmed = false;

const warmScrollAssets = () => {
  if (scrollAssetsWarmed) {
    return;
  }

  scrollAssetsWarmed = true;

  const imageSources = Array.from(document.querySelectorAll(".reel-poster, .client-logo img"))
    .map((image) => image.currentSrc || image.src)
    .filter(Boolean);

  Array.from(new Set(imageSources)).forEach((src, index) => {
    window.setTimeout(() => warmImage(src), index * 45);
  });
};

const finishEntrance = () => {
  document.documentElement.classList.add("entrance-complete");
  document.body.classList.add("is-loaded");
  runWhenIdle(warmScrollAssets, 900);

  if (entrance) {
    window.setTimeout(() => {
      entrance.hidden = true;
    }, prefersReducedMotion ? 0 : 560);
  }
};

const runEntrance = () => {
  if (!entrance || !entranceActive || prefersReducedMotion) {
    finishEntrance();
    return;
  }

  runWhenIdle(warmScrollAssets, 700);
  window.setTimeout(finishEntrance, 1900);
};

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const getEditableValue = (source, path) =>
  path.split(".").reduce((value, key) => {
    if (value == null) {
      return undefined;
    }

    return Array.isArray(value) ? value[Number(key)] : value[key];
  }, source);

const applyEditableContent = (content) => {
  if (!content || typeof content !== "object") {
    return;
  }

  if (content.seo?.title) {
    document.title = content.seo.title;
  }

  const description = document.querySelector('meta[name="description"]');

  if (description && content.seo?.description) {
    description.setAttribute("content", content.seo.description);
  }

  document.querySelectorAll("[data-content]").forEach((element) => {
    const value = getEditableValue(content, element.dataset.content);

    if (typeof value === "string" && value.trim()) {
      element.textContent = value;
    }
  });

  if (content.contact?.email) {
    const email = content.contact.email.trim();

    document.querySelectorAll("[data-contact-email]").forEach((element) => {
      element.href = `mailto:${email}`;
    });

    document.querySelectorAll("[data-contact-email-label]").forEach((element) => {
      element.textContent = email;
    });
  }

  Object.entries(content.social || {}).forEach(([network, url]) => {
    if (typeof url !== "string" || !url.trim()) {
      return;
    }

    document.querySelectorAll(`[data-social="${network}"]`).forEach((element) => {
      element.href = url;
    });
  });
};

const loadEditableContent = async () => {
  for (const url of editableContentUrls) {
    try {
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        continue;
      }

      applyEditableContent(await response.json());
      return;
    } catch {
      applyEditableContent(null);
    }
  }
};

loadEditableContent();

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
  const scrollThreshold = mobileHeroQuery.matches ? 0 : 12;
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
  const top = Math.max(0, isTop ? 0 : window.scrollY + target.getBoundingClientRect().top - headerOffset);

  if (instant || prefersReducedMotion) {
    window.scrollTo(0, top);
  } else {
    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }

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
  const syncInitialHash = () => {
    let attempts = 0;

    const sync = () => {
      if (!window.location.hash || !scrollToHash(window.location.hash, false, true)) {
        return;
      }

      attempts += 1;

      const target = getScrollTarget(window.location.hash);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const delta =
        window.location.hash === "#top"
          ? window.scrollY
          : target.getBoundingClientRect().top - header.getBoundingClientRect().height;
      const canAlignMore = window.scrollY < maxScroll - 2;

      if (attempts < 18 && Math.abs(delta) > 2 && canAlignMore) {
        window.setTimeout(sync, 220);
      }
    };

    sync();
  };

  requestAnimationFrame(syncInitialHash);

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

window.addEventListener("hashchange", () => scrollToHash(window.location.hash, false));

runEntrance();

const revealTargets = Array.from(document.querySelectorAll(
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
));
const isMobileViewport = mobileHeroQuery.matches;
const mobileRevealSelectors = [
  ".thesis .section-kicker",
  ".thesis h2",
  ".loop-copy",
  ".content-proof-copy",
  ".section-head",
  ".proof .section-kicker",
  ".proof h2",
  ".clients-copy",
  ".contact > *",
].join(",");
const animatedRevealTargets = isMobileViewport
  ? revealTargets.filter((target) => target.matches(mobileRevealSelectors))
  : revealTargets;
const immediateRevealTargets = isMobileViewport
  ? revealTargets.filter((target) => !target.matches(mobileRevealSelectors))
  : [];

if (!prefersReducedMotion) {
  document.documentElement.classList.add("motion-ready");

  immediateRevealTargets.forEach((target) => target.classList.add("is-visible"));

  animatedRevealTargets.forEach((target, index) => {
    target.dataset.reveal = "";
    target.style.setProperty("--reveal-delay", isMobileViewport ? "0ms" : `${(index % 5) * 55}ms`);
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

  animatedRevealTargets.forEach((target) => revealObserver.observe(target));
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

const scrollRails = document.querySelectorAll(".content-rail, .loop-steps, .service-grid, .metrics");

const ensureRailProgress = (rail) => {
  const next = rail.nextElementSibling;

  if (next?.classList.contains("rail-progress")) {
    return next;
  }

  const progress = document.createElement("div");
  const bar = document.createElement("span");

  progress.className = "rail-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.hidden = true;
  progress.append(bar);
  rail.insertAdjacentElement("afterend", progress);

  return progress;
};

const syncRailState = (rail) => {
  const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
  const isScrollable = maxScroll > 4;
  const progress = ensureRailProgress(rail);

  rail.classList.toggle("is-scrollable", isScrollable);
  rail.classList.toggle("has-scroll-prev", isScrollable && rail.scrollLeft > 6);
  rail.classList.toggle("has-scroll-next", isScrollable && rail.scrollLeft < maxScroll - 6);

  progress.hidden = !isScrollable;

  if (!isScrollable) {
    return;
  }

  const trackWidth = progress.clientWidth || 140;
  const progressWidth = Math.max(28, (trackWidth * rail.clientWidth) / rail.scrollWidth);
  const progressLeft = ((trackWidth - progressWidth) * rail.scrollLeft) / maxScroll;

  progress.style.setProperty("--rail-progress-width", `${progressWidth}px`);
  progress.style.setProperty("--rail-progress-left", `${progressLeft}px`);
};

const syncScrollableRails = () => {
  scrollRails.forEach(syncRailState);
};

const scheduleRailSync = (rail) => {
  if (rail.dataset.railSyncing === "true") {
    return;
  }

  rail.dataset.railSyncing = "true";

  requestAnimationFrame(() => {
    rail.dataset.railSyncing = "false";
    syncRailState(rail);
  });
};

syncScrollableRails();
window.addEventListener("resize", syncScrollableRails, { passive: true });
window.addEventListener("load", syncScrollableRails, { once: true });

scrollRails.forEach((rail) => {
  rail.addEventListener("scroll", () => scheduleRailSync(rail), { passive: true });
});

const railObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        scheduleRailSync(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

scrollRails.forEach((rail) => railObserver.observe(rail));

if ("ResizeObserver" in window) {
  const railResizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => scheduleRailSync(entry.target));
  });

  scrollRails.forEach((rail) => railResizeObserver.observe(rail));
}

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
