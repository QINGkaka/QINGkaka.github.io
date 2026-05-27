const root = document.documentElement;
const timeValue = document.getElementById("timeValue");
const revealItems = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll(".tilt-card");
const magneticItems = document.querySelectorAll(".magnetic");
const canvas = document.getElementById("starfield");
const ctx = canvas ? canvas.getContext("2d") : null;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateTime() {
  if (!timeValue) {
    return;
  }

  const formatter = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  });

  timeValue.textContent = formatter.format(new Date());
}

updateTime();
window.setInterval(updateTime, 1000);

document.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;

  root.style.setProperty("--pointer-x", `${x}%`);
  root.style.setProperty("--pointer-y", `${y}%`);
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (!prefersReducedMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  magneticItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);

      item.style.transform = `translate(${dx * 0.08}px, ${dy * 0.08}px)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });
}

const stars = [];
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resizeCanvas() {
  if (!canvas || !ctx) {
    return;
  }

  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createStars() {
  stars.length = 0;
  const total = Math.min(120, Math.floor(window.innerWidth / 12));

  for (let index = 0; index < total; index += 1) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: Math.random() * 0.26 + 0.04,
    });
  }
}

function drawStars() {
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  stars.forEach((star) => {
    const dx = pointer.x - star.x;
    const dy = pointer.y - star.y;
    const distance = Math.hypot(dx, dy);
    const push = Math.max(0, 1 - distance / 220);

    star.x -= dx * push * 0.002;
    star.y -= dy * push * 0.002;
    star.x += star.speedX;
    star.y += star.speedY;

    if (star.y > window.innerHeight + 10) {
      star.y = -10;
      star.x = Math.random() * window.innerWidth;
    }

    if (star.x < -10) {
      star.x = window.innerWidth + 10;
    } else if (star.x > window.innerWidth + 10) {
      star.x = -10;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(214, 238, 255, ${star.alpha})`;
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!prefersReducedMotion) {
    window.requestAnimationFrame(drawStars);
  }
}

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY };
});

window.addEventListener("resize", () => {
  resizeCanvas();
  createStars();
});

if (canvas && ctx) {
  resizeCanvas();
  createStars();

  if (prefersReducedMotion) {
    drawStars();
  } else {
    window.requestAnimationFrame(drawStars);
  }
}
