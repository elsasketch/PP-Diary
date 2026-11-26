/* 0.2 – 0.6 評量表 (steps 1–5 of 7) — step 6 lives in draw.js, step 7 is daily.js */
PP.questionnaire = {
  steps: [
    { title: "How was your poop today?", subtitle: "What’s Your Poop shape?", hint: "swipe to select your own poopoo" },
    { title: "How was your poop today?", subtitle: "How’s Your Poop Texture?", hint: "Hold and swipe down to increase" },
    { title: "How was your poop today?", subtitle: "How much did you poop?", hint: "long press to get bigger poop" },
    { title: "How was your poop today?", subtitle: "Describe your poop?", hint: "select what’s on your poop\n(if no,  just skipppppp)" },
    { title: "How was your poop today?", subtitle: "How long did you poop for?", hint: "slide down to increase the time" },
    { title: "Design your final poop !", subtitle: "Imagination is your superpower !", hint: "" }
  ],

  /* ------------------------------------------------------------------
     Poop shapes – each is a set of outlines in its own w×h box.
     Every preview (steps 1–5) is drawn from these, then transformed by
     the user's answers: texture → angularity, amount → size,
     specials → item icons placed on the outline.
     ------------------------------------------------------------------ */
  shapes: (function () {
    const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
    return {
      1: { w: 159, h: 164, paths: [
        { d: "M40 10C62 6 78 30 80 52C82 72 66 84 46 82C24 80 10 68 12 46C14 26 22 12 40 10Z", closed: true },
        { d: "M118 46C134 44 146 58 144 76C142 92 128 100 112 96C98 92 94 76 98 62C102 50 108 46 118 46Z", closed: true },
        { d: "M46 92C72 86 98 94 100 120C102 146 88 158 60 156C32 154 16 142 18 122C20 104 28 96 46 92Z", closed: true }
      ] },
      2: { w: 200, h: 80, paths: [
        { d: "M18 40c0-14 10-22 22-20 6-10 22-10 28 0 8-8 24-8 30 2 8-8 26-6 30 4 10-6 28-2 30 12 14 4 18 22 4 30-6 10-22 12-30 4-8 8-26 8-32-2-8 8-24 8-30-2-8 6-24 6-28-4-14 2-24-8-24-24z", closed: true }
      ] },
      3: { w: 220, h: 80, paths: [
        { d: "M14 46c0-18 18-28 40-28h120c18 0 32 10 32 24s-14 24-32 24H52C30 66 14 60 14 46z", closed: true },
        { d: "M60 18l6 14" }, { d: "M95 18l-4 12" }, { d: "M130 18l6 14" },
        { d: "M165 20l-6 12" }, { d: "M110 66l4-10" }, { d: "M75 66l-5-9" }
      ] },
      4: { w: 240, h: 90, paths: [
        { d: "M30 30c30-18 80-20 120-6 30 10 60 6 80-6" },
        { d: "M230 18c4 18-24 30-70 26-40-4-60 30-110 30-30 0-42-20-36-32 4-8 12-12 16-12" }
      ] },
      5: { w: 200, h: 140, paths: [
        { d: ell(55, 45, 35, 23), closed: true },
        { d: ell(140, 38, 30, 20), closed: true },
        { d: ell(100, 100, 40, 24), closed: true }
      ] },
      6: { w: 200, h: 130, paths: [
        { d: "M40 70c-22-6-20-36 4-36 0-22 30-28 42-12 12-18 44-12 44 10 22-4 36 20 22 34 18 12 6 40-18 36-8 18-40 18-50 4-14 14-44 8-44-12-14-2-18-20 0-24z", closed: true }
      ] },
      7: { w: 220, h: 90, paths: [
        { d: ell(110, 45, 100, 30), closed: true },
        { d: "M50 45q15-14 30 0t30 0 30 0 30 0" }
      ] }
    };
  })(),

  /** Sample every outline of a shape into points (cached, uses the SVG DOM once). */
  _cache: {},
  sampled(type) {
    if (this._cache[type]) return this._cache[type];
    const def = this.shapes[type] || this.shapes[7];
    let host = document.getElementById("pp-shape-sampler");
    if (!host) {
      host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      host.id = "pp-shape-sampler";
      host.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden");
      document.body.appendChild(host);
    }
    let seed = type * 9301 + 49297;
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

    const outlines = def.paths.map((p) => {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("d", p.d);
      host.appendChild(el);
      const len = el.getTotalLength();
      const n = Math.max(8, Math.round(len / 3));
      const pts = [];
      const count = p.closed ? n : n + 1;
      for (let i = 0; i < count; i++) {
        const q = el.getPointAtLength((len * i) / n);
        pts.push([q.x, q.y]);
      }
      host.removeChild(el);

      // Corners for the "angular" version: a few jittered points along the outline.
      const corners = [];
      if (p.closed) {
        const k = Math.max(3, Math.min(8, Math.round(len / 55)));
        const phase = rand();
        for (let j = 0; j < k; j++) corners.push(((j + phase + (rand() - 0.5) * 0.45) / k) % 1);
        corners.sort((a, b) => a - b);
      } else {
        const k = Math.max(1, Math.min(10, Math.round(len / 45)));
        for (let j = 0; j <= k; j++) {
          const f = j / k;
          corners.push(j === 0 || j === k ? f : f + (rand() - 0.5) * 0.4 / k);
        }
      }
      // Angular target point for each sample: straight lines between the corners.
      const at = (f) => {
        const i = Math.min(pts.length - 1, Math.round(f * n)) % pts.length;
        return pts[(i + pts.length) % pts.length];
      };
      const cp = corners.map(at);
      const sharp = pts.map((_, i) => {
        const f = i / n;
        let a, b, fa, fb;
        if (p.closed) {
          let j = corners.findIndex((c) => c > f);
          if (j === -1) j = 0;
          const jp = (j - 1 + corners.length) % corners.length;
          a = cp[jp]; b = cp[j]; fa = corners[jp]; fb = corners[j];
          if (fb <= fa) fb += 1;
          let ff = f; if (ff < fa) ff += 1;
          const u = (ff - fa) / (fb - fa || 1);
          return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
        }
        let j = corners.findIndex((c) => c >= f);
        if (j <= 0) j = 1;
        a = cp[j - 1]; b = cp[j]; fa = corners[j - 1]; fb = corners[j];
        const u = Math.max(0, Math.min(1, (f - fa) / (fb - fa || 1)));
        return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      });
      return { closed: !!p.closed, len, pts, sharp };
    });
    return (this._cache[type] = { w: def.w, h: def.h, outlines });
  },

  /** amount (0.17–1) → preview size multiplier */
  sizeFor(amount) {
    const a = Math.max(0.17, Math.min(1, amount == null ? 0.17 : amount));
    return 0.6 + 0.4 * (a - 0.17) / 0.83;
  },

  /**
   * Draw the poop as the user has described it so far.
   * opts: { texture, amount, specials, size (override), fresh (special key to pop in) }
   */
  render(type, opts = {}) {
    const VW = 340, VH = 200;
    const S = this.sampled(type);
    const t = Math.max(0, Math.min(1, opts.texture || 0));
    // fit: the size at which this shape fills the box (reached at max amount)
    const fit = Math.min(300 / S.w, 172 / S.h);
    const k = fit * (opts.size != null ? opts.size : this.sizeFor(opts.amount));
    const tx = (p) => [VW / 2 + (p[0] - S.w / 2) * k, VH / 2 + (p[1] - S.h / 2) * k];

    const shaped = S.outlines.map((o) => ({
      closed: o.closed, len: o.len,
      pts: o.pts.map((p, i) => tx([p[0] + (o.sharp[i][0] - p[0]) * t, p[1] + (o.sharp[i][1] - p[1]) * t]))
    }));
    const paths = shaped.map((o) =>
      `<path d="M${o.pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L")}${o.closed ? "Z" : ""}"/>`
    ).join("");

    // Special items sit on the outline (spread across all closed outlines).
    let items = "";
    const specials = opts.specials || [];
    if (specials.length) {
      const ring = shaped.filter((o) => o.closed);
      const src = ring.length ? ring : shaped;
      const all = [];
      src.forEach((o) => o.pts.forEach((p) => all.push(p)));
      const spot = { blood: 0.08, bile: 0.3, fat: 0.52, enoki: 0.74, threadworm: 0.9 };
      const size = { blood: 50, bile: 48, fat: 48, enoki: 54, threadworm: 50 };
      items = specials.map((key) => {
        const p = all[Math.floor((spot[key] || 0) * all.length) % all.length];
        const sz = size[key] * Math.min(1.15, Math.max(0.8, k / fit / 0.8));
        return `<g class="pv-item pv-item--${key} ${opts.fresh === key ? "is-new" : ""}">
          <image href="assets/img/item_${key}.png" x="${(p[0] - sz / 2).toFixed(1)}" y="${(p[1] - sz / 2).toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/></g>`;
      }).join("");
    }

    return `<svg class="pv" viewBox="0 0 ${VW} ${VH}" aria-hidden="true">
      <g fill="none" stroke="#676767" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths}</g>${items}</svg>`;
  },

  /** Shape option in the step-1 carousel. */
  shapeArt(type) { return this.render(type, { size: 1 }); }
};

