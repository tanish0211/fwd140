
/* ==========================================================
   SAU DINING — STUDENT WEBSITE JAVASCRIPT
   ========================================================== */

const SAU = {
  menu: null,
  selectedDate: new Date(),
  calendarDate: new Date(),
  activeMealFilter: "all",
  searchText: "",
  favouritesOnly: false,

  storage: {
    favourites: "sauDiningFavourites",
    ratings: "sauDiningRatings",
    feedback: "sauDiningFeedback",
    registrations: "sauStudentRegistrations",
    contacts: "sauContactMessages",
    questions: "sauStudentQuestions",
    theme: "sauDiningTheme"
  },

  meals: {
    breakfast: {
      name: "Breakfast",
      start: "08:30",
      end: "10:30",
      display: "8:30 AM – 10:30 AM",
      price: 50,
      icon: "☀"
    },
    lunch: {
      name: "Lunch",
      start: "12:30",
      end: "14:30",
      display: "12:30 PM – 2:30 PM",
      price: 70,
      icon: "◉"
    },
    dinner: {
      name: "Dinner",
      start: "19:30",
      end: "21:30",
      display: "7:30 PM – 9:30 PM",
      price: 70,
      icon: "☾"
    }
  }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function getLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getStored(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function showToast(message) {
  const container = $("#toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3200);
}

function formatDate(date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function todayKey() {
  return getLocalDateKey(new Date());
}

function getWeekday(date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function initShared() {
  const year = $("#footerYear");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = $("#mobileMenuBtn");
  const nav = $("#mainNav");

  menuButton?.addEventListener("click", () => {
    nav?.classList.toggle("open");
  });

  nav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });

  initTheme();
  initFeedbackForm();
  initRegistrationForm();
  initContactForm();
  initEventsPage();
  initFaqForm();
}

function initTheme() {
  const button = $("#themeToggle");
  const saved = localStorage.getItem(SAU.storage.theme);

  if (saved === "dark") document.body.classList.add("dark-mode");

  button?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const mode = document.body.classList.contains("dark-mode")
      ? "dark"
      : "light";

    localStorage.setItem(SAU.storage.theme, mode);
  });
}

/* ==========================================================
   SMART MEAL TIMING
   ========================================================== */

function getMealSchedule(date = new Date()) {
  const schedule = [];

  Object.entries(SAU.meals).forEach(([key, meal]) => {
    const [hour, minute] = meal.start.split(":").map(Number);
    const start = new Date(date);
    start.setHours(hour, minute, 0, 0);

    const [endHour, endMinute] = meal.end.split(":").map(Number);
    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);

    schedule.push({ key, meal, start, end });
  });

  return schedule;
}

