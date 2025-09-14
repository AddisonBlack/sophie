const TOTAL_SLIDES = 17;

const slideMetaData = {
  1:  { date: "June 11, 2025", desc: "Description 1" },
  2:  { date: "June 20, 2025", desc: "Description 2" },
  3:  { date: "July 2, 2025", desc: "Description 3" },
  4:  { date: "July 2, 2025", desc: "Description 4" },
  5:  { date: "July 3, 2025", desc: "Description 5" },
  6:  { date: "July 7, 2025", desc: "Description 6" },
  7:  { date: "July 11, 2025", desc: "Description 7" },
  8:  { date: "July 12, 2025", desc: "Description 8" },
  9:  { date: "July 12, 2025", desc: "Description 9" },
  10: { date: "August 17, 2025", desc: "Description 10" },
  11: { date: "August 18, 2025", desc: "Description 11" },
  12: { date: "August 30, 2025", desc: "Description 12" },
  13: { date: "September 5, 2025", desc: "Description 13" },
  14: { date: "September 6, 2025", desc: "Description 14" },
  15: { date: "September 18, 2025", desc: "Description 15" },
  16: { date: "September 18, 2025", desc: "Description 16" },
  17: { date: "September 19, 2025", desc: "Description 17" }
};

const EXT_PRIORITY = [".jpg", ".jpeg", ".png"];
const STORAGE_KEY = "currentSlideIdx";


const dailyStartEl = document.querySelector(".daily-start");
const imgEl = document.querySelector("img.first.image");
const dateEl = document.querySelector(".date");
const descEl = document.querySelector(".image-description");
const prevBtn = document.querySelector(".ph-arrow-circle-left");
const nextBtn = document.querySelector(".ph-arrow-circle-right");
const toBeContinuedEl = document.querySelector(".to-be-continued");
const openBtn = document.getElementById("open-site");
const containerEl = document.querySelector(".container");

function localDateYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function showDailyStart() {
  dailyStartEl.style.display = "flex";
  containerEl.classList.remove("active");
}

function enableSite() {
  dailyStartEl.style.display = "none";
  containerEl.classList.add("active");
  localStorage.setItem("dailyStartSeen", localDateYYYYMMDD());
  displaySlide(current);
  preloadAround(current);
}

const seen = localStorage.getItem("dailyStartSeen");
const today = localDateYYYYMMDD();

if (seen !== today) {
  showDailyStart();
} else {
  if (dailyStartEl) dailyStartEl.style.display = "none";
  containerEl.classList.add("active");
}

if (openBtn) openBtn.addEventListener("click", enableSite);

openBtn.addEventListener("click", enableSite);

[prevBtn, nextBtn].forEach((el, i) => {
el.setAttribute("role", "button");
el.setAttribute("tabindex", "0");
el.setAttribute("aria-label", i === 0 ? "Previous photo" : "Next photo");
});

let current = 1;
let endMode = false;

const saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
if (Number.isInteger(saved) && saved >= 1 && saved <= TOTAL_SLIDES) {
  current = saved;
}

function getSlide(idx) {
  const meta = slideMetaData[idx] || {};
  return {
  idx,
  basePath: `images/image-${idx}`,
  date: meta.date || ", 2025",
  desc: meta.desc || ", 2025",
  };
}

function setImageWithFallback(img, basePath) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

  function tryNext() {
    if (attempt >= EXT_PRIORITY.length) {
      reject(new Error("No valid image extension found."));
      return;
    }
    const src = `${basePath}${EXT_PRIORITY[attempt]}`;
    img.onload = () => resolve(src);
    img.onerror = () => {
      attempt += 1;
      tryNext();
    };
    img.src = src;
  
  }
  tryNext();
  });
}

