/* ============================================================
   BlogSpace - Home Page Logic
   ============================================================ */

BlogSpace.loadPosts = async function () {
  const postsContainer = document.getElementById("postsContainer");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  if (!postsContainer) return;

  let posts = [];
  let categories = [];

  const render = () => {
    const search = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;

    let filtered = posts.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search) ||
        (p.content || "").toLowerCase().includes(search);
      const matchCat = !category || p.category === category;
      return matchSearch && matchCat;
    });

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    postsContainer.innerHTML = "";

    if (filtered.length === 0) {
      emptyState.style.display = "block";
      postsContainer.style.display = "none";
    } else {
      emptyState.style.display = "none";
      postsContainer.style.display = "grid";
      filtered.forEach((post) => {
        const card = document.createElement("article");
        card.className = "post-card";
        const cover = post.coverImage
          ? `<img src="${post.coverImage}" alt="Post cover" onerror="this.style.display='none';this.previousElementSibling.style.display='flex';">`
          : "";
        const placeholder = post.coverImage
          ? ""
          : `<div class="post-card-image-placeholder">📄</div>`;
        card.innerHTML = `
          <div class="post-card-image">
            ${placeholder}
            ${cover}
          </div>
          <div class="post-card-content">
            <div class="post-card-meta">
              <span>${post.author ? post.author.name : "Unknown"}</span>
              <span>·</span>
              <span>${BlogSpace.formatDate(post.createdAt)}</span>
              ${post.category ? `<span>·</span><span>${post.category}</span>` : ""}
            </div>
            <h3><a href="post.html?id=${post._id}">${post.title}</a></h3>
            <p>${BlogSpace.excerpt(post.content)}</p>
          </div>
          <div class="post-card-footer">
            <span>by ${post.author ? post.author.name : "Unknown"}</span>
            <a href="post.html?id=${post._id}" class="btn btn-primary btn-sm">Read more</a>
          </div>
        `;
        postsContainer.appendChild(card);
      });
    }
  };

  try {
    loadingState.classList.add("show");
    const data = await BlogSpace.apiRequest("/posts");
    posts = data.posts || [];

    // Load categories
    try {
      const cats = await BlogSpace.apiRequest("/posts/categories");
      categories = cats || [];
    } catch (e) {
      categories = [];
    }

    // Populate category filter
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      categoryFilter.appendChild(opt);
    });

    render();
  } catch (err) {
    loadingState.style.display = "none";
    errorState.style.display = "block";
    document.getElementById("errorMessage").textContent =
      err.message || "Failed to load posts";
  } finally {
    loadingState.classList.remove("show");
  }
};

if (document.getElementById("searchInput")) {
  document.getElementById("searchInput").addEventListener("input", BlogSpace.loadPosts);
}
if (document.getElementById("categoryFilter")) {
  document.getElementById("categoryFilter").addEventListener("change", BlogSpace.loadPosts);
}
