/* ============================================================
   BlogSpace - My Posts Page Logic
   ============================================================ */

BlogSpace.loadMyPosts = async () => {
  const loading = document.getElementById("loadingMyPosts");
  const empty = document.getElementById("emptyMyPosts");
  const container = document.getElementById("myPostsContainer");

  // Check auth first
  const user = await BlogSpace.checkAuth();
  if (!user) {
    BlogSpace.showNotification("Please sign in to view your posts", "error");
    setTimeout(() => { window.location.href = "login.html"; }, 800);
    return;
  }

  try {
    const data = await BlogSpace.apiRequest("/posts");
    const posts = (data.posts || []).filter((p) => p.author && p.author._id === user._id);
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    loading.style.display = "none";

    if (posts.length === 0) {
      empty.style.display = "block";
      container.innerHTML = "";
      return;
    }

    empty.style.display = "none";
    container.innerHTML = "";
    posts.forEach((post) => {
      const el = document.createElement("div");
      el.className = "post-list-item";
      el.innerHTML = `
        <div class="post-list-item-content">
          <h3><a href="post.html?id=${post._id}">${post.title}</a></h3>
          <p>${BlogSpace.excerpt(post.content)}</p>
          <div class="post-list-item-meta">
            ${BlogSpace.formatDate(post.createdAt)}
            ${post.category ? ` · ${post.category}` : ""}
          </div>
        </div>
        <div class="post-list-item-actions">
          <a href="create-post.html?id=${post._id}" class="btn btn-outline btn-sm">Edit</a>
          <button class="btn btn-danger btn-sm" onclick="BlogSpace.deleteMyPost('${post._id}')">Delete</button>
        </div>
      `;
      container.appendChild(el);
    });
  } catch (err) {
    loading.style.display = "none";
    BlogSpace.showNotification(err.message || "Failed to load posts", "error");
  }
};

BlogSpace.deleteMyPost = async (postId) => {
  if (!confirm("Are you sure you want to delete this post?")) return;
  try {
    await BlogSpace.apiRequest(`/posts/${postId}`, { method: "DELETE" });
    BlogSpace.showNotification("Post deleted", "success");
    BlogSpace.loadMyPosts();
  } catch (err) {
    BlogSpace.showNotification(err.message || "Failed to delete post", "error");
  }
};
