// Capman landing page — vanilla JS interactions
(function () {
  "use strict";

  // Scroll to top on reload
  if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  // Mobile nav
  const navToggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconOpen = document.getElementById("nav-icon-open");
  const iconClose = document.getElementById("nav-icon-close");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("hidden") === false;
      iconOpen.classList.toggle("hidden", open);
      iconClose.classList.toggle("hidden", !open);
    });

    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        iconOpen.classList.remove("hidden");
        iconClose.classList.add("hidden");
      }),
    );
  }

  // Versions dropdown
  const vBtn = document.getElementById("versions-btn");
  const vMenu = document.getElementById("versions-menu");
  const vWrap = document.getElementById("versions-wrap");

  if (vBtn && vMenu) {
    vBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      vMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (vWrap && !vWrap.contains(e.target)) vMenu.classList.add("hidden");
    });
  }

  // Copy to clipboard
  const copyBtn = document.getElementById("copy-btn");
  const copyIcon = document.getElementById("copy-icon");
  const checkIcon = document.getElementById("check-icon");

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = copyBtn.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      copyIcon.classList.add("hidden");
      checkIcon.classList.remove("hidden");
      copyBtn.classList.add("text-gold");
      setTimeout(() => {
        copyIcon.classList.remove("hidden");
        checkIcon.classList.add("hidden");
        copyBtn.classList.remove("text-gold");
      }, 1600);
    });
  }
})();