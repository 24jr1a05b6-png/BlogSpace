/* ============================================================
   BlogSpace - Shared Application Logic
   ============================================================ */

const API_BASE = "http://localhost:5000/api";

// Utility: show notification
function showNotification(message, type = "info") {
  // Remove existing
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.className = `notification ${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  // Trigger show
  requestAnimationFrame(() => el.classList.add("show"));

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

// Utility: API request with credentials (cookies)
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  };
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Utility: check authentication status
async function checkAuth() {
  try {
    const data = await apiRequest("/auth/me");
    return data;
  } catch (err) {
    return null;
  }
}

// Utility: format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Utility: format relative-ish date
function formatDateTime(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Utility: excerpt text
function excerpt(text, length = 120) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

// Setup global nav + auth UI
function initApp() {
  setupAuthLinks();
  setupLogout();
  updateAuthUI();
}

async function setupAuthLinks() {
  const registerLink = document.getElementById("nav-register");
  const loginLink = document.getElementById("nav-login");
  const profileLink = document.getElementById("nav-profile");
  const myPostsLink = document.getElementById("nav-myposts");

  // On auth pages, hide protected links appropriately
  const user = await checkAuth();

  if (registerLink) {
    registerLink.style.display = user ? "none" : "inline-block";
  }
  if (loginLink) {
    loginLink.style.display = user ? "none" : "inline-block";
  }
  if (profileLink) {
    profileLink.style.display = user ? "inline-block" : "none";
  }
  if (myPostsLink) {
    myPostsLink.style.display = user ? "inline-block" : "none";
  }

  if (user) {
    const greeting = document.getElementById("user-greeting");
    if (greeting) greeting.textContent = `Hi, ${user.name}`;
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await apiRequest("/auth/logout", { method: "POST" });
      } catch (err) {
        // ignore
      }
      localStorage.removeItem("blogspace_user");
      showNotification("Logged out successfully", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);
    });
  }
}

async function updateAuthUI() {
  const user = await checkAuth();
  const greeting = document.getElementById("user-greeting");
  if (user && greeting) {
    greeting.textContent = `Hi, ${user.name}`;
  }
}

// Export for modules
window.BlogSpace = {
  API_BASE,
  apiRequest,
  showNotification,
  checkAuth,
  formatDate,
  formatDateTime,
  excerpt,
  initApp,
};
