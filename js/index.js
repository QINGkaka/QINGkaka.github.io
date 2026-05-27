const root = document.documentElement;
const timeValue = document.getElementById("timeValue");
const revealItems = document.querySelectorAll(".reveal");
const canvas = document.getElementById("starfield");
const ctx = canvas ? canvas.getContext("2d") : null;
const projectList = document.getElementById("projectList");

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

function bindTiltCards() {
  if (prefersReducedMotion) {
    return;
  }

  document.querySelectorAll(".tilt-card").forEach((card) => {
    if (card.dataset.tiltBound === "true") {
      return;
    }

    card.dataset.tiltBound = "true";

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
}

function bindMagneticItems() {
  if (prefersReducedMotion) {
    return;
  }

  document.querySelectorAll(".magnetic").forEach((item) => {
    if (item.dataset.magneticBound === "true") {
      return;
    }

    item.dataset.magneticBound = "true";

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

async function loadProjects() {
  if (!projectList) {
    return;
  }

  try {
    const response = await fetch(
      "https://api.github.com/users/QINGkaka/repos?sort=updated&per_page=6&type=owner"
    );

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`);
    }

    const repos = await response.json();
    const visibleRepos = repos.filter((repo) => !repo.fork).slice(0, 6);

    if (visibleRepos.length === 0) {
      projectList.innerHTML = `
        <article class="project-card project-placeholder">
          <p class="card-label">EMPTY</p>
          <h3>Projects coming soon.</h3>
          <p>GitHub 暂时没有可展示的公开仓库。</p>
        </article>
      `;
      return;
    }

    projectList.innerHTML = visibleRepos
      .map((repo) => {
        const updated = new Date(repo.updated_at).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return `
          <article class="project-card tilt-card">
            <p class="card-label">${repo.language || "PROJECT"}</p>
            <h3>${repo.name}</h3>
            <p>${repo.description || "一个正在生长中的项目入口。"}</p>
            <div class="project-meta">
              <span>Updated ${updated}</span>
              <span>★ ${repo.stargazers_count}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" rel="noreferrer">Open Repo</a>
          </article>
        `;
      })
      .join("");

    bindTiltCards();
  } catch (error) {
    projectList.innerHTML = `
      <article class="project-card project-placeholder">
        <p class="card-label">OFFLINE</p>
        <h3>GitHub data unavailable.</h3>
        <p>这会在网络恢复后自动正常显示；现在也可以直接访问 GitHub 主页。</p>
        <a href="https://github.com/QINGkaka" target="_blank" rel="noreferrer">Open GitHub</a>
      </article>
    `;
  }
}

loadProjects();

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

bindTiltCards();
bindMagneticItems();

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