function getNextMeal(now = new Date()) {
  const todaySchedule = getMealSchedule(now);

  for (const item of todaySchedule) {
    if (now < item.start) return item;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getMealSchedule(tomorrow)[0];
}

function getCurrentMeal(now = new Date()) {
  const schedule = getMealSchedule(now);

  return schedule.find(item => now >= item.start && now < item.end) || null;
}

function getCountdown(target) {
  const difference = target.getTime() - Date.now();

  if (difference <= 0) return "Starting soon";

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function updateNextMeal() {
  const next = getNextMeal();
  const current = getCurrentMeal();

  const name = $("#nextMealName");
  const timing = $("#nextMealTiming");
  const countdown = $("#nextMealCountdown");
  const icon = $("#nextMealIcon");
  const status = $("#mealStatus");
  const heroDate = $("#heroDate");

  if (name) name.textContent = next.meal.name;
  if (timing) timing.textContent = next.meal.display;
  if (countdown) {
    countdown.textContent = `Starts in ${getCountdown(next.start)}`;
  }
  if (icon) icon.textContent = next.meal.icon;

  if (status) {
    status.textContent = current
      ? `${current.meal.name} is currently being served`
      : "Next meal";
  }

  if (heroDate) heroDate.textContent = formatDate(new Date());

  $$(".timing-card").forEach(card => {
    card.classList.remove("current-meal");
    if (current && card.dataset.meal === current.key) {
      card.classList.add("current-meal");
    }
  });
}

/* ==========================================================
   MENU DATA
   ========================================================== */

async function loadMenu() {
  try {
    const response = await fetch("menu.json");

    if (!response.ok) throw new Error("Menu file could not load");

    SAU.menu = await response.json();
    renderAnnouncements();
    renderCalendar();
    renderSelectedMenu();
  } catch (error) {
    console.error(error);

    const container = $("#menuMealsContainer");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          Menu could not be loaded. Please run the website using VS Code Live Server.
        </div>`;
    }
  }
}

function getMenuForDate(date) {
  if (!SAU.menu) return {};

  const dateKey = getLocalDateKey(date);
  const weekday = getWeekday(date);

  const weeklyMenu = SAU.menu.weekly?.[weekday] || {};
  const dailyOverride = SAU.menu.days?.[dateKey] || {};

  return {
    breakfast: dailyOverride.breakfast ?? weeklyMenu.breakfast ?? [],
    lunch: dailyOverride.lunch ?? weeklyMenu.lunch ?? [],
    dinner: dailyOverride.dinner ?? weeklyMenu.dinner ?? []
  };
}

/* ==========================================================
   CALENDAR
   ========================================================== */

function renderCalendar() {
  const grid = $("#calendarGrid");
  const title = $("#calendarMonth");

  if (!grid || !title) return;

  const year = SAU.calendarDate.getFullYear();
  const month = SAU.calendarDate.getMonth();

  title.textContent = SAU.calendarDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const offset = (firstDay.getDay() + 6) % 7;
  const today = todayKey();
  const selected = getLocalDateKey(SAU.selectedDate);

  grid.innerHTML = "";

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const key = getLocalDateKey(date);

    const button = document.createElement("button");
    button.className = "calendar-day";
    button.type = "button";

    if (key === today) button.classList.add("today");
    if (key === selected) button.classList.add("selected");

    button.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="day-dot"></span>
    `;

    button.addEventListener("click", () => {
      SAU.selectedDate = date;
      renderCalendar();
      renderSelectedMenu();
    });

    grid.appendChild(button);
  }
}

function initCalendarControls() {
  $("#prevMonth")?.addEventListener("click", () => {
    SAU.calendarDate.setMonth(SAU.calendarDate.getMonth() - 1);
    renderCalendar();
  });

  $("#nextMonth")?.addEventListener("click", () => {
    SAU.calendarDate.setMonth(SAU.calendarDate.getMonth() + 1);
    renderCalendar();
  });

  $("#todayBtn")?.addEventListener("click", () => {
    SAU.selectedDate = new Date();
    SAU.calendarDate = new Date();
    renderCalendar();
    renderSelectedMenu();
  });

  $("#printMenuBtn")?.addEventListener("click", () => window.print());
}

/* ==========================================================
   MENU RENDERING
   ========================================================== */

function renderSelectedMenu() {
  const heading = $("#selectedDateTitle");
  if (heading) heading.textContent = formatDate(SAU.selectedDate);

  renderMenu();
}

function renderMenu() {
  const container = $("#menuMealsContainer");
  if (!container) return;

  const meals = getMenuForDate(SAU.selectedDate);
  const favourites = getStored(SAU.storage.favourites, []);
  const ratings = getStored(SAU.storage.ratings, {});

  const order = ["breakfast", "lunch", "dinner"];

  let output = "";

  order.forEach(mealKey => {
    if (
      SAU.activeMealFilter !== "all" &&
      SAU.activeMealFilter !== mealKey
    ) return;

    const dishes = meals[mealKey] || [];

    const filtered = dishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(SAU.searchText);
      const favouriteKey = `${mealKey}:${dish.name}`;
      const matchesFavourite = !SAU.favouritesOnly ||
        favourites.includes(favouriteKey);

      return matchesSearch && matchesFavourite;
    });

    if (!filtered.length) return;

    output += `
      <article class="meal-group">
        <div class="meal-group-header">
          <h3>${SAU.meals[mealKey].name}</h3>
          <span>${filtered.length} items</span>
        </div>
        <ul class="dish-list">
          ${filtered.map(dish => {
            const favouriteKey = `${mealKey}:${dish.name}`;
            const fav = favourites.includes(favouriteKey);
            const rating = ratings[favouriteKey] || 0;

            return `
              <li class="dish-item">
                <span class="dish-type-dot ${dish.type === "nonveg" ? "nonveg" : "veg"}"></span>
                <span class="dish-name">${escapeHTML(dish.name)}</span>
                <button
                  class="favourite-button ${fav ? "favourited" : ""}"
                  data-favourite="${escapeHTML(favouriteKey)}"
                  title="Add to favourites"
                >${fav ? "♥" : "♡"}</button>
              </li>
              <div class="dish-rating">
                Rate:
                ${[1,2,3,4,5].map(star => `
                  <button
                    data-rating-key="${escapeHTML(favouriteKey)}"
                    data-rating="${star}"
                    class="${star <= rating ? "rated" : ""}"
                    aria-label="Rate ${star} stars"
                  >★</button>
                `).join("")}
              </div>
            `;
          }).join("")}
        </ul>
      </article>
    `;
  });

  if (!output) {
    container.innerHTML = `<div class="empty-state">No dishes match your search.</div>`;
    return;
  }

  container.innerHTML = output;

  container.querySelectorAll("[data-favourite]").forEach(button => {
    button.addEventListener("click", () => toggleFavourite(button.dataset.favourite));
  });

  container.querySelectorAll("[data-rating]").forEach(button => {
    button.addEventListener("click", () => {
      saveRating(button.dataset.ratingKey, Number(button.dataset.rating));
    });
  });
}

