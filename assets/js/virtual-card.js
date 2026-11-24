document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "sauMessApplications";

  const searchInput = document.getElementById("studentLookup");
  const searchButton = document.getElementById("searchButton");
  const searchMessage = document.getElementById("searchMessage");
  const cardSection = document.getElementById("cardSection");
  const emptyState = document.getElementById("emptyState");
  const printButton = document.getElementById("printButton");
  const resetButton = document.getElementById("resetButton");

  function getApplications() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];

      const applications = JSON.parse(saved);
      return Array.isArray(applications) ? applications : [];
    } catch (error) {
      console.error("Unable to read mess applications:", error);
      return [];
    }
  }

  function clean(value) {
    return String(value ?? "").trim();
  }

  function normalize(value) {
    return clean(value).toLowerCase();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    });
  }

  function formatDate(value) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return clean(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function getStudentId(application) {
    return application.studentId ||
      application.studentID ||
      application.rollNumber ||
      application.rollNo ||
      "Not provided";
  }

  function getApplicationId(application) {
    return application.applicationId ||
      application.id ||
      application.applicationID ||
      "";
  }

  function getCardId(application) {
    return application.cardId ||
      application.messCardId ||
      application.cardNumber ||
      getApplicationId(application) ||
      "SAU-MESS";
  }

  function getExpiryDate(application) {
    return application.validUntil ||
      application.expiryDate ||
      application.expiresOn ||
      application.validity ||
      "";
  }

  function isExpired(application) {
    const expiry = getExpiryDate(application);

    if (!expiry) return false;

    const expiryDate = new Date(expiry);

    if (Number.isNaN(expiryDate.getTime())) {
      return false;
    }

    // Treat the complete expiry date as valid.
    expiryDate.setHours(23, 59, 59, 999);

    return expiryDate < new Date();
  }

  function findApplication(searchValue) {
    const search = normalize(searchValue);

    if (!search) return null;

    const applications = getApplications();

    return applications.find(application => {
      const possibleIds = [
        getStudentId(application),
        getApplicationId(application),
        getCardId(application)
      ];

      return possibleIds.some(id => normalize(id) === search);
    }) || null;
  }

  function showMessage(message, type) {
    searchMessage.textContent = message;
    searchMessage.className = "message " + type;
  }

  function showCard(application) {
    const status = normalize(application.status);

    if (status !== "active") {
      cardSection.hidden = true;
      emptyState.hidden = false;

      if (status === "pending") {
        showMessage(
          "Your application is still pending. Please wait for admin approval.",
          "error"
        );
      } else if (status === "rejected") {
        showMessage(
          "Your application was not approved. Please contact the mess administration.",
          "error"
        );
      } else {
        showMessage(
          "Your membership is not active. Please contact the mess administration.",
          "error"
        );
      }

      return;
    }

    if (isExpired(application)) {
      cardSection.hidden = true;
      emptyState.hidden = false;

      showMessage(
        "Your mess card has expired. Please contact the administrator for renewal.",
        "error"
      );

      return;
    }

    const name = application.name ||
      application.fullName ||
      application.studentName ||
      "SAU Student";

    const studentId = getStudentId(application);
    const cardId = getCardId(application);
    const plan = application.plan ||
      application.membershipPlan ||
      application.mealPlan ||
      "Student Membership";

    const expiry = getExpiryDate(application);

    document.getElementById("cardName").textContent = name;
    document.getElementById("cardStudentId").textContent = studentId;
    document.getElementById("cardNumber").textContent = cardId;
    document.getElementById("cardPlan").textContent = plan;
    document.getElementById("cardValidity").textContent =
      expiry ? formatDate(expiry) : "Not specified";

    document.getElementById("cardValidityLine").textContent =
      expiry ? "VALID UNTIL " + formatDate(expiry).toUpperCase() : "MEMBERSHIP ACTIVE";

    const statusBadge = document.getElementById("statusBadge");
    statusBadge.textContent = "ACTIVE";
    statusBadge.className = "status-badge";

    cardSection.hidden = false;
    emptyState.hidden = true;

    showMessage("Your active virtual mess card is ready.", "success");

    cardSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function searchCard() {
    const searchValue = searchInput.value;

    if (!clean(searchValue)) {
      showMessage("Please enter your Student ID, Application ID or Card ID.", "error");
      cardSection.hidden = true;
      emptyState.hidden = false;
      return;
    }

    const application = findApplication(searchValue);

    if (!application) {
      cardSection.hidden = true;
      emptyState.hidden = false;

      showMessage(
        "No application found. Please check your ID and try again.",
        "error"
      );

      return;
    }

    showCard(application);
  }

  searchButton.addEventListener("click", searchCard);

  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      searchCard();
    }
  });

  printButton.addEventListener("click", () => {
    window.print();
  });

  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    cardSection.hidden = true;
    emptyState.hidden = false;
    searchMessage.textContent = "";
    searchMessage.className = "message";
    searchInput.focus();
  });
});