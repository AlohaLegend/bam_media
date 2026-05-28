const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");

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
