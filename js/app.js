/* ==========================================================
   Boot: screen-size fit → splash (0.0 app開啟) → router
   ========================================================== */
(function () {
  const app = document.getElementById("app");
  const phone = document.getElementById("phone");
  const overlayRoot = document.getElementById("overlay-root");

  /* ---------- Screen-size adaptation ----------
     The design canvas is 402 × 874 pt (iPhone 18 Pro) with 62 / 34 pt safe areas,
     leaving 778 pt of usable height. Phones that are narrower or shorter get the
     whole UI zoomed down proportionally; larger phones render 1:1. */
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;" +
    "padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);";
  document.body.appendChild(probe);

  function fit() {
    if (window.innerWidth > 500) {           // desktop: phone frame, no zoom
      app.style.zoom = overlayRoot.style.zoom = "";
      phone.style.removeProperty("--safe-top");
      phone.style.removeProperty("--safe-bottom");
      return;
    }
    const cs = getComputedStyle(probe);
    const st = Math.max(parseFloat(cs.paddingTop) || 0, 20);
    const sb = Math.max(parseFloat(cs.paddingBottom) || 0, 12);
    const f = Math.min(1, window.innerWidth / 402, (window.innerHeight - st - sb) / 778);
    app.style.zoom = overlayRoot.style.zoom = String(f);
    phone.style.setProperty("--safe-top", st / f + "px");
    phone.style.setProperty("--safe-bottom", sb / f + "px");
  }
  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);

  /* ---------- Splash → router ---------- */
  app.appendChild(PP.screens.splash());
  const delay = new URLSearchParams(location.search).has("nosplash") ? 0 : 1600;
  setTimeout(() => PP.router.start(), delay);
})();