function toggleFavourite(key) {
  let favourites = getStored(SAU.storage.favourites, []);

  if (favourites.includes(key)) {
    favourites = favourites.filter(item => item !== key);
    showToast("Removed from favourites");
  } else {
    favourites.push(key);
    showToast("Added to favourites");
  }

  saveStored(SAU.storage.favourites, favourites);
  renderMenu();
}

function saveRating(key, rating) {
  const ratings = getStored(SAU.storage.ratings, {});
  ratings[key] = rating;

  saveStored(SAU.storage.ratings, ratings);
  renderMenu();
  showToast("Thank you for rating!");
}

function initMenuControls() {
  $$(".filter-button[data-meal-filter]").forEach(button => {
    button.addEventListener("click", () => {
      SAU.activeMealFilter = button.dataset.mealFilter;

      $$(".filter-button[data-meal-filter]").forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      SAU.favouritesOnly = false;
      $("#favouritesFilter")?.classList.remove("active");
      renderMenu();
    });
  });

  $("#favouritesFilter")?.addEventListener("click", button => {
    SAU.favouritesOnly = !SAU.favouritesOnly;
    button.currentTarget.classList.toggle("active", SAU.favouritesOnly);
    renderMenu();
  });

  $("#menuSearch")?.addEventListener("input", event => {
    SAU.searchText = event.target.value.toLowerCase().trim();
    renderMenu();
  });
}

/* ==========================================================
   ANNOUNCEMENTS
   ========================================================== */

