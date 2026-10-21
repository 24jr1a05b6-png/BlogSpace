/* BlogSpace - Post Detail Page Logic (part 1) */

BlogSpace.loadPost = async (postId) => {
  const loadingPost = document.getElementById("loadingPost");
  const postNotFound = document.getElementById("postNotFound");
  const postView = document.getElementById("postView");
  try {
    const post = await BlogSpace.apiRequest(`/posts/${postId}`);
    document.getElementById("postTitle").textContent = post.title;
    document.getElementById("postMeta").innerHTML = `
      <span><strong>Author:</strong> ${post.author ? post.author.name : "Unknown"}</span>
      <span>·</span>
      <span>${BlogSpace.formatDateTime(post.createdAt)}</span>
      ${post.category ? `<span>·</span><span>${post.category}</span>` : ""}
    `;
    document.getElementById("postBody").innerHTML = post.content
      ? post.content.split("\n").map(p => `<p>${p}</p>`).join("")
      : "";
    const coverEl = document.getElementById("postCover");
    if (post.coverImage) {
      coverEl.innerHTML = `<img src="${post.coverImage}" class="article-cover" alt="Post cover" onerror="this.style.display='none';">`;
    } else { coverEl.innerHTML = ""; }
    document.getElementById("postActions").innerHTML = `
      <a href="create-post.html?id=${post._id}" class="btn btn-outline btn-sm">Edit</a>
      <button class="btn btn-danger btn-sm" onclick="BlogSpace.deletePost('${post._id}')">Delete</button>
    `;
    loadingPost.style.display = "none";
    postView.style.display = "block";
    await BlogSpace.loadComments(postId);
  } catch (err) {
    loadingPost.style.display = "none";
    postNotFound.style.display = "block";
    BlogSpace.showNotification(err.message || "Post not found", "error");
  }
};

BlogSpace.deletePost = async (postId) => {
  if (!confirm("Are you sure you want to delete this post?")) return;
  try {
    await BlogSpace.apiRequest(`/posts/${postId}`, { method: "DELETE" });
    BlogSpace.showNotification("Post deleted", "success");
    setTimeout(() => { window.location.href = "index.html"; }, 800);
  } catch (err) {
    BlogSpace.showNotification(err.message || "Failed to delete post", "error");
BlogSpace.loadComments = async (postId) => {
  const loadingComments = document.getElementById("loadingComments");
  const commentsList = document.getElementById("commentsList");
  const noComments = document.getElementById("noComments");
  const commentsCount = document.getElementById("commentsCount");
  try {
    const comments = await BlogSpace.apiRequest(`/posts/${postId}/comments`);
    commentsCount.textContent = `(${comments.length})`;
    commentsList.innerHTML = "";
    if (comments.length === 0) {
      noComments.style.display = "block";
    } else {
      noComments.style.display = "none";
      comments.forEach((c) => {
        const el = document.createElement("div");
        el.className = "comment";
        let actionsHtml = "";
        if (BlogSpace.currentUser && c.author && c.author._id === BlogSpace.currentUser._id) {
          actionsHtml = `
            <div class="comment-actions">
              <button class="btn-icon" onclick="BlogSpace.editComment('${c._id}', this)" title="Edit">✏️</button>
              <button class="btn-icon" onclick="BlogSpace.deleteComment('${c._id}','${postId}')" title="Delete">🗑️</button>
            </div>
          `;
        }
        el.innerHTML = `
          <div class="comment-header">
            <span class="comment-author">${c.author ? c.author.name : "Unknown"}</span>
            <span class="comment-date">${BlogSpace.formatDateTime(c.createdAt)}</span>
          </div>
          <div class="comment-text" id="comment-text-${c._id}">${c.text}</div>
          <div class="comment-edit" id="comment-edit-${c._id}" style="display:none; margin-top:0.75rem;">
            <textarea id="edit-textarea-${c._id}">${c.text}</textarea>
            <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
              <button class="btn btn-primary btn-sm" onclick="BlogSpace.saveComment('${c._id}')">Save</button>
              <button class="btn btn-outline btn-sm" onclick="BlogSpace.cancelEditComment('${c._id}')">Cancel</button>
            </div>
          </div>
          ${actionsHtml}
        `;
        commentsList.appendChild(el);
      });
    }
  } catch (err) {
    BlogSpace.showNotification("Failed to load comments", "error");
  } finally {
    loadingComments.style.display = "none";
  }
};

document.getElementById("commentForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const textarea = document.getElementById("commentText");
  if (!postId || !textarea.value.trim()) return;
  try {
    await BlogSpace.apiRequest(`/posts/${postId}/comments`, {
      method: "POST", body: { text: textarea.value.trim() },
    });
    textarea.value = "";
    BlogSpace.showNotification("Comment posted", "success");
    BlogSpace.loadComments(postId);
  } catch (err) {
    BlogSpace.showNotification(err.message || "Failed to post comment", "error");
  }
});

BlogSpace.editComment = (commentId, btn) => {
  const textEl = document.getElementById(`comment-text-${commentId}`);
  const editEl = document.getElementById(`comment-edit-${commentId}`);
  const textarea = document.getElementById(`edit-textarea-${commentId}`);
  textarea.value = textEl.textContent;
  textEl.style.display = "none";
  editEl.style.display = "block";
};
BlogSpace.cancelEditComment = (commentId) => {
  document.getElementById(`comment-text-${commentId}`).style.display = "block";
  document.getElementById(`comment-edit-${commentId}`).style.display = "none";
};
BlogSpace.saveComment = async (commentId) => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const text = document.getElementById(`edit-textarea-${commentId}`).value.trim();
  if (!text) return;
  try {
    await BlogSpace.apiRequest(`/comments/${commentId}`, { method: "PUT", body: { text } });
    BlogSpace.showNotification("Comment updated", "success");
    BlogSpace.loadComments(postId);
  } catch (err) {
    BlogSpace.showNotification(err.message || "Failed to update comment", "error");
  }
};
BlogSpace.deleteComment = async (commentId, postId) => {
  if (!confirm("Delete this comment?")) return;
  try {
    await BlogSpace.apiRequest(`/comments/${commentId}`, { method: "DELETE" });
    BlogSpace.showNotification("Comment deleted", "success");
    BlogSpace.loadComments(postId);
  } catch (err) {
    BlogSpace.showNotification(err.message || "Failed to delete comment", "error");
  }
};

BlogSpace.checkAuth().then((user) => {
  BlogSpace.currentUser = user;
  if (user) {
    document.getElementById("nav-login").style.display = "none";
    const menu = document.getElementById("user-menu");
    if (menu) menu.style.display = "flex";
    document.getElementById("user-greeting").textContent = `Hi, ${user.name}`;
  }
});

  }
};
