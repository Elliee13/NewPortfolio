const root = document.documentElement;
const body = document.body;
const mobileBtn = document.getElementById("mobileBtn");
const mobileMenu = document.getElementById("mobileMenu");
const mobileLinks = [...document.querySelectorAll("[data-mobile-link]")];
const filterButtons = [...document.querySelectorAll(".filterBtn")];
const projectCards = [...document.querySelectorAll(".projectCard")];
const projectLabels = [...document.querySelectorAll(".projectGroupLabel")];

const galleryModal = document.getElementById("galleryModal");
const gallerySource = document.getElementById("gSource");
const galleryImage = document.getElementById("gImg");
const galleryTitle = document.getElementById("gTitle");
const galleryMeta = document.getElementById("gMeta");
const galleryThumbs = document.getElementById("gThumbs");
const galleryPrev = document.getElementById("gPrev");
const galleryNext = document.getElementById("gNext");
const galleryClose = document.getElementById("gClose");
const galleryZoomIn = document.getElementById("gZoomIn");
const galleryZoomOut = document.getElementById("gZoomOut");

const caseStudyModal = document.getElementById("caseStudyModal");
const caseStudyTitle = document.getElementById("caseStudyTitle");
const caseStudyBadge = document.getElementById("caseStudyBadge");
const caseStudyDescription = document.getElementById("caseStudyDescription");
const caseStudyProblem = document.getElementById("caseStudyProblem");
const caseStudyApproach = document.getElementById("caseStudyApproach");
const caseStudyResult = document.getElementById("caseStudyResult");
const caseStudyTools = document.getElementById("caseStudyTools");
const caseStudyGallery = document.getElementById("caseStudyGallery");
const caseStudyClose = document.getElementById("caseStudyClose");
const caseStudyOpenGallery = document.getElementById("caseStudyOpenGallery");

const categoryLabels = {
  all: "All",
  uiux: "UI/UX",
  graphic: "Graphic",
  branding: "Esports",
};

const caseStudies = {
  "valentines-flea": {
    title: "Valentine's Flea Campaign Design",
    category: "Graphic",
    description:
      "A multi-asset event campaign for a Valentine-themed flea, designed to unify vendor promotions, announcements, and event information under one cohesive visual identity.",
    problem:
      "The event featured multiple vendors, product categories, and promotional posts, which made consistency the main challenge. The campaign needed to feel like one recognizable Valentine experience while still giving each vendor enough visual distinction to communicate their own offer clearly.",
    approach:
      "I built a soft, romantic campaign system using pink tones, heart motifs, airy backgrounds, playful typography, and product-forward layouts. That visual direction was then adapted across fragrance, flowers, coffee, apparel, photobooth, food, notice posts, location graphics, and event-day announcements to keep the event visually unified across different content types.",
    result:
      "Delivered a cohesive campaign system that helped the event present itself as one recognizable experience rather than a disconnected set of vendor promotions.",
    tools: ["Photoshop", "Canva", "Figma"],
  },
  "sps-graphics": {
    title: "SPS Graphics",
    category: "Graphic",
    description:
      "A social campaign series for a shipping and logistics brand, designed to make service benefits easier to understand and faster to scan.",
    problem:
      "SPS needed customer-facing graphics that could explain shipping and logistics services in a simple, visually clear way. The challenge was making practical service information feel engaging on social media without losing readability or brand consistency.",
    approach:
      "I built the series around fast-scanning layouts, bold hierarchy, and message-first compositions so key offers and service benefits were immediately visible. I used a clean visual system with consistent typography, structured spacing, and repeated CTA placement to keep the campaign recognizable across multiple posts.",
    result:
      "Delivered a cohesive set of promotional graphics that made SPS's services easier to communicate across social content while maintaining a consistent campaign look.",
    tools: ["Photoshop", "Canva", "Figma"],
  },
  "tax-graphics": {
    title: "Tax Graphics",
    category: "Graphic",
    description:
      "A social graphics series for a tax and accounting brand, designed to make professional services feel clearer, more approachable, and more trustworthy.",
    problem:
      "The client needed promotional graphics that could present tax and accounting services in a way that felt credible, understandable, and less intimidating to potential clients. The main challenge was turning technical or service-heavy messaging into visuals that were both professional and easy to absorb on social media.",
    approach:
      "I focused on clarity, trust, and readability by using structured layouts, clear headline emphasis, and supportive visual cues that simplified each message. The series was designed to feel consistent from post to post while keeping each graphic direct, approachable, and aligned with the client's service-oriented brand.",
    result:
      "Created a unified set of campaign graphics that helped communicate tax-related services more clearly and gave the brand a more polished, accessible social presence.",
    tools: ["Photoshop", "Canva", "Figma"],
  },
};

