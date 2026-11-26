/* ==========================================================
   Hash router
   Routes: #/home  #/q/1…6  #/daily  #/monthly  #/calendar[?confetti=1]
           #/friends  #/profile/<userId>
   ========================================================== */
window.PP = window.PP || {};

PP.router = (function () {
  const stack = [];
  let currentEl = null;
  let forcedDir = null;

  function parse(hash) {
    const raw = (hash || "").replace(/^#\/?/, "") || "home";
    const [path, qs] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    return { name: parts[0] || "home", args: parts.slice(1), query: new URLSearchParams(qs || "") };
  }

  function render(dir) {
    const route = parse(location.hash);
    const factory = PP.screens[route.name] || PP.screens.home;
    if (currentEl && typeof currentEl._cleanup === "function") currentEl._cleanup();
    document.getElementById("overlay-root").replaceChildren();
    document.querySelectorAll(".confetti").forEach((n) => n.remove());

    const el = factory(route);
    el.classList.add("screen");
    el.classList.add(dir === "back" ? "enter-back" : dir === "none" ? "enter-fade" : "enter-forward");
    document.getElementById("app").replaceChildren(el);
    currentEl = el;
    if (typeof el._mounted === "function") el._mounted();
  }

  function onHashChange() {
    const h = location.hash || "#/home";
    let dir = forcedDir;
    forcedDir = null;
    const idx = stack.lastIndexOf(h);
    if (!dir) {
      if (idx >= 0 && idx < stack.length - 1) { stack.length = idx + 1; dir = "back"; }
      else { stack.push(h); dir = "forward"; }
    } else if (dir === "back") {
      stack.length = 0; stack.push(h);
    } else {
      stack.push(h);
    }
    render(dir);
  }

  return {
    start() {
      window.addEventListener("hashchange", onHashChange);
      if (!location.hash) history.replaceState(null, "", "#/home");
      stack.push(location.hash);
      render("none");
    },
    go(path) {
      const target = "#/" + path;
      if (location.hash === target) { render("forward"); return; }
      location.hash = target;
    },
    back() {
      if (stack.length > 1) history.back();
      else this.home();
    },
    home() {
      forcedDir = "back";
      if (location.hash === "#/home") { forcedDir = null; render("back"); return; }
      location.hash = "#/home";
    },
    refresh() { render("none"); }
  };
})();
