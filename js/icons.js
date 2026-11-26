/* ==========================================================
   Icon set (Figma › icon: line 2–3pt, 18×18 / 36×36)
   All icons use currentColor so CSS controls the color.
   ========================================================== */
window.PP = window.PP || {};

PP.icons = (function () {
  const svg = (body, vb = "0 0 24 24", extra = "") =>
    `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

  return {
    menu: svg(`<circle cx="5" cy="6.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="5" cy="17.5" r="1.4" fill="currentColor" stroke="none"/><path d="M9 6.5h11M9 12h11M9 17.5h11" stroke-width="2.4"/>`),
    search: svg(`<circle cx="13.5" cy="10.5" r="6" stroke-width="2.6"/><path d="M9.2 14.8 4.5 19.5" stroke-width="3"/><path d="M11 8a3 3 0 0 1 3-1.5" stroke-width="1.6"/>`),
    profile: svg(`<circle cx="12" cy="8" r="4.2" stroke-width="2.2"/><path d="M4 21c.6-4.4 4-7 8-7s7.4 2.6 8 7" stroke-width="2.2"/>`),
    home: svg(`<path d="M4 11.5 12 4.5l8 7V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19z" stroke-width="2"/><path d="M9.5 20.5v-5a2.5 2.5 0 0 1 5 0v5" stroke-width="2"/>`),
    plus: svg(`<path d="M12 4v16M4 12h16" stroke-width="2.6"/>`),
    plusThin: svg(`<path d="M12 3v18M3 12h18" stroke-width="2"/>`),
    heart: svg(`<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z"/>`),
    heartFill: svg(`<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z" fill="currentColor"/>`),
    share: svg(`<circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4"/>`),
    addPerson: svg(`<circle cx="9.5" cy="8" r="3.6"/><path d="M3 20c.5-3.8 3.2-6 6.5-6s6 2.2 6.5 6"/><path d="M19 8v6M16 11h6"/>`),
    check: svg(`<path d="M4.5 12.5 9.5 17.5 19.5 6.5" stroke-width="2.6"/>`),
    trash: svg(`<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>`),
    pencil: svg(`<path d="M15.5 4.5 19.5 8.5 8 20H4v-4z"/><path d="M13 7l4 4"/>`),
    chevronLeft: svg(`<path d="M15 5 8 12l7 7" stroke-width="3.4"/>`),
    chevronRight: svg(`<path d="M9 5l7 7-7 7" stroke-width="3.4"/>`),
    close: svg(`<path d="M5 5l14 14M19 5 5 19" stroke-width="2"/>`),
    arrow: svg(`<path d="M5 19 19 5M9 5h10v10" stroke-width="2.2"/>`),
    line: svg(`<path d="M4 20 20 4" stroke-width="3"/>`),
    square: svg(`<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" stroke="none"/>`),
    circle: svg(`<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/>`),
    triangle: svg(`<path d="M12 3 22 20H2z" fill="currentColor" stroke="none"/>`),
    sparkle: svg(`<path d="M12 1.5c.8 6 3.5 9.2 10.5 10.5-7 1.3-9.7 4.5-10.5 10.5-.8-6-3.5-9.2-10.5-10.5C8.5 10.7 11.2 7.5 12 1.5z" fill="currentColor" stroke="none"/>`),
    star: svg(`<path d="M12 2.5l2.9 6.3 6.8.7-5.1 4.6 1.5 6.8L12 17.4l-6.1 3.5 1.5-6.8L2.3 9.5l6.8-.7z" fill="currentColor" stroke="none"/>`),
    burst: svg(`<path d="M12 1l1.8 5.4 4.7-3.2-1.6 5.4 5.6.4-4.6 3 4.6 3-5.6.4 1.6 5.4-4.7-3.2L12 23l-1.8-5.4-4.7 3.2 1.6-5.4-5.6-.4 4.6-3-4.6-3 5.6-.4-1.6-5.4 4.7 3.2z" fill="currentColor" stroke="none"/>`),

    /* Reminder bell (peach outline, partly outside the card) */
    bellBig: svg(`<path d="M53 7C31 7 24 28 24 50v22c0 9-7 15-17 19.5h92C89 87 82 81 82 72V50C82 28 75 7 53 7z" stroke-width="5"/><path d="M41 106c5 6 19 6 24 0" stroke-width="5"/>`, "0 0 106 119"),

    /* Big faded line icons on the home cards */
    calendarBig: svg(`<rect x="6" y="14" width="76" height="66" rx="12" stroke-width="3.2"/><path d="M6 32h76" stroke-width="3.2"/><g stroke-width="3.2"><rect x="20" y="6" width="7" height="16" rx="3.5"/><rect x="40.5" y="6" width="7" height="16" rx="3.5"/><rect x="61" y="6" width="7" height="16" rx="3.5"/></g><g stroke-width="2.6"><rect x="24" y="42" width="9" height="9" rx="2"/><rect x="40" y="42" width="9" height="9" rx="2"/><rect x="56" y="42" width="9" height="9" rx="2"/><rect x="16" y="58" width="9" height="9" rx="2"/><rect x="32" y="58" width="9" height="9" rx="2"/><rect x="48" y="58" width="9" height="9" rx="2"/><rect x="64" y="58" width="9" height="9" rx="2"/></g>`, "0 0 88 86"),
    bookBig: svg(`<path d="M50 20c-8-8-20-10-40-10v62c20 0 32 2 40 10 8-8 20-10 40-10V10c-20 0-32 2-40 10z" stroke-width="3.4"/><path d="M50 20v62" stroke-width="3.4"/>`, "0 0 100 92")
  };
})();
