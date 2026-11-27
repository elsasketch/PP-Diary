/* ==========================================================
   Reusable UI components (return HTML strings or DOM nodes)
   ========================================================== */
window.PP = window.PP || {};
PP.screens = PP.screens || {};

PP.ui = (function () {
  const I = PP.icons;

  /** Create a DOM element from an HTML string. */
  function h(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const img = (name, cls = "", style = "") => `<img src="assets/img/${name}.png" alt="" class="${cls}" style="${style}" draggable="false">`;

  /** Stacked soft-serve poop icon. */
  function poop(color = "var(--c-peach)", w = 44, h = null, extra = "") {
    const hh = h == null ? Math.round(w * 0.77) : h;
    return `<svg class="poop" viewBox="0 0 100 77" width="${w}" height="${hh}" ${extra} aria-hidden="true">
      <g fill="${color}">
        <rect x="0" y="48" width="100" height="29" rx="14.5"/>
        <ellipse cx="17" cy="52" rx="15" ry="13"/><ellipse cx="83" cy="52" rx="15" ry="13"/>
        <rect x="12" y="31" width="76" height="25" rx="12.5"/>
        <ellipse cx="29" cy="34" rx="13" ry="11"/><ellipse cx="71" cy="34" rx="13" ry="11"/>
        <rect x="24" y="16" width="52" height="23" rx="11.5"/>
        <path d="M50 0Q60 7 70 24L30 24Q40 7 50 0Z"/>
      </g>
    </svg>`;
  }

  /** Round glass icon button. */
  function circleBtn(icon, action, label) {
    return `<button class="circle-btn pressable" data-action="${action}" aria-label="${label || action}">${I[icon]}</button>`;
  }

  /** Top bar: menu on the left, any of search / profile / home on the right. */
  function topbar(trailing = ["profile"], style = "margin-top:13px") {
    const right = trailing.map((t) => circleBtn(t, "nav-" + t, t)).join("");
    return `<header class="topbar" style="${style}">${circleBtn("menu", "nav-menu", "menu")}<span class="spacer"></span>${right}</header>`;
  }

  /** Wire the common top-bar actions inside a screen element. */
  function bindTopbar(root) {
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-action^='nav-']");
      if (!b) return;
      const a = b.dataset.action;
      if (a === "nav-menu") openMenu();
      if (a === "nav-search") PP.router.go("friends");
      if (a === "nav-profile") PP.router.go("profile/elsa");
      if (a === "nav-home") PP.router.home();
    });
  }

  /** Questionnaire header (title + left-flush beige subtitle bar). */
  function qHeader(title, subtitle) {
    return `<div class="q-header"><h1 class="q-title">${esc(title)}</h1><p class="q-subtitle">${esc(subtitle)}</p></div>`;
  }

  /** ‹ ▬ • • • • • • ›  (step is 0-based, 7 positions) */
  function stepNav(step, opts = {}) {
    const dots = Array.from({ length: 7 }, (_, i) => `<i class="${i === step ? "is-active" : ""}"></i>`).join("");
    const backCls = opts.backDark ? "chev-btn--dark" : "";
    const fwdCls = (opts.forwardDark ? "chev-btn--dark " : "") + (opts.hideForward ? "is-hidden" : "");
    return `<nav class="step-nav">
      <button class="chev-btn pressable ${backCls}" data-action="step-back" aria-label="back">${I.chevronLeft}</button>
      <div class="step-indicator" aria-label="step ${step + 1} of 7">${dots}</div>
      <button class="chev-btn pressable ${fwdCls}" data-action="step-next" aria-label="next">${I.chevronRight}</button>
    </nav>`;
  }

  /** Jar container – content goes inside .jar__fill. */
  function jar(inner = "") {
    // The fog sits outside the scrolling area so it never moves or leaves a gap while scrolling.
    return `<div class="jar"><div class="jar__fill">${inner}</div>
      <svg class="jar__fog" viewBox="0 0 402 130" preserveAspectRatio="none" aria-hidden="true">
        <defs><filter id="jarFog" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs>
        <path filter="url(#jarFog)" fill="#fff" d="M-30-30H432V52C405 40 385 70 355 74C318 79 300 40 262 46C220 52 205 86 160 70C130 60 115 40 85 50C55 60 35 78-30 72Z"/>
      </svg><div class="jar__outline"></div></div>`;
  }

  function postLabel(name, date) {
    return `<div class="post-label"><span class="post-label__by">POOPED BY</span><span class="post-label__name">${esc(name)}</span><small>${esc(date)}</small></div>`;
  }

  function actionPill(liked) {
    return `<div class="action-pill">
      <button data-action="post-add" aria-label="add friend">${I.addPerson}</button>
      <button data-action="post-like" aria-label="like">${liked ? I.heartFill : I.heart}</button>
      <button data-action="post-share" aria-label="share">${I.share}</button>
    </div>`;
  }

  /**
   * Posts stacked inside a jar (shared by "Our Poopoo" and Profile).
   * Oldest post sits at the bottom, newest on top. Rows alternate:
   *   even – drawing on the left, label on the right
   *   odd  – label on the left, drawing on the right
   * The stack grows taller than the jar when there are many posts; the jar scrolls.
   */
  function jarPosts(posts, { selectedId = null } = {}) {
    const ROW = 230;
    const ordered = posts.slice().reverse();
    const items = ordered.map((p, i) => {
      const base = i * ROW;
      const even = i % 2 === 0;
      const name = PP.state.displayLabel(p.authorID);
      const pill = selectedId === p.id ? actionPill(p.liked) : "";
      const artLeft = even ? 18 : 146;
      const artW = p.art ? 238 : (p.artwork === "illus_character" ? 237 : 110);
      const artStyle = `left:${artLeft + (p.art ? 0 : (238 - artW) / 2)}px; bottom:${base + 14}px; width:${artW}px`;
      const art = p.art
        ? PP.drawArt.artworkSvg(p.art, `class="post-art" data-post="${p.id}" data-author="${p.authorID}" style="${artStyle}" role="img" aria-label="poop drawing"`)
        : `<img class="post-art" data-post="${p.id}" data-author="${p.authorID}" src="assets/img/${p.artwork}.png" alt="" style="${artStyle}">`;
      const labelLeft = even ? 214 : 30;
      return `${art}
        <div class="post" data-post="${p.id}" data-author="${p.authorID}" style="left:${labelLeft}px; bottom:${base + 150}px; max-width:calc(100% - ${labelLeft}px - var(--jar-wall))">
          ${pill}<button class="pressable" data-action="post-toggle">${postLabel(name, p.date)}</button>
        </div>`;
    }).join("");
    const empty = posts.length ? "" : `<p class="jar__empty">No poop yet!<br>Finish a poop and it lands here.</p>`;
    return `<div class="jar__stack" style="height:max(100%, ${ordered.length * ROW + 80}px)">${items}${empty}</div>`;
  }

  /* ---------- Overlays ---------- */

  function overlay(node) {
    const root = document.getElementById("overlay-root");
    root.appendChild(node);
    return () => node.remove();
  }

  function popup(bodyHTML, onClose) {
    const node = h(`<div class="popup-scrim">
      <div class="popup">
        <button class="popup__close" data-action="close" aria-label="close">${I.close}</button>
        <div class="popup__body">${bodyHTML}</div>
      </div>
    </div>`);
    const close = overlay(node);
    const done = () => { close(); onClose && onClose(); };
    node.addEventListener("click", (e) => {
      if (e.target === node || e.target.closest("[data-action='close']")) done();
    });
    return { node, close: done };
  }

  function sharePopup(name) {
    const p = popup(`
      <button class="share-card" data-action="do-share">
        <span class="share-card__avatar">${I.profile}</span>
        <span class="share-card__name">${esc(name.charAt(0).toUpperCase() + name.slice(1))}</span>
      </button>`);
    p.node.querySelector("[data-action='do-share']").addEventListener("click", async () => {
      const text = `Come poop with ${name} on PP Diary 💩`;
      try {
        if (navigator.share) await navigator.share({ title: "PP Diary", text });
        else { await navigator.clipboard.writeText(text); toast("Copied!"); }
      } catch (e) { /* user cancelled */ }
    });
    return p;
  }

  function unfriendPopup(onYes) { return confirmPopup("Unfriend", onYes); }

  /** Nickname editor. onSave(name) gets the trimmed name. */
  function nicknamePopup(current, onSave, opts = {}) {
    const p = popup(`
      <form class="nick" novalidate>
        <h2>${esc(opts.title || "Your nickname")}</h2>
        <input class="nick__input" name="nick" maxlength="20" autocomplete="nickname" enterkeyhint="done"
          placeholder="e.g. Poopoo Queen" value="${esc(current || "")}">
        <p class="nick__err" aria-live="polite"></p>
        <button class="glass glass--sage pressable unfriend__yes" type="submit">SAVE</button>
      </form>`, opts.onClose);
    const form = p.node.querySelector("form");
    const input = form.querySelector("input");
    const err = form.querySelector(".nick__err");
    setTimeout(() => { input.focus(); input.select(); }, 250);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = input.value.replace(/\s+/g, " ").trim();
      if (!name) { err.textContent = "Please type a nickname"; input.focus(); return; }
      onSave(name);
      p.close();
    });
    return p;
  }

  /** Edit own profile: nickname + IG + LINE ID (IG and LINE are optional). */
  function profilePopup(me, onSave) {
    const p = popup(`
      <form class="nick nick--profile" novalidate>
        <h2>Edit profile</h2>
        <label class="nick__label">nickname
          <input class="nick__input" name="name" maxlength="20" autocomplete="nickname" value="${esc(me.name || "")}" placeholder="e.g. Poopoo Queen"></label>
        <label class="nick__label">ig
          <input class="nick__input" name="instagram" maxlength="31" autocapitalize="off" autocorrect="off" spellcheck="false"
            value="${esc(me.instagram || "")}" placeholder="your_ig (optional)"></label>
        <label class="nick__label">line ID
          <input class="nick__input" name="lineID" maxlength="20" autocapitalize="off" autocorrect="off" spellcheck="false"
            value="${esc(me.lineID || "")}" placeholder="optional"></label>
        <p class="nick__err" aria-live="polite"></p>
        <button class="glass glass--sage pressable unfriend__yes" type="submit">SAVE</button>
      </form>`);
    const form = p.node.querySelector("form");
    const err = form.querySelector(".nick__err");
    form.addEventListener("input", () => { err.textContent = ""; });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.replace(/\s+/g, " ").trim();
      const instagram = form.instagram.value.trim().replace(/^@+/, "");
      const lineID = form.lineID.value.trim();
      if (!name) { err.textContent = "Please type a nickname"; form.name.focus(); return; }
      if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) {
        err.textContent = "ig can only use letters, numbers, . and _"; form.instagram.focus(); return;
      }
      if (/\s/.test(lineID)) { err.textContent = "line ID can't have spaces"; form.lineID.focus(); return; }
      onSave({ name, instagram, lineID });
      p.close();
    });
    return p;
  }

  /** YES / NO popup (same look as Unfriend). */
  function confirmPopup(title, onYes) {
    const p = popup(`
      <div class="unfriend">
        <h2>${esc(title)}</h2>
        <div class="unfriend__row">
          <button class="glass glass--sage pressable unfriend__yes" data-action="yes">YES</button>
          <button class="pressable unfriend__no" data-action="close">NO</button>
        </div>
      </div>`);
    p.node.querySelector("[data-action='yes']").addEventListener("click", () => { onYes(); p.close(); });
    return p;
  }

  function openMenu() {
    const items = [
      ["Home", "home"], ["Start pooping !", "q/1"], ["Dump Poop", "calendar"],
      ["Poop Tips", "monthly"], ["Our Poopoo", "friends"], ["My Profile", "profile/elsa"]
    ];
    const node = h(`<div class="menu-scrim"><nav class="menu">
      <img src="assets/img/logo.svg" alt="PP Diary" draggable="false">
      ${items.map(([t, r]) => `<button class="glass glass--beige pressable" data-route="${r}">${t}</button>`).join("")}
    </nav></div>`);
    const close = overlay(node);
    node.addEventListener("click", (e) => {
      const b = e.target.closest("[data-route]");
      if (b) {
        close();
        const r = b.dataset.route;
        if (r === "q/1") PP.state.startDraft();
        r === "home" ? PP.router.home() : PP.router.go(r);
      } else if (e.target === node) {
        close();
      }
    });
  }

  function confetti(container, count = 34) {
    const layer = h(`<div class="confetti"></div>`);
    for (let i = 0; i < count; i++) {
      const size = 22 + Math.random() * 14;
      const color = i % 3 === 0 ? "var(--c-poop-cyan)" : "var(--c-poop-red)";
      const wrap = h(`<div>${poop(color, Math.round(size))}</div>`).firstElementChild;
      wrap.style.left = (5 + Math.random() * 90) + "%";
      wrap.style.setProperty("--delay", (Math.random() * 0.9).toFixed(2) + "s");
      wrap.style.setProperty("--dur", (2.2 + Math.random() * 1.2).toFixed(2) + "s");
      wrap.style.setProperty("--spin", Math.round(-360 + Math.random() * 720) + "deg");
      wrap.style.setProperty("--drift", Math.round(-60 + Math.random() * 120) + "px");
      layer.appendChild(wrap);
    }
    container.appendChild(layer);
    setTimeout(() => layer.remove(), 4500);
  }

  function toast(text) {
    const node = h(`<div class="toast">${esc(text)}</div>`);
    const close = overlay(node);
    setTimeout(close, 1400);
  }

  function haptic(ms = 12) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  return {
    h, esc, img, poop, circleBtn, topbar, bindTopbar, qHeader, stepNav, jar, postLabel, actionPill, jarPosts,
    popup, sharePopup, unfriendPopup, confirmPopup, nicknamePopup, profilePopup, openMenu, confetti, toast, haptic
  };
})();
