/* 0.9 月總結還沒拉開 / 0.9 月總結 */
PP.screens.monthly = function () {
  const { h, topbar, bindTopbar } = PP.ui;
  const S = PP.state;
  const count = S.entriesInMonth(S.latestEntryDate()).length;

  const tips = [
    ["Gulp more water", "keep that tummy slide lubricated!"],
    ["More fiber friends", "fruits, veggies, and oats to soften things up."],
    ["Healthy fats", "a splash of olive oil or avocado for smooth moves."],
    ["Daily wiggles", "gentle walks to keep your gut dancing!"]
  ];

  /* ---- Geometry (screen px). Roll axis y=90, radius 105, from x=100 to x=345. ---- */
  const SHEET_L = 100, SHEET_R = 345, TOP = 150;
  // Sideways bend of the hanging sheet: straight until BEND_Y, then curls to the left.
  const BEND_Y = 500, K = 75 / Math.pow(900 - BEND_Y, 2);
  const bend = (y) => (y <= BEND_Y ? 0 : -K * Math.pow(y - BEND_Y, 2));
  const slope = (y) => (y <= BEND_Y ? 0 : -2 * K * (y - BEND_Y));

  const longPath = (() => {
    const left = [], right = [];
    for (let y = TOP; y <= 960; y += 10) {
      left.push(`${(SHEET_L + bend(y)).toFixed(1)} ${y}`);
      right.push(`${(SHEET_R + bend(y)).toFixed(1)} ${y}`);
    }
    return `M${left.join("L")}L${right.reverse().join("L")}`;
  })();

  const el = h(`
    <section class="screen monthly">
      <div class="stage">
        <!-- holder bar (behind the roll) -->
        <i class="at roll-bar" style="--x:-12px; --y:80px; width:120px"></i>

        <!-- collapsed (curled) sheet -->
        <div class="monthly__collapsed">
          <svg class="at m-paper" style="--x:0px; --y:0px" width="402" height="874" viewBox="0 0 402 874" aria-hidden="true">
            <path d="M${SHEET_L} ${TOP}V352C${SHEET_L} 398 84 424 40 436L300 444C330 432 ${SHEET_R} 404 ${SHEET_R} 366V${TOP}" fill="#fff" stroke="#D9D9D9" stroke-width="3" stroke-linejoin="round"/>
          </svg>
          <div class="at m-sheet__body m-sheet__body--short" style="--x:${SHEET_L}px; --y:214px">
            <p class="m-peach">This month,<br>you have pooped...</p>
            <i class="m-dash"></i>
            <p class="m-green">Poop of this<br>month!</p>
          </div>
        </div>

        <!-- unrolled sheet: tail bends, text follows the bend -->
        <div class="monthly__long">
          <svg class="at m-paper" style="--x:0px; --y:0px" width="402" height="874" viewBox="0 0 402 874" aria-hidden="true">
            <path d="${longPath}" fill="#fff" stroke="#D9D9D9" stroke-width="3" stroke-linejoin="round"/>
          </svg>
          <div class="at m-sheet__body" style="--x:${SHEET_L}px; --y:208px">
            <p class="m-encourage" data-follow>You’re doing great let’s make next month super smooth and happy!</p>
            <i class="m-dash" data-follow></i>
            <ul class="m-tips">
              ${tips.map(([t, d]) => `<li data-follow><b>${t}</b><span>${d}</span></li>`).join("")}
            </ul>
            <i class="m-dash" data-follow></i>
            <p class="m-count" data-follow>${count} times !</p>
            <p class="m-peach" data-follow>This month,<br>you have pooped...</p>
            <i class="m-dash" data-follow></i>
            <p class="m-green" data-follow>Poop of this<br>month!</p>
            <div class="m-actions" data-follow data-noskew>
              <button class="pill pill--peach pressable" data-action="save">save</button>
              <button class="pill pill--peach pressable" data-action="next">next</button>
            </div>
          </div>
        </div>

        <!-- the roll (drawn over the top of the sheet) -->
        <svg class="at m-roll" style="--x:0px; --y:-20px" width="402" height="230" viewBox="0 -20 402 230" aria-hidden="true">
          <g stroke="#D9D9D9" stroke-width="3" stroke-linejoin="round">
            <path d="M345 -15H100A30 105 0 0 0 100 195H345" fill="#fff"/>
            <ellipse cx="345" cy="90" rx="48" ry="105" fill="#E6E6E6"/>
            <ellipse cx="345" cy="90" rx="19" ry="44" fill="#fff"/>
          </g>
          <path d="M108 150H318" stroke="#D9D9D9" stroke-width="3" stroke-dasharray="9 7"/>
        </svg>
        <!-- holder bar continuing through the tube -->
        <i class="at roll-bar roll-bar--front" style="--x:345px; --y:80px; width:80px"></i>
      </div>

      <div class="monthly__top safe-top">${topbar(["profile"])}</div>
    </section>`);

  // Shift (and slant) each line of text to follow the bend of the paper.
  const follow = () => {
    const body = el.querySelector(".monthly__long .m-sheet__body");
    const top = 208;
    body.querySelectorAll("[data-follow]").forEach((n) => {
      n.style.transform = "";
      const y = top + n.offsetTop + n.offsetHeight / 2;
      const dx = bend(y);
      const ang = Math.atan(slope(y)) * 180 / Math.PI;
      if (!dx) return;
      n.style.transform = `translateX(${dx.toFixed(1)}px)` + (n.hasAttribute("data-noskew") ? "" : ` skewX(${(-ang).toFixed(1)}deg)`);
    });
  };
  el._mounted = () => {
    follow();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(follow);
  };

  bindTopbar(el);

  const unroll = () => el.classList.add("is-open");
  el.querySelector(".monthly__collapsed").addEventListener("click", unroll);
  let startY = null;
  el.addEventListener("pointerdown", (e) => { startY = e.clientY; });
  el.addEventListener("pointerup", (e) => {
    if (startY == null) return;
    const dy = e.clientY - startY;
    if (dy > 30) unroll();
    if (dy < -60 && el.classList.contains("is-open") && !e.target.closest("button")) el.classList.remove("is-open");
    startY = null;
  });

  el.querySelector("[data-action='save']").addEventListener("click", (e) => {
    e.currentTarget.textContent = "saved";
    PP.ui.haptic(20);
    PP.ui.toast("Saved to your diary");
  });
  el.querySelector("[data-action='next']").addEventListener("click", () => PP.router.go("calendar?confetti=1"));

  return el;
};
