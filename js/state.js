/* ==========================================================
   App state (persisted in localStorage)
   ========================================================== */
window.PP = window.PP || {};

PP.state = (function () {
  const STORAGE_KEY = "pp-diary-state-v1";

  function sampleOctober() {
    // [day, healthy flags…] – red = needs attention, cyan = healthy
    const pattern = [
      [2, [true]], [3, [false]], [4, [true]], [5, [false]],
      [8, [false]], [9, [true]], [10, [false]], [11, [true]], [12, [false]],
      [13, [false]], [14, [false]], [15, [true]], [17, [true]], [18, [false]], [19, [true]],
      [20, [false]], [21, [false, true]], [22, [true]], [23, [true]], [24, [false]], [25, [false]],
      [27, [false]], [28, [false]], [29, [false]]
    ];
    const out = [];
    pattern.forEach(([day, flags]) => {
      flags.forEach((healthy) => {
        out.push({
          id: uid(),
          date: new Date(2026, 9, day, 9).toISOString(),
          shape: 1,
          texture: healthy ? 0.5 : 0.1,
          amount: 0.4,
          specials: [],
          minutes: 12
        });
      });
    });
    return out;
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function defaults() {
    return {
      nicknameSet: false,          // false → ask for a nickname on first launch
      me: {
        id: "elsa", name: "Pooper", title: "Healthy Player",
        instagram: "", lineID: "", liked: false   // each user fills in their own
      },
      users: {
        cc: {
          id: "cc", name: "CC", title: "STINKY FAIRY",
          instagram: "Yuchii_eyy", lineID: "04676767", isFriend: true, liked: false
        }
      },
      posts: [
        { id: "p-cc", authorID: "cc", date: "2026.10.29", artwork: "illus_cc_face", liked: false }
      ],
      entries: sampleOctober(),
      diary: "I got a boyfriend this month!\nthanks to this app! 💕",
      reminderDismissed: false,
      draft: newDraft()
    };
  }

  function newDraft() {
    return { shape: 1, texture: 0, amount: 0.17, specials: [], minutes: 0, marks: [], blank: false };
  }

  let data;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    data = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
    // Earlier versions saved the designer's own IG / LINE into everyone's profile: clear them.
    if (data.me.instagram === "y_m_c.0904") data.me.instagram = "";
    if (data.me.lineID === "04878787") data.me.lineID = "";
    // Remove the old placeholder drawing from the user's own jar.
    data.posts = (data.posts || []).filter((p) => !(p.authorID === data.me.id && p.artwork === "illus_character"));
    // Older saves kept the name in `displayName`: move it onto the profile.
    if (raw && data.displayName) {
      data.me.name = data.displayName;
      data.nicknameSet = true;
      delete data.displayName;
    }
  } catch (e) {
    data = defaults();
  }

  function save() {
    try {
      const { draft, ...rest } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch (e) { /* storage unavailable – keep in memory */ }
  }

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

  return {
    get data() { return data; },
    save,
    reset() { data = defaults(); save(); },

    user(id) { return id === data.me.id ? data.me : data.users[id]; },
    displayLabel(id) { return id === data.me.id ? data.me.name : (data.users[id] ? data.users[id].name : id); },

    /** This device's nickname. Stored only in this browser, so every user has their own. */
    get nickname() { return data.me.name; },
    /** Save this user's own profile fields (nickname, IG, LINE ID). */
    setProfile({ name, instagram, lineID }) {
      if (name) { data.me.name = name; data.nicknameSet = true; }
      data.me.instagram = instagram || "";
      data.me.lineID = lineID || "";
      save();
    },
    setNickname(name) {
      data.me.name = name;
      data.nicknameSet = true;
      save();
    },

    startDraft() { data.draft = newDraft(); },
    commitDraft() {
      const d = data.draft;
      const now = new Date();
      const entry = {
        id: d.committedId || uid(), date: now.toISOString(),
        shape: d.shape, texture: d.texture, amount: d.amount, specials: d.specials.slice(), minutes: d.minutes
      };
      // The finished drawing goes into the user's jar (newest first).
      const post = {
        id: "p-" + entry.id, authorID: data.me.id, liked: false,
        date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
        art: {
          shape: d.shape, texture: d.texture, amount: d.amount, specials: d.specials.slice(),
          blank: !!d.blank, size: d.canvasSize || { w: 348, h: 270 },
          marks: JSON.parse(JSON.stringify(d.marks || []))
        }
      };
      if (d.committedId) {
        // Going back and pressing next again updates the same poop instead of adding a copy.
        data.entries = data.entries.filter((e) => e.id !== d.committedId);
        data.posts = data.posts.filter((p) => p.id !== post.id);
      }
      d.committedId = entry.id;
      data.entries.push(entry);
      data.posts.unshift(post);
      data.reminderDismissed = true;
      save();
    },

    isHealthy(e) { return e.texture >= 0.3 && e.texture <= 0.7 && e.specials.length === 0; },
    entriesOn(day) { return data.entries.filter((e) => sameDay(new Date(e.date), day)); },
    entriesInMonth(day) { return data.entries.filter((e) => sameMonth(new Date(e.date), day)); },
    latestEntryDate() {
      return data.entries.reduce((m, e) => (new Date(e.date) > m ? new Date(e.date) : m), new Date(0));
    },
    hasPoopedToday() { return this.entriesOn(new Date()).length > 0; }
  };
})();
