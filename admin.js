
/* ==========================================================
   SAU DINING ADMIN — MENU & DATA MANAGEMENT
   ========================================================== */

const ADMIN = {
  draftKey: "sauMenuDraft",
  sessionKey: "sauAdminDemoSession",
  menu: null,
  originalMenu: null,
  activePanel: "overview",
  dataType: "feedback"
};

const admin$ = id => document.getElementById(id);

const adminClone = data => JSON.parse(JSON.stringify(data));

function adminRead(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function adminSave(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function adminEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

/* LOGIN */

function adminLogin() {
  const form = admin$("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const username = admin$("adminUsername").value.trim();
    const password = admin$("adminPassword").value;
    const error = admin$("loginError");

    if (username === "admin" && password === "sau2026") {
      sessionStorage.setItem(ADMIN.sessionKey, "true");
      openAdmin();
    } else {
      error.textContent = "Incorrect demo credentials.";
    }
  });
}

function openAdmin() {
  admin$("loginScreen")?.classList.add("hidden");
  admin$("adminApp")?.classList.remove("hidden");

  updateOverview();
  renderAdminMenu();
  renderAnnouncementsAdmin();
  renderRecords();
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN.sessionKey);
  location.reload();
}

/* MENU DATA */

async function loadAdminMenu() {
  try {
    const response = await fetch("menu.json");
    if (!response.ok) throw new Error("Could not load menu.json");

    const original = await response.json();
    ADMIN.originalMenu = adminClone(original);

    const draft = adminRead(ADMIN.draftKey, null);

    if (draft && draft.version === original.version) {
      ADMIN.menu = draft;
      admin$("menuStatus").textContent = "Local draft loaded.";
    } else {
      ADMIN.menu = adminClone(original);
      admin$("menuStatus").textContent = "Original menu.json loaded.";
    }

    if (!ADMIN.menu.days) ADMIN.menu.days = {};
    if (!ADMIN.menu.announcements) ADMIN.menu.announcements = [];

    setDefaultDate();
    renderAdminMenu();
    renderAnnouncementsAdmin();
    updateOverview();
  } catch (error) {
    console.error(error);
    admin$("menuStatus").textContent =
      "Could not load menu.json. Open the project with VS Code Live Server.";
  }
}

