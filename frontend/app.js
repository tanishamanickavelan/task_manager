/* ── Config ──────────────────────────────────────────── */
// In production set this to your deployed backend URL, e.g.:
// const API = "https://your-app.onrender.com";
const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000"
  : window.location.origin;

/* ── State ───────────────────────────────────────────── */
let token      = localStorage.getItem("token") || null;
let currentUser = localStorage.getItem("username") || null;
let currentPage = 1;
let currentFilter = "all";        // "all" | "pending" | "done"
let editingTaskId = null;

/* ── Boot ────────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => {
  if (token) {
    showDashboard();
  } else {
    showAuth();
  }
  // Allow Enter key on auth forms
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const loginForm = document.getElementById("form-login");
    const regForm   = document.getElementById("form-register");
    if (!loginForm.classList.contains("hidden")) login();
    else if (!regForm.classList.contains("hidden")) register();
  });
});

/* ── Routing helpers ─────────────────────────────────── */
function showAuth() {
  document.getElementById("auth-page").classList.remove("hidden");
  document.getElementById("dashboard-page").classList.add("hidden");
  document.getElementById("navbar").classList.add("hidden");
}

function showDashboard() {
  document.getElementById("auth-page").classList.add("hidden");
  document.getElementById("dashboard-page").classList.remove("hidden");
  document.getElementById("navbar").classList.remove("hidden");
  document.getElementById("nav-username").textContent = currentUser ? `👤 ${currentUser}` : "";
  fetchTasks();
}

/* ── Tab switcher ────────────────────────────────────── */
function switchTab(tab) {
  document.getElementById("form-login").classList.toggle("hidden", tab !== "login");
  document.getElementById("form-register").classList.toggle("hidden", tab !== "register");
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
  hideError("login-error");
  hideError("reg-error");
  hideMsg("reg-success");
}

/* ── Auth ────────────────────────────────────────────── */
async function register() {
  const username = document.getElementById("reg-username").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!username || !email || !password) {
    showError("reg-error", "Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError("reg-error", data.detail || "Registration failed.");
      return;
    }
    hideError("reg-error");
    showMsg("reg-success", "Account created! You can now log in.");
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-email").value    = "";
    document.getElementById("reg-password").value = "";
    setTimeout(() => switchTab("login"), 1200);
  } catch {
    showError("reg-error", "Could not connect to the server.");
  }
}

async function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    showError("login-error", "Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email: "placeholder@placeholder.com", password }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError("login-error", data.detail || "Invalid credentials.");
      return;
    }
    token = data.access_token;
    currentUser = username;
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    hideError("login-error");
    showDashboard();
  } catch {
    showError("login-error", "Could not connect to the server.");
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  currentPage = 1;
  currentFilter = "all";
  showAuth();
  showToast("Logged out successfully.", "success");
}

/* ── Filters ─────────────────────────────────────────── */
function setFilter(filter) {
  currentFilter = filter;
  currentPage   = 1;
  ["all", "pending", "done"].forEach(f => {
    document.getElementById(`filter-${f}`).classList.toggle("active", f === filter);
  });
  fetchTasks();
}

