/* Shared drawing helpers (used by the drawing board and the daily summary) */
PP.drawArt = (function () {
  function shapePath(kind, x0, y0, x1, y1) {
    const p = new Path2D();
    const x = Math.min(x0, x1), y = Math.min(y0, y1), w = Math.abs(x1 - x0), hh = Math.abs(y1 - y0);
    const cx = x + w / 2, cy = y + hh / 2;
    const star = (pts, inner) => {
      for (let i = 0; i < pts * 2; i++) {
        const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
        const rx = (i % 2 ? inner : 1) * w / 2, ry = (i % 2 ? inner : 1) * hh / 2;
        const px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry;
        i ? p.lineTo(px, py) : p.moveTo(px, py);
      }
      p.closePath();
    };
    switch (kind) {
      case "line": case "arrow":
        p.moveTo(x0, y0); p.lineTo(x1, y1);
        if (kind === "arrow") {
          const ang = Math.atan2(y1 - y0, x1 - x0);
          [0.8, -0.8].forEach((d) => { p.moveTo(x1, y1); p.lineTo(x1 + Math.cos(ang + Math.PI * d) * 14, y1 + Math.sin(ang + Math.PI * d) * 14); });
        }
        break;
      case "square": p.roundRect ? p.roundRect(x, y, w, hh, 4) : p.rect(x, y, w, hh); break;
      case "circle": p.ellipse(cx, cy, w / 2, hh / 2, 0, 0, Math.PI * 2); break;
      case "triangle": p.moveTo(cx, y); p.lineTo(x + w, y + hh); p.lineTo(x, y + hh); p.closePath(); break;
      case "sparkle": star(4, 0.3); break;
      case "star": star(5, 0.45); break;
      case "burst": star(10, 0.6); break;
    }
    return p;
  }

  function paint(ctx, m) {
    ctx.strokeStyle = m.color;
    ctx.fillStyle = m.color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (m.kind === "pencil") {
      ctx.beginPath();
      m.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    } else {
      const p = shapePath(m.kind, m.x0, m.y0, m.x1, m.y1);
      const fillable = m.fill && m.kind !== "line" && m.kind !== "arrow";
      fillable ? ctx.fill(p) : ctx.stroke(p);
    }
  }


  /** The same marks as SVG markup (used to show saved drawings in the jar). */
  function marksToSvg(marks) {
    const f = (n) => Math.round(n * 10) / 10;
    return marks.map((m) => {
      if (m.kind === "sticker") {
        return `<image href="assets/img/${m.name}.png" x="${f(m.x - 28)}" y="${f(m.y - 28)}" width="56" height="56"/>`;
      }
      const paint = (d, closed) => {
        const fill = m.fill && closed;
        return `<path d="${d}" fill="${fill ? m.color : "none"}" stroke="${fill ? "none" : m.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      };
      if (m.kind === "pencil") return paint("M" + m.points.map(([x, y]) => `${f(x)} ${f(y)}`).join("L"), false);
      const x = Math.min(m.x0, m.x1), y = Math.min(m.y0, m.y1), w = Math.abs(m.x1 - m.x0), hh = Math.abs(m.y1 - m.y0);
      const cx = x + w / 2, cy = y + hh / 2;
      const star = (pts, inner) => "M" + Array.from({ length: pts * 2 }, (_, i) => {
        const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 ? inner : 1;
        return `${f(cx + Math.cos(a) * r * w / 2)} ${f(cy + Math.sin(a) * r * hh / 2)}`;
      }).join("L") + "Z";
      switch (m.kind) {
        case "line": return paint(`M${f(m.x0)} ${f(m.y0)}L${f(m.x1)} ${f(m.y1)}`, false);
        case "arrow": {
          const ang = Math.atan2(m.y1 - m.y0, m.x1 - m.x0);
          const head = [0.8, -0.8].map((d) => `M${f(m.x1)} ${f(m.y1)}L${f(m.x1 + Math.cos(ang + Math.PI * d) * 14)} ${f(m.y1 + Math.sin(ang + Math.PI * d) * 14)}`).join("");
          return paint(`M${f(m.x0)} ${f(m.y0)}L${f(m.x1)} ${f(m.y1)}${head}`, false);
        }
        case "square": return paint(`M${f(x + 4)} ${f(y)}H${f(x + w - 4)}Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + 4)}V${f(y + hh - 4)}Q${f(x + w)} ${f(y + hh)} ${f(x + w - 4)} ${f(y + hh)}H${f(x + 4)}Q${f(x)} ${f(y + hh)} ${f(x)} ${f(y + hh - 4)}V${f(y + 4)}Q${f(x)} ${f(y)} ${f(x + 4)} ${f(y)}Z`, true);
        case "circle": return paint(`M${f(cx - w / 2)} ${f(cy)}a${f(w / 2)} ${f(hh / 2)} 0 1 0 ${f(w)} 0a${f(w / 2)} ${f(hh / 2)} 0 1 0 ${f(-w)} 0Z`, true);
        case "triangle": return paint(`M${f(cx)} ${f(y)}L${f(x + w)} ${f(y + hh)}L${f(x)} ${f(y + hh)}Z`, true);
        case "sparkle": return paint(star(4, 0.3), true);
        case "star": return paint(star(5, 0.45), true);
        case "burst": return paint(star(10, 0.6), true);
      }
      return "";
    }).join("");
  }

  /** A saved poop drawing (poop + drawing + stickers) as one SVG. */
  function artworkSvg(art, attrs = "") {
    const W = art.size.w, H = art.size.h;
    const poop = art.blank ? "" : PP.questionnaire.render(art.shape, {
      texture: art.texture, amount: art.amount, specials: art.specials
    }).replace('<svg class="pv"', `<svg class="pv" x="0" y="0" width="${W}" height="${H}"`);
    const drawn = art.marks.filter((m) => m.kind !== "sticker");
    const stickers = art.marks.filter((m) => m.kind === "sticker");
    return `<svg viewBox="0 0 ${W} ${H}" ${attrs}>${poop}${marksToSvg(drawn)}${marksToSvg(stickers)}</svg>`;
  }

  return { shapePath, paint, marksToSvg, artworkSvg };
})();

/* 0.7 畫畫版 / 0.7 畫畫版_模板 (step 6 of 7) */
PP.screens.draw = function () {
  const { h, qHeader, stepNav, topbar, bindTopbar, img } = PP.ui;
  const I = PP.icons;
  const spec = PP.questionnaire.steps[5];
  const draft = PP.state.data.draft;

  const palette = ["#34C759", "#FFCC00", "#FF8D28", "#FF383C", "#CB7AF5", "#0088FF", "#134B45", "#AC7F5E"];
  const tools = ["pencil", "line", "arrow", "square", "circle", "triangle", "sparkle", "star", "burst"];

  const ui = { mode: "draw", tool: "line", color: "#134B45", fill: false };

  const el = h(`
    <section class="screen q q--step6 safe-top safe-bottom">
      ${topbar(["profile"])}
      ${qHeader(spec.title, spec.subtitle)}
      <div class="q-body">
        <div class="canvas-card canvas-card--draw">
          <div class="draw__base">${draft.blank ? "" : PP.questionnaire.render(draft.shape, {
            texture: draft.texture, amount: draft.amount, specials: draft.specials
          })}</div>
          <canvas class="draw__canvas"></canvas>
          <div class="draw__stickers"></div>
          <button class="draw__trash pressable" data-action="trash" aria-label="clear the canvas">${I.trash}</button>
        </div>

        <div class="draw__modes">
          <button class="glass glass-btn pressable" data-mode="template">Template</button>
          <button class="glass glass-btn pressable" data-mode="draw">Create</button>
        </div>

        <p class="draw__label">Color Palette</p>
        <div class="glass glass--beige palette">
          <div class="palette__rows">
            <div class="palette__row">
              <button class="palette__bucket pressable" data-action="fill" aria-label="fill">${img("icon_bucket")}</button>
              ${palette.map((c) => `<button class="swatch pressable" data-color="${c}" style="--sw:${c}" aria-label="${c}"></button>`).join("")}
            </div>
            <div class="palette__row palette__row--tools">
              ${tools.map((t) => `<button class="tool pressable" data-tool="${t}" aria-label="${t}">${t === "pencil" ? I.pencil : I[t]}</button>`).join("")}
            </div>
            <div class="palette__row palette__row--stickers">
              ${[1, 2, 3, 4, 5, 6, 7].map((i) => `<button class="sticker pressable" data-sticker="sticker_${i}">${img("sticker_" + i)}</button>`).join("")}
            </div>
          </div>
          <div class="v-dots v-dots--static"><i class="is-on"></i><i></i></div>
        </div>
      </div>
      ${stepNav(5)}
    </section>`);

  bindTopbar(el);

  /* ---------- Mode / palette state ---------- */
  const sync = () => {
    el.querySelector("[data-mode='template']").classList.toggle("glass--peach", ui.mode === "draw");
    el.querySelector("[data-mode='template']").classList.toggle("glass--sage", ui.mode !== "draw");
    el.querySelector("[data-mode='draw']").classList.toggle("glass--peach", ui.mode === "template");
    el.querySelector("[data-mode='draw']").classList.toggle("glass--sage", ui.mode !== "template");
    el.querySelector(".palette").dataset.mode = ui.mode;
    el.querySelectorAll("[data-color]").forEach((b) => b.classList.toggle("is-on", b.dataset.color === ui.color));
    el.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("is-on", b.dataset.tool === ui.tool));
    el.querySelector("[data-action='fill']").classList.toggle("is-on", ui.fill);
  };
  sync();

  el.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.mode) ui.mode = t.dataset.mode;
    if (t.dataset.color) ui.color = t.dataset.color;
    if (t.dataset.tool) ui.tool = t.dataset.tool;
    if (t.dataset.action === "fill") ui.fill = !ui.fill;
    if (t.dataset.sticker) addSticker(t.dataset.sticker);
    if (t.dataset.action === "trash") {
      PP.ui.confirmPopup("Start from blank?", () => {
        // Remove the poop built in steps 1–5 and everything drawn, so they can create freely.
        draft.blank = true;
        draft.marks.length = 0;
        const base = el.querySelector(".draw__base");
        base.classList.add("is-tossed");
        setTimeout(() => { base.innerHTML = ""; base.classList.remove("is-tossed"); }, 350);
        redraw();
        renderStickers();
      });
    }
    sync();
  });

  el.querySelector("[data-action='step-back']").addEventListener("click", () => PP.router.go("q/5"));
  el.querySelector("[data-action='step-next']").addEventListener("click", () => {
    PP.state.commitDraft();
    PP.router.go("daily");
  });

  /* ---------- Drawing canvas ---------- */
  const card = el.querySelector(".canvas-card--draw");
  const canvas = el.querySelector(".draw__canvas");
  const ctx = canvas.getContext("2d");
  const stickerLayer = el.querySelector(".draw__stickers");
  let current = null;

  function resize() {
    const r = card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    draft.canvasSize = { w: r.width, h: r.height };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  const shapePath = PP.drawArt.shapePath;
  const paint = (m) => PP.drawArt.paint(ctx, m);

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draft.marks.filter((m) => m.kind !== "sticker").forEach(paint);
    if (current) paint(current);
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (ui.mode !== "draw") return;
    canvas.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    current = ui.tool === "pencil"
      ? { kind: "pencil", points: [[x, y]], color: ui.color }
      : { kind: ui.tool, x0: x, y0: y, x1: x, y1: y, color: ui.color, fill: ui.fill };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!current) return;
    const [x, y] = pos(e);
    if (current.kind === "pencil") current.points.push([x, y]);
    else { current.x1 = x; current.y1 = y; }
    redraw();
  });
  const finish = () => {
    if (!current) return;
    draft.marks.push(current);
    current = null;
    redraw();
  };
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);

  /* ---------- Stickers (draggable) ---------- */
  function renderStickers() {
    stickerLayer.replaceChildren();
    draft.marks.forEach((m, idx) => {
      if (m.kind !== "sticker") return;
      const s = h(`<img class="draw__sticker" src="assets/img/${m.name}.png" alt="" draggable="false" style="left:${m.x}px; top:${m.y}px">`);
      let start = null;
      s.addEventListener("pointerdown", (e) => {
        e.stopPropagation(); s.setPointerCapture(e.pointerId);
        start = { x: e.clientX, y: e.clientY, mx: m.x, my: m.y };
      });
      s.addEventListener("pointermove", (e) => {
        if (!start) return;
        m.x = start.mx + e.clientX - start.x; m.y = start.my + e.clientY - start.y;
        s.style.left = m.x + "px"; s.style.top = m.y + "px";
      });
      s.addEventListener("pointerup", () => { start = null; });
      s.dataset.idx = idx;
      stickerLayer.appendChild(s);
    });
  }

  function addSticker(name) {
    const n = draft.marks.filter((m) => m.kind === "sticker").length;
    draft.marks.push({ kind: "sticker", name, x: 60 + (n % 5) * 48, y: 40 + (n % 3) * 52 });
    renderStickers();
  }

  el._mounted = () => { resize(); renderStickers(); };
  window.addEventListener("resize", resize);
  el._cleanup = () => window.removeEventListener("resize", resize);

  return el;
};
