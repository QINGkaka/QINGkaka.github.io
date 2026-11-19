(() => {
  const config = window.SITE_CONFIG || {};

  const setupLink = (kind, url) => {
    document.querySelectorAll(`[data-link="${kind}"]`).forEach((link) => {
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.classList.remove("is-pending");
        link.querySelectorAll("small, b").forEach((label) => { label.textContent = "Open ↗"; });
      } else {
        link.classList.add("is-pending");
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => event.preventDefault());
      }
    });
  };

  setupLink("paper", config.paperUrl);
  setupLink("code", config.codeUrl);

  if (Array.isArray(config.authors) && config.authors.length) {
    const authorBlock = document.querySelector("#authors");
    const names = document.createElement("p");
    config.authors.forEach((author) => {
      const item = document.createElement("span");
      const name = typeof author === "string" ? author : author.name;
      item.append(document.createTextNode(name));
      (author.marks || []).forEach((mark, index) => {
        const sup = document.createElement("sup");
        sup.textContent = (index > 0 && /^\d+$/.test(mark) ? "," : "") + mark;
        item.append(sup);
      });
      names.append(item);
    });
    authorBlock.append(names);

    if (Array.isArray(config.authorNotes) && config.authorNotes.length) {
      const notes = document.createElement("p");
      notes.className = "author-notes";
      config.authorNotes.forEach(({ mark, label }) => {
        const item = document.createElement("span");
        item.textContent = `${mark} ${label}`;
        notes.append(item);
      });
      authorBlock.append(notes);
    }

    if (Array.isArray(config.affiliations) && config.affiliations.length) {
      const affiliations = document.createElement("p");
      affiliations.className = "affiliations";
      config.affiliations.forEach((affiliation) => {
        const item = document.createElement("span");
        item.textContent = affiliation;
        affiliations.append(item);
      });
      authorBlock.append(affiliations);
    }
    authorBlock.hidden = false;
  }

  document.querySelectorAll('[data-tabs]').forEach((tabGroup) => {
    const tabList = tabGroup.querySelector(':scope > [role="tablist"]');
    if (!tabList) return;
    const tabs = [...tabList.querySelectorAll(':scope > [role="tab"]')];
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        tabs.forEach((item) => {
          const selected = item === tab;
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
          const panel = document.getElementById(item.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
      });
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
        tabs[next].click();
        tabs[next].focus();
      });
    });
  });

  const dialog = document.querySelector("#figure-dialog");
  const dialogImage = dialog.querySelector("img");
  document.querySelectorAll("[data-image]").forEach((button) => {
    button.addEventListener("click", () => {
      dialogImage.src = button.dataset.image;
      dialogImage.alt = button.querySelector("img").alt;
      document.querySelector("#dialog-caption").textContent = button.dataset.caption || "";
      dialog.showModal();
    });
  });
  dialog.querySelector("button").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

  document.querySelectorAll("video").forEach((video) => {
    video.addEventListener("play", () => {
      document.querySelectorAll("video").forEach((other) => { if (other !== video) other.pause(); });
    });
  });

  const copyButton = document.querySelector("#copy-citation");
  const copyStatus = document.querySelector("#copy-status");
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(document.querySelector("#citation-code").textContent);
    copyStatus.textContent = "Citation copied.";
    copyButton.textContent = "Copied";
    window.setTimeout(() => { copyButton.textContent = "Copy"; copyStatus.textContent = ""; }, 1800);
  });
})();
