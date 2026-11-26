/* 1.1 交友頁面 / 1.1 交友頁面-1 */
PP.screens.friends = function () {
  const { h, topbar, bindTopbar, jar, jarPosts } = PP.ui;
  const S = PP.state;
  let selected = (S.data.posts.find((p) => p.authorID !== S.data.me.id) || {}).id || null;

  const el = h(`
    <section class="screen friends safe-top">
      ${topbar(["profile"], "margin-top:5px")}
      <h1 class="friends__title">Our<br>Poopoo</h1>
      <div class="friends__jar">${jar()}</div>
    </section>`);

  bindTopbar(el);
  const fill = el.querySelector(".jar__fill");

  function render() {
    fill.querySelectorAll(".jar__stack").forEach((n) => n.remove());
    fill.insertAdjacentHTML("beforeend", jarPosts(S.data.posts, { selectedId: selected }));
  }
  render();

  PP.wirePosts(fill, {
    getSelected: () => selected,
    setSelected: (id) => { selected = id; render(); },
    rerender: render
  });

  return el;
};

/** Shared post interactions (Friends + Profile). */
PP.wirePosts = function (container, { getSelected, setSelected, rerender, currentUser = null }) {
  const S = PP.state;
  container.addEventListener("click", (e) => {
    const holder = e.target.closest("[data-post]");
    if (!holder) return;
    const post = S.data.posts.find((p) => p.id === holder.dataset.post);
    if (!post) return;
    const action = e.target.closest("[data-action]");
    const a = action ? action.dataset.action : (holder.classList.contains("post-art") ? "open" : null);

    if (a === "post-toggle") setSelected(getSelected() === post.id ? null : post.id);
    if (a === "post-like") { post.liked = !post.liked; S.save(); PP.ui.haptic(); rerender(); }
    if (a === "post-share") PP.ui.sharePopup(S.user(post.authorID).name);
    if ((a === "post-add" || a === "open") && post.authorID !== currentUser) PP.router.go("profile/" + post.authorID);
  });
};
