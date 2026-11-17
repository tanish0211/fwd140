
/* ==========================================
   SAU MESS MENU - JAVASCRIPT
========================================== */

/* 1. SAMPLE WEEKLY FOOD MENU
   0 = Sunday, 1 = Monday ... 6 = Saturday
*/

const weeklyMenu = {
    0: {
        breakfast: [
            { name: "Aloo Paratha", type: "veg" },
            { name: "Curd", type: "veg" },
            { name: "Tea", type: "veg" }
        ],
        lunch: [
            { name: "Dal Tadka", type: "veg" },
            { name: "Jeera Rice", type: "veg" },
            { name: "Mixed Vegetable", type: "veg" }
        ],
        dinner: [
            { name: "Paneer Curry", type: "veg" },
            { name: "Chapati", type: "veg" },
            { name: "Salad", type: "veg" }
        ]
    },

    1: {
        breakfast: [
            { name: "Poha", type: "veg" },
            { name: "Banana", type: "veg" },
            { name: "Milk", type: "veg" }
        ],
        lunch: [
            { name: "Rajma", type: "veg" },
            { name: "Steamed Rice", type: "veg" },
            { name: "Roti", type: "veg" }
        ],
        dinner: [
            { name: "Vegetable Pulao", type: "veg" },
            { name: "Raita", type: "veg" },
            { name: "Papad", type: "veg" }
        ]
    },

    2: {
        breakfast: [
            { name: "Idli", type: "veg" },
            { name: "Sambar", type: "veg" },
            { name: "Coconut Chutney", type: "veg" }
        ],
        lunch: [
            { name: "Chole", type: "veg" },
            { name: "Rice", type: "veg" },
            { name: "Chapati", type: "veg" }
        ],
        dinner: [
            { name: "Mix Veg", type: "veg" },
            { name: "Dal Fry", type: "veg" },
            { name: "Roti", type: "veg" }
        ]
    },

    3: {
        breakfast: [
            { name: "Masala Dosa", type: "veg" },
            { name: "Sambar", type: "veg" },
            { name: "Tea", type: "veg" }
        ],
        lunch: [
            { name: "Kadhi Pakora", type: "veg" },
            { name: "Rice", type: "veg" },
            { name: "Salad", type: "veg" }
        ],
        dinner: [
            { name: "Chicken Curry", type: "nonveg" },
            { name: "Chapati", type: "veg" },
            { name: "Dal", type: "veg" }
        ]
    },

    4: {
        breakfast: [
            { name: "Bread Omelette", type: "nonveg" },
            { name: "Butter Toast", type: "veg" },
            { name: "Milk", type: "veg" }
        ],
        lunch: [
            { name: "Paneer Butter Masala", type: "veg" },
            { name: "Rice", type: "veg" },
            { name: "Roti", type: "veg" }
        ],
        dinner: [
            { name: "Veg Fried Rice", type: "veg" },
            { name: "Manchurian", type: "veg" },
            { name: "Soup", type: "veg" }
        ]
    },

    5: {
        breakfast: [
            { name: "Upma", type: "veg" },
            { name: "Fruit", type: "veg" },
            { name: "Tea", type: "veg" }
        ],
        lunch: [
            { name: "Dal Makhani", type: "veg" },
            { name: "Rice", type: "veg" },
            { name: "Chapati", type: "veg" }
        ],
        dinner: [
            { name: "Egg Curry", type: "nonveg" },
            { name: "Jeera Rice", type: "veg" },
            { name: "Salad", type: "veg" }
        ]
    },

    6: {
        breakfast: [
            { name: "Chole Bhature", type: "veg" },
            { name: "Pickle", type: "veg" },
            { name: "Tea", type: "veg" }
        ],
        lunch: [
            { name: "Veg Biryani", type: "veg" },
            { name: "Raita", type: "veg" },
            { name: "Salad", type: "veg" }
        ],
        dinner: [
            { name: "Dal Makhani", type: "veg" },
            { name: "Naan", type: "veg" },
            { name: "Gulab Jamun", type: "veg" }
        ]
    }
};


