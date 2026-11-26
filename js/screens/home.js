/* 0.1 主畫面 / 0.1 主畫面下滑 */
PP.screens.home = function () {
  const { h, poop, topbar, bindTopbar, img } = PP.ui;
  const I = PP.icons;
  const S = PP.state;
  const d = S.data;

  // Current week, Monday first
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const week = names.map((n, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const isToday = day.toDateString() === today.toDateString();
    return `<div class="week__day"><span>${n}</span><b class="${isToday ? "is-today" : ""}">${day.getDate()}</b></div>`;
  }).join("");

  const startPage = d.reminderDismissed || S.hasPoopedToday() ? 1 : 0;

  const el = h(`
    <section class="screen screen--scroll home safe-top safe-bottom">
      ${topbar(["search", "profile"])}

      <div class="home__greeting">
        <p>Helloooo !</p>
        <h1 class="home__name">${PP.ui.esc(S.nickname)}</h1>
      </div>

      <div class="home__cards">
        <div class="glass glass--beige reminder" data-page="${startPage}">
          <div class="reminder__pages">
            <div class="reminder__page reminder__page--alert">
              <span class="reminder__bell">${I.bellBig}</span>
              <div class="reminder__text">
                <p>You haven’t pooped today.</p>
                <button class="pill pressable" data-action="got-it">I got it</button>
              </div>
            </div>
            <div class="reminder__page week">${week}</div>
          </div>
          <div class="v-dots"><i data-to="0"></i><i data-to="1"></i></div>
        </div>

        <button class="glass glass--peach start pressable" data-action="start">
          <span class="start__title">Start pooping !</span>
          <span class="start__row">${Array.from({ length: 5 }, () => poop("#fff", 44, 34)).join("")}</span>
        </button>

        <div class="home__pair">
          <button class="glass glass--beige feature pressable" data-action="dump">
            <span class="feature__icon feature__icon--cal">${I.calendarBig}</span>
            <span class="feature__title">Dump<br>Poop</span>
          </button>
          <button class="glass glass--beige feature pressable" data-action="tips">
            <span class="feature__icon feature__icon--book">${I.bookBig}</span>
            <span class="feature__title">Poop<br>Tips</span>
          </button>
        </div>

        <div class="glass glass--sage share-card-home">
          <div class="share-card-home__pills">
            <button class="plus-pill pressable" data-action="buddy">${I.plus}<span>Add a New Poop Buddy</span></button>
            <button class="plus-pill pressable" data-action="post">${I.plus}<span>Post your poo poo</span></button>
          </div>
          <span class="share-card-home__title">Share<br>Poopoo</span>
        </div>
      </div>
    </section>`);

  bindTopbar(el);

  // Reminder ↕ week strip
  const card = el.querySelector(".reminder");
  const setPage = (p) => { card.dataset.page = String(p); };
  el.querySelectorAll(".v-dots i").forEach((dot) => dot.addEventListener("click", () => setPage(dot.dataset.to)));
  let startY = null;
  card.addEventListener("pointerdown", (e) => { startY = e.clientY; });
  card.addEventListener("pointerup", (e) => {
    if (startY == null) return;
    const dy = e.clientY - startY;
    if (dy < -20) setPage(1);
    if (dy > 20) setPage(0);
    startY = null;
  });
  card.addEventListener("wheel", (e) => { setPage(e.deltaY > 0 ? 1 : 0); }, { passive: true });

  // "Start pooping" loading highlight
  const glyphs = el.querySelectorAll(".start__row .poop");
  let hi = 0;
  const tick = () => {
    glyphs.forEach((g, i) => g.classList.toggle("is-hi", i === hi));
    hi = (hi + 1) % glyphs.length;
  };
  tick();
  const timer = setInterval(tick, 600);
  el._cleanup = () => clearInterval(timer);

  el.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]");
    if (!a) return;
    switch (a.dataset.action) {
      case "got-it":
        d.reminderDismissed = true; S.save(); setPage(1); break;
      case "start":
        S.startDraft(); PP.router.go("q/1"); break;
      case "dump":
        PP.router.go("calendar"); break;
      case "tips":
        PP.router.go("monthly"); break;
      case "buddy":
      case "post":
        PP.router.go("friends"); break;
    }
  });

  // First launch on this device: ask for a nickname.
  if (!d.nicknameSet) {
    setTimeout(() => {
      if (d.nicknameSet || !el.isConnected) return; // already named, or user left the home screen
      PP.ui.nicknamePopup("", (name) => {
        S.setNickname(name);
        el.querySelector(".home__name").textContent = name;
      }, { title: "What should we call you?", onClose: () => { d.nicknameSet = true; S.save(); } });
    }, 600);
  }

  return el;
};
