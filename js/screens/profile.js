/* 1.2 個人頁面（看自己的 / 看別人的 / 看別人的-1 / 加好友 / 分享） */
PP.screens.profile = function (route) {
  const { h, topbar, bindTopbar, jar, jarPosts, esc } = PP.ui;
  const I = PP.icons;
  const S = PP.state;
  const userID = route.args[0] || S.data.me.id;
  const isMe = userID === S.data.me.id;
  const user = S.user(userID);
  if (!user) { setTimeout(() => PP.router.home(), 0); return h(`<section class="screen"></section>`); }

  let selected = null;

  const el = h(`
    <section class="screen profile safe-top">
      ${topbar(["home"], "margin-top:5px")}
      <div class="profile__head">
        <div class="profile__avatar">${I.profile}</div>
        <div class="profile__info">
          <h1>${esc(user.name)}</h1>
          <p class="profile__title">${esc(user.title)}</p>
          <p class="profile__meta"></p>
        </div>
        <button class="profile__plus pressable" data-action="plus" aria-label="add">${I.plusThin}</button>
      </div>
      <button class="glass glass--beige profile__main pressable" data-action="main"></button>
      <div class="profile__pills">
        <button class="icon-pill pressable" data-action="share">${I.share}<span>share</span></button>
        <button class="icon-pill pressable" data-action="likes"><span class="likes-icon"></span><span>likes</span></button>
      </div>
      <div class="profile__jar">${jar()}</div>
    </section>`);

  bindTopbar(el);

  const fill = el.querySelector(".jar__fill");
  function renderPosts() {
    fill.querySelectorAll(".jar__stack").forEach((n) => n.remove());
    fill.insertAdjacentHTML("beforeend",
      jarPosts(S.data.posts.filter((p) => p.authorID === userID), { selectedId: selected }));
  }

  function renderMeta() {
    const lines = [];
    if (user.instagram) lines.push(`ig : ${esc(user.instagram)}`);
    if (user.lineID) lines.push(`line ID : ${esc(user.lineID)}`);
    const meta = el.querySelector(".profile__meta");
    if (lines.length) meta.innerHTML = lines.join("<br>");
    else meta.innerHTML = isMe ? `<span class="profile__meta-empty">add your ig / line ID in edit</span>` : "";
    el.querySelector(".profile__info h1").textContent = user.name;
  }

  function renderHead() {
    const main = el.querySelector(".profile__main");
    if (isMe) main.innerHTML = `${I.pencil}<span>edit personal profile</span>`;
    else if (user.isFriend) main.innerHTML = `${I.check}<span>friend</span>`;
    else main.innerHTML = `${I.addPerson}<span>add friend</span>`;
    el.querySelector(".profile__plus").hidden = !(isMe || !user.isFriend);
    const likes = el.querySelector("[data-action='likes']");
    likes.classList.toggle("is-active", !!user.liked);
    likes.querySelector(".likes-icon").innerHTML = user.liked ? I.heartFill : I.heart;
  }

  renderMeta();
  renderHead();
  renderPosts();

  PP.wirePosts(fill, {
    getSelected: () => selected,
    setSelected: (id) => { selected = id; renderPosts(); },
    rerender: renderPosts,
    currentUser: userID
  });

  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    switch (b.dataset.action) {
      case "plus":
        if (isMe) PP.router.go("friends");
        else { user.isFriend = true; S.save(); renderHead(); }
        break;
      case "main":
        if (isMe) {
          PP.ui.profilePopup(S.data.me, (values) => {
            S.setProfile(values);
            renderMeta();
            renderPosts();
            PP.ui.toast("Profile saved");
          });
        } else if (user.isFriend) {
          PP.ui.unfriendPopup(() => { user.isFriend = false; S.save(); renderHead(); });
        } else {
          user.isFriend = true; S.save(); renderHead();
        }
        break;
      case "share":
        PP.ui.sharePopup(user.name);
        break;
      case "likes":
        user.liked = !user.liked; S.save(); PP.ui.haptic(); renderHead();
        break;
    }
  });

  return el;
};