/* 2. SAMPLE ANNOUNCEMENTS */

const announcements = [
    {
        title: "Weekly Menu Update",
        date: "Sample announcement",
        message: "Students can explore the weekly breakfast, lunch and dinner menu through the food calendar."
    },
    {
        title: "Share Your Food Feedback",
        date: "Student feedback",
        message: "Use the rating section to share your opinion about meals and suggest improvements."
    },
    {
        title: "Special Meal Information",
        date: "Mess notice",
        message: "Check the calendar regularly for sample special meal entries and menu updates."
    },
    {
        title: "Food Preference Filter",
        date: "Website feature",
        message: "Use the vegetarian and non-vegetarian filter to find suitable food items."
    }
];


/* 3. LOCAL STORAGE HELPERS */

function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Could not save browser data:", error);
    }
}

let favourites = readStorage("sauFavourites", []);
let ratings = readStorage("sauRatings", []);


/* 4. DATE HELPERS */

function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function getMenuForDate(date) {
    return weeklyMenu[date.getDay()];
}

function getMealIcon(meal) {
    if (meal === "breakfast") return "🌅";
    if (meal === "lunch") return "☀️";
    return "🌙";
}

function getMealLabel(meal) {
    return meal.charAt(0).toUpperCase() + meal.slice(1);
}


/* 5. CREATE FOOD CARD */

function createMealCard(mealName, items, mealDate, mealType) {
    const card = document.createElement("article");
    card.className = "meal-card";

    const list = items.map(item => `
        <li>
            <span class="food-dot ${item.type}"></span>
            ${item.name}
        </li>
    `).join("");

    card.innerHTML = `
        <div class="meal-card-top">
            <span class="meal-icon">${getMealIcon(mealType)}</span>
            <span class="eyebrow">${mealName}</span>
        </div>

        <h3>${getMealLabel(mealType)}</h3>

        <ul>${list}</ul>

        <div class="meal-card-bottom">
            <span>${formatDate(mealDate)}</span>
            <span>${items.length} items</span>
        </div>
    `;

    return card;
}


/* 6. HOME PAGE - TODAY'S MENU */

function renderTodayMenu() {
    const container = document.getElementById("todayMeals");
    const dateElement = document.getElementById("todayDate");

    if (!container || !dateElement) return;

    const today = new Date();
    const menu = getMenuForDate(today);

    dateElement.textContent = formatDate(today);
    container.innerHTML = "";

    ["breakfast", "lunch", "dinner"].forEach(meal => {
        const card = createMealCard(
            formatDate(today),
            menu[meal],
            today,
            meal
        );

        container.appendChild(card);
    });
}


/* 7. FOOD CALENDAR */

const today = new Date();

let displayedMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);

let selectedDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
);

function renderCalendar() {
    const calendar = document.getElementById("calendarDays");
    const monthTitle = document.getElementById("monthYear");

    if (!calendar || !monthTitle) return;

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    monthTitle.textContent = displayedMonth.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

    calendar.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
        let date;

        if (i < firstDay) {
            date = new Date(
                year,
                month - 1,
                previousMonthDays - firstDay + i + 1
            );
        } else if (i >= firstDay + daysInMonth) {
            date = new Date(
                year,
                month + 1,
                i - firstDay - daysInMonth + 1
            );
        } else {
            date = new Date(year, month, i - firstDay + 1);
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.textContent = date.getDate();

        if (date.getMonth() !== month) {
            button.classList.add("other-month");
        }

        if (dateKey(date) === dateKey(today)) {
            button.classList.add("today");
        }

        if (dateKey(date) === dateKey(selectedDate)) {
            button.classList.add("selected");
        }

        button.setAttribute("aria-label", formatDate(date));
        button.setAttribute(
            "aria-pressed",
            dateKey(date) === dateKey(selectedDate) ? "true" : "false"
        );

        button.addEventListener("click", () => {
            selectedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

            displayedMonth = new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );

            renderCalendar();
            renderSelectedMenu();
            renderWeeklyMenu();
        });

        calendar.appendChild(button);
    }
}