PP.screens.q = function (route) {
  const step = Math.min(6, Math.max(1, parseInt(route.args[0] || "1", 10)));
  if (step === 6) return PP.screens.draw(route);

  const { h, qHeader, stepNav, topbar, bindTopbar, poop, img } = PP.ui;
  const Q = PP.questionnaire;
  const spec = Q.steps[step - 1];
  const draft = PP.state.data.draft;

  const bodies = {
    1: () => `
      <div class="canvas-card canvas-card--tall">
        <div class="shape-carousel">
          ${[1, 2, 3, 4, 5, 6, 7].map((t) => `<div class="shape-carousel__item" data-shape="${t}">${Q.shapeArt(t)}</div>`).join("")}
        </div>
      </div>`,
    2: () => `
      <div class="canvas-card canvas-card--preview" data-preview></div>
      <div class="plunger" aria-label="drag down to change texture">
        <div class="plunger__stick"></div>
        <div class="plunger__dome"></div>
        <div class="plunger__rim"></div>
      </div>`,
    3: () => `
      <div class="canvas-card canvas-card--preview" data-preview></div>
      <div class="amount">
        <div class="amount__poop"><img class="poop" src="assets/img/poop_btn.svg" alt="" draggable="false">${img("icon_hand", "amount__hand")}</div>
      </div>`,
    4: () => `
      <div class="canvas-card canvas-card--preview" data-preview></div>
      <div class="specials">
        <div class="specials__row specials__row--3">
          ${["blood", "bile", "fat"].map((k) => specialItem(k)).join("")}
        </div>
        <div class="specials__row specials__row--2">
          ${["enoki", "threadworm"].map((k) => specialItem(k)).join("")}
        </div>
      </div>`,
    5: () => `
      <div class="canvas-card canvas-card--preview" data-preview></div>
      <div class="duration">
        <div class="duration__field"><b class="duration__value"></b><span>mins</span></div>
        <div class="roll" aria-label="drag the paper down">
          <!-- roll axis y=50, body x 36→150; paper hangs from its bottom at the same width -->
          <i class="roll__bar roll__bar--back"></i>
          <div class="roll__paper"><div class="roll__perf"></div></div>
          <svg class="roll__art" viewBox="0 0 202 104" width="202" height="104" aria-hidden="true">
            <g stroke="#D9D9D9" stroke-width="3" stroke-linejoin="round">
              <path d="M150 2H36A16 48 0 0 0 36 98H150" fill="#fff"/>
              <ellipse cx="150" cy="50" rx="22" ry="48" fill="#E6E6E6"/>
              <ellipse cx="150" cy="50" rx="9" ry="20" fill="#fff"/>
            </g>
            <path d="M44 78H128" stroke="#D9D9D9" stroke-width="2.5" stroke-dasharray="9 7"/>
          </svg>
          <i class="roll__bar roll__bar--front"></i>
        </div>
      </div>`
  };

  function specialItem(key) {
    const labels = { blood: "Blood", bile: "Bile", fat: "Fat", enoki: "Enoki<br>See u tmr", threadworm: "Threadworm" };
    const on = draft.specials.includes(key);
    return `<button class="special pressable ${on ? "is-on" : ""}" data-special="${key}">
      ${img("item_" + key, "special__img")}<span>${labels[key]}</span></button>`;
  }

  const el = h(`
    <section class="screen q q--step${step} safe-top safe-bottom">
      ${topbar(["profile"])}
      ${qHeader(spec.title, spec.subtitle)}
      <div class="q-body">${bodies[step]()}</div>
      <p class="hint">${PP.ui.esc(spec.hint)}</p>
      ${stepNav(step - 1, { backDark: step === 1 })}
    </section>`);

  bindTopbar(el);

  el.querySelector("[data-action='step-back']").addEventListener("click", () => {
    if (step === 1) PP.router.back(); else PP.router.go("q/" + (step - 1));
  });
  el.querySelector("[data-action='step-next']").addEventListener("click", () => PP.router.go("q/" + (step + 1)));

  /* ---------- Live preview of the poop built so far ---------- */
  const previewEl = el.querySelector("[data-preview]");
  // Each step only applies the answers given up to that step.
  const drawPreview = (over = {}) => {
    if (!previewEl) return;
    const o = Object.assign({
      texture: draft.texture,
      amount: step >= 3 ? draft.amount : 0.17,
      specials: step >= 4 ? draft.specials : []
    }, over);
    previewEl.innerHTML = Q.render(draft.shape, o);
  };
  drawPreview();

  /* ---------- Step behaviours ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  if (step === 1) {
    const track = el.querySelector(".shape-carousel");
    el._mounted = () => {
      const item = track.querySelector(`[data-shape="${draft.shape}"]`);
      if (item) track.scrollLeft = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
    };
    let t;
    track.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 1, dist = Infinity;
        track.querySelectorAll("[data-shape]").forEach((it) => {
          const c = it.offsetLeft + it.clientWidth / 2;
          if (Math.abs(c - center) < dist) { dist = Math.abs(c - center); best = +it.dataset.shape; }
        });
        draft.shape = best;
      }, 80);
    }, { passive: true });
    // mouse drag support on desktop
    let down = null;
    track.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") down = { x: e.clientX, s: track.scrollLeft }; });
    const move = (e) => { if (down) track.scrollLeft = down.s - (e.clientX - down.x); };
    const up = () => { down = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el._cleanup = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }

  if (step === 2) {
    const plunger = el.querySelector(".plunger");
    const MAX = 90;
    let base = draft.texture * MAX, startY = null, cur = base;
    const apply = (v) => {
      plunger.style.setProperty("--t", (v / MAX).toFixed(3));
      drawPreview({ texture: v / MAX });
    };
    apply(base);
    plunger.addEventListener("pointerdown", (e) => {
      startY = e.clientY; plunger.setPointerCapture(e.pointerId); plunger.classList.add("is-active");
    });
    plunger.addEventListener("pointermove", (e) => {
      if (startY == null) return;
      cur = clamp(base + (e.clientY - startY), 0, MAX); apply(cur);
    });
    const end = () => {
      if (startY == null) return;
      startY = null; base = cur; draft.texture = cur / MAX; plunger.classList.remove("is-active");
    };
    plunger.addEventListener("pointerup", end);
    plunger.addEventListener("pointercancel", end);
  }

  if (step === 3) {
    const wrap = el.querySelector(".amount__poop");
    const area = el.querySelector(".amount");
    let scale = Math.max(0.17, draft.amount), raf = null;
    const apply = () => {
      wrap.style.setProperty("--s", scale.toFixed(3));
      drawPreview({ amount: scale });
    };
    apply();
    const grow = () => { scale = Math.min(1, scale + 0.008); apply(); if (scale < 1) raf = requestAnimationFrame(grow); };
    area.addEventListener("pointerdown", (e) => {
      e.preventDefault(); wrap.classList.add("is-pressing"); PP.ui.haptic(); raf = requestAnimationFrame(grow);
    });
    const stop = () => { cancelAnimationFrame(raf); wrap.classList.remove("is-pressing"); draft.amount = scale; };
    area.addEventListener("pointerup", stop);
    area.addEventListener("pointerleave", stop);
    area.addEventListener("pointercancel", stop);
    area.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  if (step === 4) {
    el.querySelectorAll("[data-special]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.special;
      const i = draft.specials.indexOf(k);
      if (i >= 0) draft.specials.splice(i, 1); else draft.specials.push(k);
      b.classList.toggle("is-on", i < 0);
      drawPreview({ fresh: i < 0 ? k : null });
    }));
  }

  if (step === 5) {
    const roll = el.querySelector(".roll");
    const value = el.querySelector(".duration__value");
    const PPM = 12; // points per minute
    let pulled = draft.minutes * PPM, startY = null, cur = pulled;
    const apply = (v) => {
      roll.style.setProperty("--pull", (v % 85) + "px");
      const m = Math.floor(v / PPM);
      value.textContent = m > 0 ? m : "";
    };
    apply(pulled);
    roll.addEventListener("pointerdown", (e) => { startY = e.clientY; roll.setPointerCapture(e.pointerId); });
    roll.addEventListener("pointermove", (e) => {
      if (startY == null) return;
      cur = Math.max(0, pulled + (e.clientY - startY)); apply(cur);
    });
    const end = () => { if (startY == null) return; startY = null; pulled = cur; draft.minutes = Math.floor(pulled / PPM); };
    roll.addEventListener("pointerup", end);
    roll.addEventListener("pointercancel", end);
    roll.addEventListener("wheel", (e) => { pulled = Math.max(0, pulled + e.deltaY * 0.3); cur = pulled; apply(pulled); draft.minutes = Math.floor(pulled / PPM); }, { passive: true });
  }

  return el;
};