/* ── Fetch Tasks ─────────────────────────────────────── */
async function fetchTasks() {
  const taskList  = document.getElementById("task-list");
  const pagination = document.getElementById("pagination");
  taskList.innerHTML  = `<div class="spinner-wrap">Loading tasks…</div>`;
  pagination.innerHTML = "";

  let url = `${API}/tasks?page=${currentPage}&page_size=8`;
  if (currentFilter === "done")    url += "&completed=true";
  if (currentFilter === "pending") url += "&completed=false";

  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    renderTasks(data);
  } catch {
    taskList.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Could not load tasks. Is the server running?</p></div>`;
  }
}

function renderTasks(data) {
  const taskList   = document.getElementById("task-list");
  const pagination = document.getElementById("pagination");
  const countEl    = document.getElementById("task-count");

  countEl.textContent = `${data.total} task${data.total !== 1 ? "s" : ""}`;

  if (data.tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${currentFilter === "done" ? "🎉" : "📋"}</div>
        <p>${currentFilter === "done" ? "No completed tasks yet." : currentFilter === "pending" ? "No pending tasks — great job!" : "No tasks yet. Create your first task!"}</p>
      </div>`;
    return;
  }

  taskList.innerHTML = data.tasks.map(task => `
    <div class="task-card ${task.completed ? "completed" : ""}" id="task-${task.id}">
      <div class="task-check ${task.completed ? "checked" : ""}" onclick="toggleTask(${task.id}, ${task.completed})" title="${task.completed ? "Mark as pending" : "Mark as completed"}">
        ${task.completed ? "✓" : ""}
      </div>
      <div class="task-body">
        <div class="task-title-text">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc-text">${escapeHtml(task.description)}</div>` : ""}
        <div class="task-meta">
          ${formatDate(task.created_at)}
          <span class="badge ${task.completed ? "badge-done" : "badge-pending"}">${task.completed ? "Completed" : "Pending"}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-outline btn-icon" onclick="openEditModal(${task.id}, '${escapeAttr(task.title)}', '${escapeAttr(task.description || '')}')" title="Edit">✏️</button>
        <button class="btn btn-danger btn-icon" onclick="deleteTask(${task.id})" title="Delete">🗑</button>
      </div>
    </div>
  `).join("");

  // Pagination
  if (data.total_pages > 1) {
    let html = `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>‹</button>`;
    for (let p = 1; p <= data.total_pages; p++) {
      html += `<button class="page-btn ${p === currentPage ? "active" : ""}" onclick="goToPage(${p})">${p}</button>`;
    }
    html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === data.total_pages ? "disabled" : ""}>›</button>`;
    html += `<span class="page-info">Page ${currentPage} of ${data.total_pages}</span>`;
    pagination.innerHTML = html;
  }
}

function goToPage(page) {
  currentPage = page;
  fetchTasks();
}

/* ── Toggle Complete ─────────────────────────────────── */
async function toggleTask(id, currentlyCompleted) {
  try {
    const res = await fetch(`${API}/tasks/${id}`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentlyCompleted }),
    });
    if (!res.ok) throw new Error();
    showToast(currentlyCompleted ? "Task marked as pending." : "Task completed! 🎉", "success");
    fetchTasks();
  } catch {
    showToast("Failed to update task.", "error");
  }
}

/* ── Delete ──────────────────────────────────────────── */
async function deleteTask(id) {
  if (!confirm("Delete this task? This cannot be undone.")) return;
  try {
    const res = await fetch(`${API}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error();
    showToast("Task deleted.", "success");
    fetchTasks();
  } catch {
    showToast("Failed to delete task.", "error");
  }
}

/* ── Modal ───────────────────────────────────────────── */
function openModal() {
  editingTaskId = null;
  document.getElementById("modal-title").textContent = "New Task";
  document.getElementById("modal-save-btn").textContent = "Create Task";
  document.getElementById("task-title").value = "";
  document.getElementById("task-desc").value  = "";
  hideError("modal-error");
  document.getElementById("modal-overlay").classList.remove("hidden");
  setTimeout(() => document.getElementById("task-title").focus(), 50);
}

function openEditModal(id, title, description) {
  editingTaskId = id;
  document.getElementById("modal-title").textContent = "Edit Task";
  document.getElementById("modal-save-btn").textContent = "Save Changes";
  document.getElementById("task-title").value = title;
  document.getElementById("task-desc").value  = description;
  hideError("modal-error");
  document.getElementById("modal-overlay").classList.remove("hidden");
  setTimeout(() => document.getElementById("task-title").focus(), 50);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

function closeModalOutside(e) {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
}

async function saveTask() {
  const title       = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-desc").value.trim();

  if (!title) {
    showError("modal-error", "Task title is required.");
    return;
  }

  const isEdit = editingTaskId !== null;
  const url    = isEdit ? `${API}/tasks/${editingTaskId}` : `${API}/tasks`;
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError("modal-error", data.detail || "Failed to save task.");
      return;
    }
    closeModal();
    showToast(isEdit ? "Task updated!" : "Task created!", "success");
    fetchTasks();
  } catch {
    showError("modal-error", "Could not connect to the server.");
  }
}

// Allow Enter inside modal title input
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("task-title")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveTask();
  });
});

/* ── Helpers ─────────────────────────────────────────── */
function authHeaders() {
  return { Authorization: `Bearer ${token}` };
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideError(id) {
  const el = document.getElementById(id);
  el.textContent = "";
  el.classList.add("hidden");
}

function showMsg(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideMsg(id) {
  const el = document.getElementById(id);
  el.textContent = "";
  el.classList.add("hidden");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\'").replace(/\n/g, " ");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

let toastTimer;
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className   = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove("show"); }, 2800);
}