function renderAnnouncements() {
  const container = $("#announcementList");
  if (!container) return;

  const items = SAU.menu?.announcements || [];

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        There are no announcements at the moment.
      </div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <article class="announcement-item">
      <div class="announcement-icon">✦</div>
      <div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.message)}</p>
        <time>${escapeHTML(item.date || "Campus update")}</time>
      </div>
    </article>
  `).join("");
}

/* ==========================================================
   FEEDBACK
   ========================================================== */

function initFeedbackForm() {
  const form = $("#feedbackForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const entry = {
      name: $("#feedbackName").value.trim(),
      rating: $("#feedbackRating").value,
      message: $("#feedbackMessage").value.trim(),
      date: new Date().toISOString()
    };

    const entries = getStored(SAU.storage.feedback, []);
    entries.push(entry);
    saveStored(SAU.storage.feedback, entries);

    $("#feedbackStatus").textContent =
      "Thank you! Your feedback has been saved.";

    form.reset();
    showToast("Feedback submitted");
  });
}

/* ==========================================================
   REGISTRATION
   ========================================================== */

function initRegistrationForm() {
  const form = $("#registrationForm");
  if (!form) return;

  const success = $("#registrationSuccess");
  success?.classList.add("hidden");

  form.addEventListener("submit", event => {
    event.preventDefault();

    const entry = {
      name: $("#studentName").value.trim(),
      studentId: $("#studentId").value.trim(),
      email: $("#studentEmail").value.trim(),
      phone: $("#studentPhone").value.trim(),
      course: $("#studentCourse").value,
      year: $("#studentYear").value,
      diet: $("#studentDiet").value,
      date: new Date().toISOString()
    };

    const entries = getStored(SAU.storage.registrations, []);
    entries.push(entry);
    saveStored(SAU.storage.registrations, entries);

    form.classList.add("hidden");
    success?.classList.remove("hidden");

    showToast("Registration saved");
  });

  $("#registerAnother")?.addEventListener("click", () => {
    form.reset();
    form.classList.remove("hidden");
    success?.classList.add("hidden");
  });
}

/* ==========================================================
   CONTACT FORM
   ========================================================== */

function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const message = {
      name: $("#contactName").value.trim(),
      email: $("#contactEmail").value.trim(),
      subject: $("#contactSubject").value,
      message: $("#contactMessage").value.trim(),
      date: new Date().toISOString()
    };

    const entries = getStored(SAU.storage.contacts, []);
    entries.push(message);
    saveStored(SAU.storage.contacts, entries);

    $("#contactStatus").textContent =
      "Your message has been saved successfully.";

    form.reset();
    showToast("Message submitted");
  });
}

/* ==========================================================
   EVENTS PAGE
   ========================================================== */

const sampleEvents = [
  {
    title: "Community Dinner",
    category: "Dining",
    date: "2026-12-05",
    description: "A proposed community dining evening for students.",
    location: "University Dining Hall"
  },
  {
    title: "Food Appreciation Week",
    category: "Food",
    date: "2026-12-10",
    description: "Celebrate campus food, culture and shared experiences.",
    location: "Campus"
  },
  {
    title: "Student Suggestion Day",
    category: "Student",
    date: "2026-12-15",
    description: "Share suggestions about campus dining services.",
    location: "Mess Notice Area"
  },
  {
    title: "Special Menu Day",
    category: "Dining",
    date: "2026-12-20",
    description: "A proposed special dining menu day.",
    location: "Dining Hall"
  }
];

function initEventsPage() {
  const grid = $("#eventsGrid");
  if (!grid) return;

  const filter = $("#eventFilter");

  function renderEvents(category = "all") {
    const events = sampleEvents.filter(event =>
      category === "all" || event.category === category
    );

    if (!events.length) {
      grid.innerHTML = `<div class="empty-state">No events found.</div>`;
      return;
    }

    grid.innerHTML = events.map(event => `
      <article class="event-card">
        <div class="event-card-body">
          <span class="event-date-label">${escapeHTML(event.date)}</span>
          <h3>${escapeHTML(event.title)}</h3>
          <p>${escapeHTML(event.description)}</p>
          <div class="event-meta">
            <span>${escapeHTML(event.category)}</span>
            <span>${escapeHTML(event.location)}</span>
          </div>
        </div>
      </article>
    `).join("");
  }

  filter?.addEventListener("change", () => renderEvents(filter.value));
  renderEvents();

  const year = $("#eventYear");
  if (year) year.textContent = new Date().getFullYear();
}

/* ==========================================================
   FAQ — ASK A QUESTION
   ========================================================== */

function initFaqForm() {
  const form = $("#faqQuestionForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const question = {
      name: $("#questionName").value.trim(),
      email: $("#questionEmail").value.trim(),
      text: $("#questionText").value.trim(),
      date: new Date().toISOString(),
      status: "Pending"
    };

    const questions = getStored(SAU.storage.questions, []);
    questions.push(question);
    saveStored(SAU.storage.questions, questions);

    $("#questionStatus").textContent =
      "Your question has been recorded. It can be reviewed by the mess team.";

    form.reset();
    showToast("Question submitted");
  });
}

/* ==========================================================
   INITIALIZATION
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initShared();

  if (document.body.dataset.page === "home") {
    initCalendarControls();
    initMenuControls();

    SAU.selectedDate = new Date();
    SAU.calendarDate = new Date();

    updateNextMeal();
    setInterval(updateNextMeal, 1000);

    loadMenu();

    
/* ==========================================================
   MESS MEMBERSHIP & DEMO APPLICATION
   ========================================================== */

function initMessCard() {
  const page = document.body.dataset.page;
  if (page !== "mess-card") return;

  const onlinePanel = $("#onlineApplication");
  const paymentPanel = $("#demoPayment");
  const offlinePanel = $("#offlineApplication");

  let selectedPlan = "Vegetarian";
  let selectedPrice = 3400;

  function openOnlineForm() {
    onlinePanel?.classList.remove("hidden");
    paymentPanel?.classList.add("hidden");

    if ($("#onlinePlan")) {
      $("#onlinePlan").value = selectedPlan;
    }

    onlinePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showDemoPayment(plan, price) {
    if (paymentPanel) {
      paymentPanel.classList.remove("hidden");
    }

    if ($("#paymentPlanText")) {
      $("#paymentPlanText").textContent =
        `${plan} mess membership application`;
    }

    if ($("#paymentAmount")) {
      $("#paymentAmount").textContent = `₹${Number(price).toLocaleString("en-IN")}`;
    }

    paymentPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $$(".choosePlan").forEach(button => {
    button.addEventListener("click", () => {
      selectedPlan = button.dataset.plan;
      selectedPrice = Number(button.dataset.price);

      openOnlineForm();
    });
  });

  $("#onlinePaymentBtn")?.addEventListener("click", openOnlineForm);

  $("#closeOnlineForm")?.addEventListener("click", () => {
    onlinePanel?.classList.add("hidden");
  });

  $("#onlinePlan")?.addEventListener("change", event => {
    const plan = event.target.value;

    selectedPlan = plan;
    selectedPrice = plan === "Non-Vegetarian" ? 3800 : 3400;
  });

  $("#messOnlineForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const plan = $("#onlinePlan").value;
    const price = plan === "Non-Vegetarian" ? 3800 : 3400;

    const application = {
      name: $("#onlineName").value.trim(),
      studentId: $("#onlineStudentId").value.trim(),
      email: $("#onlineEmail").value.trim(),
      course: $("#onlineCourse").value.trim(),
      plan,
      amount: price,
      mode: "Online Demo",
      createdAt: new Date().toISOString()
    };

    const applications = getStored("sauMessApplications", []);
    applications.push(application);

    saveStored("sauMessApplications", applications);

    selectedPlan = plan;
    selectedPrice = price;

    $("#onlineFormStatus").textContent = "Application saved successfully.";
    showDemoPayment(plan, price);
    showToast("Application saved");
  });

  $("#paymentDoneBtn")?.addEventListener("click", () => {
    paymentPanel?.classList.add("hidden");
    onlinePanel?.classList.add("hidden");
    showToast("Demo payment screen closed");
  });

  $("#messOfflineForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const application = {
      name: $("#offlineName").value.trim(),
      studentId: $("#offlineStudentId").value.trim(),
      phone: $("#offlinePhone").value.trim(),
      course: $("#offlineCourse").value.trim(),
      plan: $("#offlinePlan").value,
      amount: $("#offlinePlan").value === "Non-Vegetarian" ? 3800 : 3400,
      mode: "Offline",
      createdAt: new Date().toISOString()
    };

    const applications = getStored("sauMessApplications", []);
    applications.push(application);

    saveStored("sauMessApplications", applications);

    $("#offlineStatus").textContent =
      "Your offline application details have been saved in this demo. Please visit the mess manager to complete the actual process.";

    event.target.reset();
    showToast("Offline application saved");
  });
}

  }
});