function setDefaultDate() {
  const input = admin$("adminMenuDate");
  if (!input) return;

  const date = new Date();
  input.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getAdminDate() {
  return admin$("adminMenuDate").value;
}

function getAdminMeal() {
  return admin$("adminMealSelect").value;
}

function getAdminWeeklyDay(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function getAdminMenuForDate(dateString) {
  const weekday = getAdminWeeklyDay(dateString);
  const weekly = ADMIN.menu.weekly?.[weekday] || {};
  const override = ADMIN.menu.days?.[dateString] || {};

  return {
    breakfast: override.breakfast ?? weekly.breakfast ?? [],
    lunch: override.lunch ?? weekly.lunch ?? [],
    dinner: override.dinner ?? weekly.dinner ?? []
  };
}

function setAdminDateMeal(meal, dishes) {
  const date = getAdminDate();

  if (!date) {
    alert("Please select a date first.");
    return;
  }

  if (!ADMIN.menu.days[date]) {
    ADMIN.menu.days[date] = {};
  }

  ADMIN.menu.days[date][meal] = dishes;
}

function renderAdminMenu() {
  const container = admin$("adminDishList");
  if (!container || !ADMIN.menu) return;

  const date = getAdminDate();
  if (!date) return;

  const menu = getAdminMenuForDate(date);
  const dishes = menu[getAdminMeal()] || [];

  if (!dishes.length) {
    container.innerHTML = `<div class="admin-empty">No dishes found for this meal.</div>`;
    return;
  }

  container.innerHTML = dishes.map((dish, index) => `
    <div class="admin-dish-row">
      <div>
        <strong>${adminEscape(dish.name)}</strong>
        <small>${dish.type === "nonveg" ? "Non-vegetarian" : "Vegetarian"}</small>
      </div>
      <div>
        <button data-edit-dish="${index}">Edit</button>
        <button data-delete-dish="${index}">Delete</button>
      </div>
    </div>
  `).join("");

  container.querySelectorAll("[data-delete-dish]").forEach(button => {
    button.addEventListener("click", () => deleteDish(Number(button.dataset.deleteDish)));
  });

  container.querySelectorAll("[data-edit-dish]").forEach(button => {
    button.addEventListener("click", () => editDish(Number(button.dataset.editDish)));
  });
}

function addDish() {
  const nameInput = admin$("adminDishName");
  const name = nameInput.value.trim();
  const type = admin$("adminDishType").value;

  if (!name) {
    alert("Enter a dish name.");
    return;
  }

  const date = getAdminDate();
  const meal = getAdminMeal();

  const dishes = [...getAdminMenuForDate(date)[meal]];
  dishes.push({ name, type });

  setAdminDateMeal(meal, dishes);
  nameInput.value = "";

  renderAdminMenu();
  updateOverview();
}

function deleteDish(index) {
  const date = getAdminDate();
  const meal = getAdminMeal();

  const dishes = [...getAdminMenuForDate(date)[meal]];
  dishes.splice(index, 1);

  setAdminDateMeal(meal, dishes);
  renderAdminMenu();
}

function editDish(index) {
  const date = getAdminDate();
  const meal = getAdminMeal();

  const dishes = [...getAdminMenuForDate(date)[meal]];
  const dish = dishes[index];

  const updatedName = prompt("Edit dish name:", dish.name);
  if (updatedName === null || !updatedName.trim()) return;

  const updatedType = prompt(
    "Enter type: veg or nonveg",
    dish.type || "veg"
  );

  if (updatedType === null) return;

  dishes[index] = {
    name: updatedName.trim(),
    type: updatedType.toLowerCase() === "nonveg" ? "nonveg" : "veg"
  };

  setAdminDateMeal(meal, dishes);
  renderAdminMenu();
}

function clearSelectedMeal() {
  const date = getAdminDate();
  const meal = getAdminMeal();

  if (!confirm(`Clear ${meal} for ${date}?`)) return;

  setAdminDateMeal(meal, []);
  renderAdminMenu();
}

/* MONTH MANAGEMENT */

function fillSelectedMonthFromWeeklyMenu() {
  if (!ADMIN.menu?.weekly) return;

  const selected = getAdminDate();
  if (!selected) {
    alert("Select a date first.");
    return;
  }

  const [year, month] = selected.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  if (!confirm(`Fill ${month}/${year} with the weekly menu? Existing date overrides will be replaced.`)) {
    return;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

    const weekly = ADMIN.menu.weekly[weekday];
    if (!weekly) continue;

    ADMIN.menu.days[key] = adminClone(weekly);
  }

  renderAdminMenu();
  updateOverview();
  alert("The selected month has been filled using the weekly menu.");
}

/* DRAFT & EXPORT */

function saveDraft() {
  if (!ADMIN.menu) return;

  adminSave(ADMIN.draftKey, ADMIN.menu);
  admin$("menuStatus").textContent = "Draft saved in this browser.";
  showAdminToast("Changes saved locally.");
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function exportMenu() {
  if (!ADMIN.menu) return;
  downloadJSON(ADMIN.menu, "menu.json");
}

function importMenuFile(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);

      if (!imported.weekly || typeof imported.weekly !== "object") {
        throw new Error("Invalid menu structure");
      }

      ADMIN.menu = imported;

      if (!ADMIN.menu.days) ADMIN.menu.days = {};
      if (!ADMIN.menu.announcements) ADMIN.menu.announcements = [];

      renderAdminMenu();
      renderAnnouncementsAdmin();
      updateOverview();

      alert("Menu imported successfully. Save the draft to keep it.");
    } catch (error) {
      alert("Invalid JSON file. Please check the menu structure.");
    }
  };

  reader.readAsText(file);
}

function resetLocalDraft() {
  if (!confirm("Delete the saved local draft and reload original menu?")) return;

  localStorage.removeItem(ADMIN.draftKey);
  ADMIN.menu = adminClone(ADMIN.originalMenu);

  renderAdminMenu();
  renderAnnouncementsAdmin();
  updateOverview();

  admin$("menuStatus").textContent = "Original menu restored.";
}

/* ANNOUNCEMENTS */

function addAnnouncement(event) {
  event.preventDefault();

  const title = admin$("announcementTitle").value.trim();
  const message = admin$("announcementMessage").value.trim();
  const date = admin$("announcementDate").value.trim() || "Campus update";

  if (!title || !message) return;

  ADMIN.menu.announcements.push({ title, message, date });

  event.target.reset();
  renderAnnouncementsAdmin();
  updateOverview();
  showAdminToast("Announcement added.");
}

function renderAnnouncementsAdmin() {
  const container = admin$("adminAnnouncementList");
  if (!container || !ADMIN.menu) return;

  const announcements = ADMIN.menu.announcements || [];

  if (!announcements.length) {
    container.innerHTML = `<div class="admin-empty">No announcements yet.</div>`;
    return;
  }

  container.innerHTML = announcements.map((item, index) => `
    <div class="admin-announcement">
      <h3>${adminEscape(item.title)}</h3>
      <p>${adminEscape(item.message)}</p>
      <small>${adminEscape(item.date || "")}</small><br><br>
      <button data-delete-announcement="${index}">Delete</button>
    </div>
  `).join("");

  container.querySelectorAll("[data-delete-announcement]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.deleteAnnouncement);
      ADMIN.menu.announcements.splice(index, 1);

      renderAnnouncementsAdmin();
      updateOverview();
    });
  });
}

