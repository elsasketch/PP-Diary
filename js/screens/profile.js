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
          <p class="profile__meta">ig : ${esc(user.instagram)}<br>line ID : ${esc(user.lineID)}</p>
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
          PP.ui.nicknamePopup(S.nickname, (name) => {
            S.setNickname(name);
            el.querySelector(".profile__info h1").textContent = name;
            PP.ui.toast("Nickname saved");
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