/* 8. SHOW SELECTED DATE'S BREAKFAST, LUNCH AND DINNER */

function renderSelectedMenu() {
    const heading = document.getElementById("selectedDateText");
    const container = document.getElementById("selectedMeals");

    if (!heading || !container) return;

    heading.textContent = formatDate(selectedDate);
    container.innerHTML = "";

    const menu = getMenuForDate(selectedDate);

    ["breakfast", "lunch", "dinner"].forEach(meal => {
        const box = document.createElement("div");
        box.className = "selected-meal";

        const items = menu[meal].map(item => {
            return item.name +
                (item.type === "nonveg" ? " (Non-veg)" : " (Veg)");
        }).join(", ");

        const title = document.createElement("h3");
        title.textContent = `${getMealIcon(meal)} ${getMealLabel(meal)}`;

        const description = document.createElement("p");
        description.textContent = items;

        box.append(title, description);
        container.appendChild(box);
    });
}


/* 9. CALENDAR NAVIGATION */

const previousButton = document.getElementById("prevMonth");
const nextButton = document.getElementById("nextMonth");
const todayButton = document.getElementById("goToday");

if (previousButton) {
    previousButton.addEventListener("click", () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() - 1,
            1
        );
        renderCalendar();
    });
}

if (nextButton) {
    nextButton.addEventListener("click", () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() + 1,
            1
        );
        renderCalendar();
    });
}

if (todayButton) {
    todayButton.addEventListener("click", () => {
        selectedDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        displayedMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        renderCalendar();
        renderSelectedMenu();
        renderWeeklyMenu();
    });
}


/* 10. WEEKLY MENU */

function getWeekDates(date) {
    const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const day = start.getDay();

    // Start the week on Monday.
    const difference = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + difference);

    return Array.from({ length: 7 }, (_, index) => {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + index);
        return nextDate;
    });
}

function renderWeeklyMenu() {
    const container = document.getElementById("weeklyMenu");
    const range = document.getElementById("weekRange");

    if (!container || !range) return;

    const dates = getWeekDates(selectedDate);
    const first = dates[0];
    const last = dates[6];

    range.textContent = `${formatDate(first)} – ${formatDate(last)}`;

    const search = (
        document.getElementById("menuSearch")?.value || ""
    ).trim().toLowerCase();

    const filter = document.getElementById("foodFilter")?.value || "all";

    let table = `
        <table class="weekly-table">
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                </tr>
            </thead>
            <tbody>
    `;

    let matchingRows = 0;

    dates.forEach(date => {
        const menu = getMenuForDate(date);

        const filteredMeals = {};

        ["breakfast", "lunch", "dinner"].forEach(meal => {
            filteredMeals[meal] = menu[meal].filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(search);
                const matchesType = filter === "all" || item.type === filter;

                return matchesSearch && matchesType;
            });
        });

        const rowHasItems = Object.values(filteredMeals).some(
            items => items.length > 0
        );

        if (!rowHasItems) return;

        matchingRows++;

        const cells = ["breakfast", "lunch", "dinner"].map(meal => {
            const content = filteredMeals[meal].map(item => {
                const icon = item.type === "veg" ? "🟢" : "🔴";
                return `<span class="weekly-food">${icon} ${item.name}</span>`;
            }).join("");

            return `<td>${content || "—"}</td>`;
        }).join("");

        table += `
            <tr>
                <td class="weekly-day">
                    ${date.toLocaleDateString("en-IN", { weekday: "short" })}<br>
                    ${date.getDate()} ${date.toLocaleDateString("en-IN", { month: "short" })}
                </td>
                ${cells}
            </tr>
        `;
    });

    table += "</tbody></table>";

    if (matchingRows === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No matching food items found. Try another search or filter.
            </div>
        `;
    } else {
        container.innerHTML = table;
    }
}

const menuSearch = document.getElementById("menuSearch");
const foodFilter = document.getElementById("foodFilter");

if (menuSearch) {
    menuSearch.addEventListener("input", renderWeeklyMenu);
}

if (foodFilter) {
    foodFilter.addEventListener("change", renderWeeklyMenu);
}


/* 11. PRINT WEEKLY MENU */

const printButton = document.getElementById("printWeek");

if (printButton) {
    printButton.addEventListener("click", () => {
        window.print();
    });
}


/* 12. FAVOURITES */

function isFavourite(name) {
    return favourites.includes(name);
}

function renderFavouriteCards() {
    const container = document.getElementById("favouritesList");

    if (!container) return;

    container.innerHTML = "";

    if (favourites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No favourites saved yet. Click the heart on a food item to save it.
            </div>
        `;
        return;
    }

    const allFood = [];

    Object.values(weeklyMenu).forEach(day => {
        ["breakfast", "lunch", "dinner"].forEach(meal => {
            day[meal].forEach(item => {
                if (favourites.includes(item.name)) {
                    const alreadyAdded = allFood.some(
                        existing => existing.name === item.name
                    );

                    if (!alreadyAdded) {
                        allFood.push(item);
                    }
                }
            });
        });
    });

    allFood.forEach(item => {
        const card = document.createElement("article");
        card.className = "meal-card";

        const title = document.createElement("h3");
        title.textContent = item.name;

        const category = document.createElement("p");
        category.textContent = item.type === "veg"
            ? "🟢 Vegetarian"
            : "🔴 Non-vegetarian";
        category.className = "muted-text";

        const removeButton = document.createElement("button");
        removeButton.className = "favorite-button saved";
        removeButton.type = "button";
        removeButton.textContent = "♥ Remove favourite";

        removeButton.addEventListener("click", () => {
            toggleFavourite(item.name);
        });

        card.append(title, category, removeButton);
        container.appendChild(card);
    });
}