/* DATA MANAGEMENT */

const DATA_KEYS = {
  feedback: "sauDiningFeedback",
  registrations: "sauStudentRegistrations",
  questions: "sauStudentQuestions",
  messApplications: "sauMessApplications",
  contacts: "sauContactMessages"
};

function renderRecords() {
  const container = admin$("adminRecords");
  if (!container) return;

  const records = adminRead(DATA_KEYS[ADMIN.dataType], []);
  updateOverview();

  if (!records.length) {
    container.innerHTML = `<div class="admin-empty">No saved records for this section.</div>`;
    return;
  }

  container.innerHTML = records.map((record, index) => {
    const fields = Object.entries(record)
      .filter(([key]) => key !== "date" && key !== "createdAt")
      .map(([key, value]) => `
        <p><strong>${adminEscape(key)}:</strong> ${adminEscape(value)}</p>
      `).join("");

    return `
      <article class="admin-record">
        <strong>Record ${index + 1}</strong>
        ${fields}
        <small>${adminEscape(record.date || record.createdAt || "")}</small>
      </article>
    `;
  }).join("");
}

function updateOverview() {
  if (!ADMIN.menu) return;

  admin$("statMenuDays").textContent =
    Object.keys(ADMIN.menu.weekly || {}).length;

  admin$("statAnnouncements").textContent =
    (ADMIN.menu.announcements || []).length;

  admin$("statFeedback").textContent =
    adminRead("sauDiningFeedback", []).length;

  admin$("statQuestions").textContent =
    adminRead("sauStudentQuestions", []).length;
}

function exportRecords() {
  const records = adminRead(DATA_KEYS[ADMIN.dataType], []);
  downloadJSON(records, `${ADMIN.dataType}.json`);
}

function clearRecords() {
  const key = DATA_KEYS[ADMIN.dataType];
  const records = adminRead(key, []);

  if (!records.length) return;

  if (!confirm(`Delete all ${ADMIN.dataType} records saved in this browser?`)) return;

  localStorage.removeItem(key);
  renderRecords();
}

function showAdminToast(message) {
  alert(message);
}

/* NAVIGATION */

function switchPanel(panel) {
  ADMIN.activePanel = panel;

  document.querySelectorAll(".admin-panel").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".admin-nav[data-panel]").forEach(button => {
    button.classList.remove("active");
  });

  admin$(`panel-${panel}`)?.classList.add("active");

  document.querySelector(`.admin-nav[data-panel="${panel}"]`)?.classList.add("active");

  const titles = {
    overview: "Dashboard Overview",
    menu: "Menu Manager",
    announcements: "Announcements",
    data: "Student Data"
  };

  admin$("adminPageTitle").textContent = titles[panel] || "Admin";
}

function initAdminNavigation() {
  document.querySelectorAll(".admin-nav[data-panel]").forEach(button => {
    button.addEventListener("click", () => switchPanel(button.dataset.panel));
  });

  document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => switchPanel(button.dataset.goto));
  });
}

/* INITIALIZATION */

document.addEventListener("DOMContentLoaded", () => {
  adminLogin();

  admin$("adminLogout")?.addEventListener("click", logoutAdmin);

  admin$("addDishBtn")?.addEventListener("click", addDish);
  admin$("adminMenuDate")?.addEventListener("change", renderAdminMenu);
  admin$("adminMealSelect")?.addEventListener("change", renderAdminMenu);

  admin$("copyWeekBtn")?.addEventListener("click", fillSelectedMonthFromWeeklyMenu);
  admin$("clearDayBtn")?.addEventListener("click", clearSelectedMeal);

  admin$("saveDraftBtn")?.addEventListener("click", saveDraft);
  admin$("exportMenuBtn")?.addEventListener("click", exportMenu);
  admin$("exportMenuBtn")?.addEventListener("click", exportMenu);
  admin$("reloadMenuBtn")?.addEventListener("click", loadAdminMenu);
  admin$("resetDraftBtn")?.addEventListener("click", resetLocalDraft);

  admin$("importMenuFile")?.addEventListener("change", event => {
    importMenuFile(event.target.files[0]);
    event.target.value = "";
  });

  admin$("announcementForm")?.addEventListener("submit", addAnnouncement);

  admin$("exportRecordsBtn")?.addEventListener("click", exportRecords);
  admin$("clearRecordsBtn")?.addEventListener("click", clearRecords);

  document.querySelectorAll(".admin-data-tab").forEach(button => {
    button.addEventListener("click", () => {
      ADMIN.dataType = button.dataset.dataType;

      document.querySelectorAll(".admin-data-tab").forEach(tab => {
        tab.classList.remove("active");
      });

      button.classList.add("active");
      renderRecords();
    });
  });

  initAdminNavigation();

  if (sessionStorage.getItem(ADMIN.sessionKey) === "true") {
    openAdmin();
  }

  loadAdminMenu();
});
