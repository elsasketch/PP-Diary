/* 1.0 月曆 / 1.0 月曆 月總結結束後噴彩帶 */
PP.screens.calendar = function (route) {
  const { h, topbar, bindTopbar, poop, esc } = PP.ui;
  const I = PP.icons;
  const S = PP.state;
  const confetti = route.query.get("confetti") === "1";

  let month = S.latestEntryDate();
  if (month.getTime() === 0) month = new Date();
  month = new Date(month.getFullYear(), month.getMonth(), 1);

  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const label = (d) => `${M[d.getMonth()]}. ${d.getFullYear()}`;

  const el = h(`
    <section class="screen screen--scroll calendar safe-top safe-bottom">
      ${topbar(["profile"])}
      <h1 class="cal__title"></h1>
      <div class="cal__body">
        <div class="glass glass--calendar cal-card">
          <div class="cal-card__head">
            ${["Sun.", "Mon.", "Tue.", "Wed.", "Thr.", "Fri.", "Sat."].map((d) => `<span>${d}</span>`).join("")}
          </div>
          <div class="cal-card__grid"></div>
          <div class="cal-card__nav">
            <button class="pressable" data-shift="-1"><i>${I.chevronLeft}</i><span class="prev"></span></button>
            <button class="pressable" data-shift="1"><span class="next"></span><i>${I.chevronRight}</i></button>
          </div>
        </div>

        <div class="cal-stats">
          <div class="outlined"><b class="st-total"></b><span>total</span></div>
          <div class="outlined"><b class="st-days"></b><span>days</span></div>
          <div class="outlined"><b class="st-time"></b><span>time</span></div>
        </div>

        <label class="outlined cal-diary">
          <span class="cal-diary__label">Diary</span>
          <textarea rows="3" placeholder="Write something…">${esc(S.data.diary)}</textarea>
        </label>

        <button class="glass glass--peach glass-btn cal-done pressable" data-action="done">Done</button>
      </div>
    </section>`);

  bindTopbar(el);

  function renderMonth() {
    el.querySelector(".cal__title").textContent = `${M[month.getMonth()].toUpperCase()}. ${month.getFullYear()} Dump`;
    const prev = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    el.querySelector(".prev").textContent = label(prev);
    el.querySelector(".next").textContent = label(next);

    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Array(month.getDay()).fill(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7) cells.push(null);

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    const grid = el.querySelector(".cal-card__grid");
    grid.classList.toggle("is-six", rows.length > 5);
    grid.innerHTML = rows.map((r) => `<div class="cal-row">${r.map(cell).join("")}</div>`).join("");

    const list = S.entriesInMonth(month);
    const daysSet = new Set(list.map((e) => new Date(e.date).toDateString()));
    const mins = list.reduce((a, e) => a + (e.minutes || 0), 0);
    el.querySelector(".st-total").textContent = list.length;
    el.querySelector(".st-days").textContent = daysSet.size;
    el.querySelector(".st-time").textContent = Math.round(mins / 60) + "hrs";
  }

  function cell(date) {
    if (!date) return `<div class="cal-cell"></div>`;
    const items = S.entriesOn(date);
    if (!items.length) return `<div class="cal-cell"><b class="cal-num">${date.getDate()}</b></div>`;
    const color = (e) => (S.isHealthy(e) ? "var(--c-poop-cyan)" : "var(--c-poop-red)");
    if (items.length === 1) return `<div class="cal-cell">${poop(color(items[0]), 32, 24)}</div>`;
    return `<div class="cal-cell cal-cell--stack">${items.slice(0, 2).map((e) => poop(color(e), 22, 17)).join("")}</div>`;
  }

  el.querySelectorAll("[data-shift]").forEach((b) => b.addEventListener("click", () => {
    month = new Date(month.getFullYear(), month.getMonth() + Number(b.dataset.shift), 1);
    renderMonth();
  }));

  el.querySelector("textarea").addEventListener("input", (e) => { S.data.diary = e.target.value; S.save(); });
  el.querySelector("[data-action='done']").addEventListener("click", () => PP.router.home());

  renderMonth();
  if (confetti) el._mounted = () => PP.ui.confetti(el.closest(".phone"));

  return el;
};