function toggleFavourite(name) {
    if (isFavourite(name)) {
        favourites = favourites.filter(item => item !== name);
    } else {
        favourites.push(name);
    }

    saveStorage("sauFavourites", favourites);

    renderFavouriteCards();
    renderSelectedMenu();
    renderTodayMenu();
}


/* Add favourite buttons to meal cards on the home page */

function addFavouriteControls() {
    document.querySelectorAll(".meal-card").forEach(card => {
        if (card.querySelector(".favorite-button")) return;

        const title = card.querySelector("li");

        if (!title) return;

        // The food name comes from the first food item in the card.
        const firstItem = title.textContent.trim();
        const name = firstItem.replace(/\s+/g, " ");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "favorite-button";
        button.textContent = isFavourite(name) ? "♥ Saved" : "♡ Save food";

        if (isFavourite(name)) button.classList.add("saved");

        button.addEventListener("click", () => {
            toggleFavourite(name);
        });

        card.appendChild(button);
    });
}


/* Create daily meal cards with favourite buttons */

function renderTodayMenuWithFavourites() {
    const container = document.getElementById("todayMeals");
    const dateElement = document.getElementById("todayDate");

    if (!container || !dateElement) return;

    const currentDate = new Date();
    const menu = getMenuForDate(currentDate);

    dateElement.textContent = formatDate(currentDate);
    container.innerHTML = "";

    ["breakfast", "lunch", "dinner"].forEach(meal => {
        const card = createMealCard(
            formatDate(currentDate),
            menu[meal],
            currentDate,
            meal
        );

        const button = document.createElement("button");
        button.type = "button";
        button.className = "favorite-button";
        button.textContent = "♡ Save a food item";
        button.title = "Save the first food item in this meal";

        button.addEventListener("click", () => {
            const firstFood = menu[meal][0].name;
            toggleFavourite(firstFood);
            button.textContent = isFavourite(firstFood)
                ? "♥ Saved: " + firstFood
                : "♡ Save a food item";
        });

        card.appendChild(button);
        container.appendChild(card);
    });
}


/* 13. FOOD RATINGS AND FEEDBACK */

