/* 0.8 日總結 / 0.8 日總結沖走 (step 7 of 7) */
PP.screens.daily = function () {
  const { h, stepNav, topbar, bindTopbar, img } = PP.ui;
  const draft = PP.state.data.draft;

  function advice() {
    const sp = draft.specials.filter((s) => s !== "enoki");
    if (sp.length) return ["worth a check!", "see a doctor<br>if it lasts"];
    if (draft.texture < 0.3) return ["too hard!", "drink more<br>water pls"];
    if (draft.texture > 0.7) return ["too soft!", "eat more<br>fiber pls"];
    return ["perfect!", "keep it up<br>buddy"];
  }
  const [verdict, tip] = advice();
  // The user's final poop: same box size as the drawing board so marks line up.
  const art = draft.canvasSize || { w: 348, h: 270 };

  const el = h(`
    <section class="screen daily">
      <div class="stage">
        <!-- toilet -->
        <svg class="at toilet" style="--x:0px; --y:340px" viewBox="0 0 402 534" aria-hidden="true">
          <defs>
            <linearGradient id="tlLid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="var(--c-cream)"/>
            </linearGradient>
            <linearGradient id="tlBowl" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#F3EEE8"/><stop offset=".35" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDE5DC"/>
            </linearGradient>
            <radialGradient id="tlWater" cx=".5" cy=".42" r=".6">
              <stop offset="0" stop-color="#A9CBBF"/><stop offset=".6" stop-color="#CFE5DC"/><stop offset="1" stop-color="#E6F2EC"/>
            </radialGradient>
            <filter id="tlGlow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#85ABA0" flood-opacity=".45"/>
            </filter>
          </defs>
          <g stroke="var(--c-sage)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
            <!-- raised lid -->
            <g filter="url(#tlGlow)">
              <path d="M78 370C46 300 38 228 48 164C62 76 126 18 201 18S340 76 354 164C364 228 356 300 324 370Z" fill="url(#tlLid)"/>
            </g>
            <path d="M104 352C78 296 72 236 80 180C92 106 142 54 201 54S310 106 322 180C330 236 324 296 298 352" fill="none" stroke-opacity=".45" stroke-width="2"/>
            <!-- hinges -->
            <rect x="112" y="322" width="36" height="24" rx="9" fill="var(--c-sage)"/>
            <rect x="254" y="322" width="36" height="24" rx="9" fill="var(--c-sage)"/>
            <!-- bowl body + pedestal -->
            <path d="M16 386C22 452 74 494 130 506L122 546H280L272 506C328 494 380 452 386 386Z" fill="url(#tlBowl)"/>
            <path d="M96 470C120 486 150 494 180 497" fill="none" stroke="#fff" stroke-width="5" stroke-opacity=".9"/>
            <!-- seat -->
            <g filter="url(#tlGlow)">
              <ellipse cx="201" cy="378" rx="192" ry="44" fill="#fff"/>
            </g>
            <ellipse cx="201" cy="380" rx="150" ry="28" fill="url(#tlWater)" stroke-width="2.5"/>
            <path d="M58 360C90 344 140 338 180 337" fill="none" stroke="#fff" stroke-width="4" stroke-opacity=".9"/>
          </g>
        </svg>
        <button class="at toilet__bowl" style="--x:5px; --y:676px" data-action="flush" aria-label="flush"></button>

        <!-- character -->
        <div class="at daily__char-clip" style="--x:0px; --y:0px">
          <button class="daily__char" data-action="flush" aria-label="flush">
            <div class="daily__art" style="width:${art.w}px; height:${art.h}px; --k:${(290 / art.w).toFixed(4)}">
              ${draft.blank ? "" : PP.questionnaire.render(draft.shape, { texture: draft.texture, amount: draft.amount, specials: draft.specials })}
              <canvas class="daily__marks"></canvas>
              ${draft.marks.filter((m) => m.kind === "sticker").map((m) =>
                `<img class="draw__sticker" src="assets/img/${m.name}.png" alt="" draggable="false" style="left:${m.x}px; top:${m.y}px; pointer-events:none">`).join("")}
            </div>
          </button>
        </div>

        <!-- note -->
        <div class="at note glass glass--note" style="--x:37px; --y:140px">
          <p class="note__small">your poop is</p>
          <p class="note__big note__verdict">${verdict}</p>
          <hr>
          <p class="note__big">${tip}</p>
          <p class="note__sign">POOPOO FAIRY</p>
        </div>
        <i class="at note__tape" style="--x:16px; --y:132px"></i>
      </div>

      <div class="daily__top safe-top">${topbar(["home", "profile"])}</div>
      <div class="daily__nav safe-bottom">${stepNav(6, { hideForward: true, forwardDark: true })}</div>
    </section>`);

  bindTopbar(el);

  // Replay the user's drawing on top of their poop.
  const marks = el.querySelector(".daily__marks");
  const dpr = window.devicePixelRatio || 1;
  marks.width = Math.round(art.w * dpr * 2);
  marks.height = Math.round(art.h * dpr * 2);
  const mctx = marks.getContext("2d");
  mctx.setTransform(dpr * 2, 0, 0, dpr * 2, 0, 0);
  draft.marks.filter((m) => m.kind !== "sticker").forEach((m) => PP.drawArt.paint(mctx, m));

  const flush = () => {
    if (el.classList.contains("is-flushed")) return;
    PP.ui.haptic(30);
    el.classList.add("is-flushed");
    setTimeout(() => el.querySelector("[data-action='step-next']").classList.remove("is-hidden"), 900);
  };
  el.querySelectorAll("[data-action='flush']").forEach((b) => b.addEventListener("click", flush));
  let startY = null;
  el.querySelector(".daily__char").addEventListener("pointerdown", (e) => { startY = e.clientY; });
  el.addEventListener("pointerup", (e) => { if (startY != null && e.clientY - startY > 30) flush(); startY = null; });

  el.querySelector("[data-action='step-back']").addEventListener("click", () => PP.router.back());
  el.querySelector("[data-action='step-next']").addEventListener("click", () => PP.router.go("monthly"));

  return el;
};