let modalState = {
  active: null,
  previousFocus: null,
};

let galleryState = {
  images: [],
  alt: "",
  title: "",
  category: "",
  index: 0,
  zoom: 1,
};

function toWebpPath(src, small = false) {
  return src.replace(/\.(png|jpe?g)$/i, small ? "-sm.webp" : ".webp");
}

function createPictureMarkup(src, alt, className = "h-full w-full object-cover", sizes = "100vw") {
  const safeAlt = alt.replace(/"/g, "&quot;");
  return `
    <picture>
      <source
        type="image/webp"
        srcset="${toWebpPath(src, true)} 768w, ${toWebpPath(src)} 1440w"
        sizes="${sizes}"
      />
      <img
        src="${src}"
        alt="${safeAlt}"
        loading="lazy"
        decoding="async"
        class="${className}"
      />
    </picture>
  `;
}

function syncThemeIcons() {
  const isDark = root.classList.contains("dark");
  const icon = isDark ? "\u2600\uFE0F" : "\uD83C\uDF19";

  document.getElementById("themeIcon").textContent = icon;
  document.getElementById("themeIconMobile").textContent = icon;
}

function closeMobileMenu() {
  mobileMenu.classList.add("hidden");
  mobileBtn.setAttribute("aria-expanded", "false");
}

function openModal(modal, opener) {
  if (modalState.active && modalState.active !== modal) {
    closeModal(modalState.active, false);
  }

  modalState.previousFocus = opener || document.activeElement;
  modalState.active = modal;
  modal.classList.remove("hidden");
  body.style.overflow = "hidden";

  const focusable = getFocusable(modal);
  (focusable[0] || modal).focus();
}

function closeModal(modal, restoreFocus = true) {
  modal.classList.add("hidden");

  if (modalState.active === modal) {
    modalState.active = null;
    body.style.overflow = "";

    if (restoreFocus && modalState.previousFocus instanceof HTMLElement) {
      modalState.previousFocus.focus();
    }

    modalState.previousFocus = null;
  }
}

function getFocusable(modal) {
  return [...modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hasAttribute("hidden") && !element.closest(".hidden")
  );
}

function trapFocus(event) {
  if (event.key !== "Tab" || !modalState.active) {
    return;
  }

  const focusable = getFocusable(modalState.active);

  if (!focusable.length) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setActiveFilter(button) {
  filterButtons.forEach((item) => {
    item.classList.remove("bg-brand-500", "text-white", "border-brand-500");
  });

  button.classList.add("bg-brand-500", "text-white", "border-brand-500");
}

function applyFilter(filter) {
  projectCards.forEach((card) => {
    const show = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !show);
  });

  projectLabels.forEach((label) => {
    const show = filter === "all" || label.dataset.category === filter;
    label.classList.toggle("hidden", !show);
  });
}

function setZoom(nextZoom) {
  galleryState.zoom = Math.min(3, Math.max(1, nextZoom));
  galleryImage.style.transform = `scale(${galleryState.zoom})`;
}

function renderGalleryThumbs() {
  galleryThumbs.innerHTML = "";

  galleryState.images.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "h-16 w-24 flex-none overflow-hidden rounded-2xl border transition " +
      (index === galleryState.index
        ? "border-white/80"
        : "border-white/20 hover:border-white/40 focus-visible:border-white/70");
    button.setAttribute("aria-label", `View image ${index + 1}`);
    button.innerHTML = createPictureMarkup(src, `${galleryState.title} thumbnail ${index + 1}`, "h-full w-full object-cover", "96px");
    button.addEventListener("click", () => showGalleryImage(index));
    galleryThumbs.appendChild(button);
  });
}

function showGalleryImage(index) {
  galleryState.index = (index + galleryState.images.length) % galleryState.images.length;
  const src = galleryState.images[galleryState.index];
  gallerySource.setAttribute("srcset", `${toWebpPath(src, true)} 768w, ${toWebpPath(src)} 1440w`);
  galleryImage.src = src;
  galleryImage.alt = `${galleryState.alt} image ${galleryState.index + 1}`;
  setZoom(1);
  renderGalleryThumbs();
}

