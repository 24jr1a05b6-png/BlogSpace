/* ============================================================
   BlogSpace - Create / Edit Post Page Logic
   ============================================================ */

BlogSpace.loadPostForEdit = async (postId) => {
  document.getElementById("pageTitle").textContent = "Edit post";
  document.getElementById("pageSubtitle").textContent = "Make changes to your post.";
  try {
    const post = await BlogSpace.apiRequest(`/posts/${postId}`);
    document.getElementById("postId").value = post._id;
    document.getElementById("title").value = post.title;
    document.getElementById("category").value = post.category || "";
    document.getElementById("coverImage").value = post.coverImage || "";
    document.getElementById("content").value = post.content;
    document.getElementById("submitBtn").textContent = "Update post";
  } catch (err) {
    BlogSpace.showNotification(err.message || "Post not found", "error");
    setTimeout(() => { window.location.href = "index.html"; }, 800);
  }
};

document.getElementById("postForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  const original = btn.textContent;
  btn.textContent = "Saving...";
  btn.disabled = true;

  const postId = document.getElementById("postId").value;
  const body = {
    title: document.getElementById("title").value.trim(),
    content: document.getElementById("content").value.trim(),
    category: document.getElementById("category").value.trim(),
    coverImage: document.getElementById("coverImage").value.trim(),
  };

  if (!body.title || !body.content) {
    BlogSpace.showNotification("Title and content are required", "error");
    btn.textContent = original;
    btn.disabled = false;
    return;
  }

  try {
    if (postId) {
      await BlogSpace.apiRequest(`/posts/${postId}`, { method: "PUT", body });
      BlogSpace.showNotification("Post updated", "success");
    } else {
      await BlogSpace.apiRequest("/posts", { method: "POST", body });
      BlogSpace.showNotification("Post created", "success");
    }
    setTimeout(() => { window.location.href = "index.html"; }, 800);
  } catch (err) {
    BlogSpace.showNotification(err.message || "Failed to save post", "error");
    btn.textContent = original;
    btn.disabled = false;
  }
});

// Load categories
(async () => {
  try {
    const cats = await BlogSpace.apiRequest("/posts/categories");
    const select = document.getElementById("category");
    if (select && cats) {
      cats.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    // ignore
  }
})();