function renderRatings() {
    const container = document.getElementById("ratingList");

    if (!container) return;

    container.innerHTML = "";

    if (ratings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No ratings have been submitted in this browser yet.
            </div>
        `;
        return;
    }

    ratings.slice().reverse().forEach(rating => {
        const card = document.createElement("article");
        card.className = "rating-entry";

        const title = document.createElement("strong");
        title.textContent = rating.food;

        const stars = document.createElement("div");
        stars.className = "rating-stars";
        stars.textContent = "★".repeat(rating.score) +
            "☆".repeat(5 - rating.score);

        const comment = document.createElement("p");
        comment.textContent = rating.comment || "No written feedback.";

        const date = document.createElement("p");
        date.textContent = rating.date;

        card.append(title, stars, comment, date);
        container.appendChild(card);
    });
}

const ratingForm = document.getElementById("ratingForm");

if (ratingForm) {
    ratingForm.addEventListener("submit", event => {
        event.preventDefault();

        const food = document.getElementById("ratingFood").value.trim();
        const score = Number(document.getElementById("ratingScore").value);
        const comment = document.getElementById("ratingComment").value.trim();
        const message = document.getElementById("ratingMessage");

        if (!food || score < 1 || score > 5) {
            message.textContent = "Please enter a food item and select a rating.";
            message.className = "form-message error";
            return;
        }

        ratings.push({
            food,
            score,
            comment,
            date: new Date().toLocaleDateString("en-IN")
        });

        saveStorage("sauRatings", ratings);

        message.textContent = "Thank you! Your rating has been saved in this browser.";
        message.className = "form-message success";

        ratingForm.reset();
        renderRatings();
    });
}


/* 14. ANNOUNCEMENTS */

function renderAnnouncements(containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    announcements.forEach(item => {
        const card = document.createElement("article");
        card.className = "announcement-card";

        const date = document.createElement("span");
        date.className = "announcement-date";
        date.textContent = item.date;

        const title = document.createElement("h3");
        title.textContent = item.title;

        const message = document.createElement("p");
        message.textContent = item.message;

        card.append(date, title, message);
        container.appendChild(card);
    });
}


/* 15. DARK AND LIGHT MODE */

const themeButton = document.getElementById("themeToggle");

function updateThemeButton() {
    if (!themeButton) return;

    themeButton.textContent = document.body.classList.contains("dark-mode")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
}

const savedTheme = localStorage.getItem("sauTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

updateThemeButton();

if (themeButton) {
    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        const theme = document.body.classList.contains("dark-mode")
            ? "dark"
            : "light";

        localStorage.setItem("sauTheme", theme);
        updateThemeButton();
    });
}


/* 16. MOBILE NAVIGATION */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });
}


/* 17. REGISTRATION FORM VALIDATION */

const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
    registrationForm.addEventListener("submit", event => {
        event.preventDefault();

        const phone = document.getElementById("studentPhone").value.trim();
        const message = document.getElementById("registrationMessage");

        if (!/^[0-9]{10}$/.test(phone)) {
            message.textContent = "Please enter a valid 10-digit phone number.";
            message.className = "form-message error";
            return;
        }

        message.textContent =
            "Registration form completed successfully! This is a demonstration; no data was sent.";
        message.className = "form-message success";

        registrationForm.reset();
    });
}


/* 18. CONTACT FORM VALIDATION */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const message = document.getElementById("contactResponse");

        message.textContent =
            "Thank you for your message! This demonstration does not send messages to a server.";
        message.className = "form-message success";

        contactForm.reset();
    });
}


/* 19. FOOTER YEAR */

document.querySelectorAll(".current-year").forEach(element => {
    element.textContent = new Date().getFullYear();
});


/* 20. INITIALISE WEBSITE FEATURES */

renderTodayMenuWithFavourites();
renderCalendar();
renderSelectedMenu();
renderWeeklyMenu();
renderFavouriteCards();
renderRatings();
renderAnnouncements("announcementList");
renderAnnouncements("homeAnnouncements");