function openGallery(card, opener, initialIndex = 0) {
  galleryState = {
    images: (card.dataset.images || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    alt: card.dataset.title || "Portfolio image",
    title: card.dataset.title || "Project",
    category: categoryLabels[card.dataset.category] || "Work",
    index: 0,
    zoom: 1,
  };

  galleryTitle.textContent = galleryState.title;
  galleryMeta.textContent = galleryState.category;
  openModal(galleryModal, opener);
  showGalleryImage(initialIndex);
}

function renderCaseStudyGallery(card) {
  const images = (card.dataset.images || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  caseStudyGallery.innerHTML = "";

  images.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-soft transition hover:border-brand-500/50 dark:border-slate-800 dark:bg-slate-900";
    button.setAttribute("aria-label", `Open ${card.dataset.title} image ${index + 1} in fullscreen gallery`);
    button.innerHTML = `
      <div class="aspect-square overflow-hidden">
        ${createPictureMarkup(src, `${card.dataset.title} case study image ${index + 1}`)}
      </div>
    `;
    button.addEventListener("click", () => {
      closeModal(caseStudyModal, false);
      openGallery(card, button, index);
    });
    caseStudyGallery.appendChild(button);
  });
}

function openCaseStudy(caseStudyId, opener) {
  const caseStudy = caseStudies[caseStudyId];
  const card = document.querySelector(`[data-case-study="${caseStudyId}"]`);

  if (!caseStudy || !card) {
    return;
  }

  caseStudyTitle.textContent = caseStudy.title;
  caseStudyBadge.textContent = caseStudy.category;
  caseStudyDescription.textContent = caseStudy.description || "Project overview";
  caseStudyProblem.textContent = caseStudy.problem;
  caseStudyApproach.textContent = caseStudy.approach;
  caseStudyResult.textContent = caseStudy.result;
  caseStudyTools.innerHTML = caseStudy.tools
    .map(
      (tool) =>
        `<span class="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">${tool}</span>`
    )
    .join("");

  caseStudyOpenGallery.onclick = () => {
    closeModal(caseStudyModal, false);
    openGallery(card, caseStudyOpenGallery);
  };

  renderCaseStudyGallery(card);
  openModal(caseStudyModal, opener);
}

document.getElementById("year").textContent = new Date().getFullYear();

if (localStorage.getItem("theme") === "dark") {
  root.classList.add("dark");
}

syncThemeIcons();

document.getElementById("themeToggle").addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
  syncThemeIcons();
});

document.getElementById("themeToggleMobile").addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
  syncThemeIcons();
});

mobileBtn.addEventListener("click", () => {
  const isHidden = mobileMenu.classList.toggle("hidden");
  mobileBtn.setAttribute("aria-expanded", String(!isHidden));
});

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFilter(button);
    applyFilter(button.dataset.filter);
  });
});

setActiveFilter(filterButtons[0]);
applyFilter("all");

document.querySelectorAll(".galleryTrigger").forEach((button) => {
  button.addEventListener("click", () => {
    openGallery(button.closest(".projectCard"), button);
  });
});

document.querySelectorAll(".caseStudyTrigger").forEach((button) => {
  button.addEventListener("click", () => {
    openCaseStudy(button.dataset.caseStudy, button);
  });
});

galleryPrev.addEventListener("click", () => showGalleryImage(galleryState.index - 1));
galleryNext.addEventListener("click", () => showGalleryImage(galleryState.index + 1));
galleryClose.addEventListener("click", () => closeModal(galleryModal));
galleryZoomIn.addEventListener("click", () => setZoom(galleryState.zoom + 0.25));
galleryZoomOut.addEventListener("click", () => setZoom(galleryState.zoom - 0.25));

caseStudyClose.addEventListener("click", () => closeModal(caseStudyModal));

[galleryModal, caseStudyModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target.dataset.modalClose === "true") {
      closeModal(modal);
    }
  });
});

document.addEventListener("keydown", (event) => {
  trapFocus(event);

  if (!modalState.active) {
    return;
  }

  if (event.key === "Escape") {
    closeModal(modalState.active);
    return;
  }

  if (modalState.active === galleryModal) {
    if (event.key === "ArrowLeft") {
      showGalleryImage(galleryState.index - 1);
    }

    if (event.key === "ArrowRight") {
      showGalleryImage(galleryState.index + 1);
    }

    if (event.key === "+" || event.key === "=") {
      setZoom(galleryState.zoom + 0.25);
    }

    if (event.key === "-") {
      setZoom(galleryState.zoom - 0.25);
    }
  }
});