async function displaySlide(idx) {
  localStorage.setItem(STORAGE_KEY, String(idx));
  const slide = getSlide(idx);

  if (slide.date) {
    dateEl.textContent = slide.date;
    dateEl.style.display = "block";
  } else {
    dateEl.style.display = "none";
  }

  if (slide.desc) {
    descEl.textContent = slide.desc;
    descEl.style.display = "block";
  } else {
    descEl.style.display = "none";
  }

  if (idx === 1 && !endMode) {
    prevBtn.classList.add("disabled");
  } else {
    prevBtn.classList.remove("disabled");
  }

  if (endMode) {
    nextBtn.classList.add("disabled");
    toBeContinuedEl.style.display = "block";
    return;
  } else {
    nextBtn.classList.remove("disabled");
    toBeContinuedEl.style.display = "none";
  }

  playSwapAnimations();

  try {
    await setImageWithFallback(imgEl, slide.basePath);
    imgEl.alt = slide.desc ? slide.desc : `Memory ${slide.idx}`;
    if (slide.date) dateEl.textContent = slide.date;
    if (slide.desc) descEl.textContent = slide.desc;
    [imgEl, dateEl, descEl].forEach(el => {
      if (!el) return;
      el.classList.remove("is-exiting");
      void el.offsetWidth;
      el.classList.add("is-entering");
      el.addEventListener("animationend", function onEnd() {
        el.classList.remove("is-entering");
        el.removeEventListener("animationend", onEnd);
      });
    });
    imgEl.style.display = "";
  } catch (err) {
    imgEl.removeAttribute("src");
    imgEl.alt = "Image not found";
    dateEl.style.display = "none";
    descEl.style.display = "block";
    descEl.textContent = `Oops — I couldn't find images/image-${slide.idx}.{jpg|jpeg|png}`;
  }
}

function next() {
  if (endMode) return;
  if (current < TOTAL_SLIDES) {
    current++;
    displaySlide(current);
  } else {
    activateEnd();
  }
}

function prev() {
  if (endMode) {
    deactivateEnd();
    return;
  }
  if (current > 1) {
    current--;
    displaySlide(current);
  }
}

function playSwapAnimations() {
  [imgEl, dateEl, descEl].forEach(el => {
    if (!el) return;
    el.classList.remove("is-entering");
    el.classList.add("is-exiting");
    el.addEventListener("animationend", function onEnd() {
      el.classList.remove("is-exiting");
      el.removeEventListener("animationend", onEnd);
    });
  });
}

function preloadAround(idx, radius = 2) {
  const toPreload = new Set();
  for (let d = 1; d <= radius; d++) {
    const fwd = ((idx - 1 + d) % TOTAL_SLIDES) + 1;
    const back = ((idx - 1 - d + TOTAL_SLIDES) % TOTAL_SLIDES) + 1;
    [fwd, back].forEach((i) => toPreload.add(i));
  }
  toPreload.forEach((i) => {
    const basePath = `images/image-${i}`;
    EXT_PRIORITY.forEach((ext) => {
      const img = new Image();
      img.src = `${basePath}${ext}`;
    });
  });
}

function activateEnd() {
  endMode = true;
  imgEl.style.display = "none";
  dateEl.style.display = "none";
  descEl.style.display = "none";
  toBeContinuedEl.style.display = "block";
  nextBtn.classList.add("disabled");
  prevBtn.classList.remove("disabled");
}

function deactivateEnd() {
  endMode = false;
  imgEl.style.display = "";
  toBeContinuedEl.style.display = "none";
  displaySlide(current);
}

nextBtn.addEventListener("click", () => {
  next();
  preloadAround(current);
});

prevBtn.addEventListener("click", () => {
  prev();
  preloadAround(current);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    next();
    preloadAround(current);
  } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    prev();
    preloadAround(current);
  }
});

imgEl.addEventListener("click", () => {
  next();
  preloadAround(current);
});

let touchStartX = null;
imgEl.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
});

imgEl.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) {
    dx < 0 ? next() : prev();
    preloadAround(current);
  }
});

displaySlide(current);
preloadAround(current);