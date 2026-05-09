const API_BASE = "https://sis-api-smoky.vercel.app/api";

let selectedReason = "";
let selectedUrgency = "";

// -------------------
// SIS API CLIENT
// -------------------
const sisApi = {
  async request(path, options = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {})
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  },

  auth: {
    bootstrap() {
      return sisApi.request("/auth/bootstrap");
    }
  },

  students: {
    submitAssessment(data) {
      return sisApi.request("/students/submit-assessment", {
        method: "POST",
        body: JSON.stringify(data)
      });
    }
  }
};

// -------------------
// Navigation
// -------------------
function goToPage(id) {
  document
    .querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  document
    .getElementById(id)
    ?.classList.add("active");
}

// -------------------
// Reason / Urgency
// -------------------
function chooseReason(reason) {
  selectedReason = reason;
  goToPage("page2");
}

function chooseUrgency(urgency) {
  selectedUrgency = urgency;

  if (urgency === "I’m in Crisis") {
    openCrisisModal();
  } else {
    goToPage("page3");
  }
}

// -------------------
// Modals
// -------------------
function openCrisisModal() {
  document.getElementById("crisisOverlay").style.display = "flex";
}

function closeCrisisModal() {
  document.getElementById("crisisOverlay").style.display = "none";
}

function continueFromCrisis() {
  closeCrisisModal();
  goToPage("page3");
}

function openSuccess() {
  document.getElementById("successOverlay").style.display = "flex";
}

function closeSuccess() {
  document.getElementById("successOverlay").style.display = "none";

  resetForm();

  goToPage("page1");
}

// -------------------
// RESET FORM
// -------------------
function resetForm() {
  selectedReason = "";
  selectedUrgency = "";

  [
    "firstName",
    "lastName",
    "studentId",
    "extraNotes"
  ].forEach(id => {
    const el = document.getElementById(id);

    if (el) {
      el.value = "";
    }
  });
}

// -------------------
// SUBMIT ASSESSMENT
// -------------------
async function submitMessage() {
  try {
    const first_name =
      document.getElementById("firstName")
        ?.value
        .trim();

    const last_name =
      document.getElementById("lastName")
        ?.value
        .trim();

    const student_id =
      document.getElementById("studentId")
        ?.value
        .trim();

    const notes =
      document.getElementById("extraNotes")
        ?.value
        .trim();

    const school_id =
      localStorage.getItem("school_id");

    if (!school_id) {
      alert("Missing school ID");
      return;
    }

    if (
      !first_name ||
      !last_name ||
      !student_id
    ) {
      alert("Please fill all required fields");
      return;
    }

    // BACKEND HANDLES:
    // - counselor assignment
    // - crisis routing
    // - notifications
    // - validation

    await sisApi.students.submitAssessment({
      school_id,
      student_id,
      first_name,
      last_name,
      reason: selectedReason,
      urgency: selectedUrgency,
      notes: notes || ""
    });

    openSuccess();

  } catch (err) {
    console.error("Submit error:", err);
    alert(err.message || "Submission failed");
  }
}

// -------------------
// BOOTSTRAP
// -------------------
async function bootstrapApp() {
  try {
    const data = await sisApi.auth.bootstrap();

    console.log("Bootstrap:", data);

    localStorage.setItem(
      "school_id",
      data.school.id
    );

  } catch (err) {
    console.error("Bootstrap failed:", err);
  }
}

// -------------------
// INIT
// -------------------
window.onload = async () => {
  await bootstrapApp();
};
