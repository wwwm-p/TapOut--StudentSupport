const API_BASE = "https://sis-api-smoky.vercel.app";

let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";

// -------------------
// Navigation
// -------------------
function goToPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
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

function openModal(counselorId) {
  selectedCounselor = counselorId;
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

function openSuccess() {
  document.getElementById("successOverlay").style.display = "flex";
}

function closeSuccess() {
  document.getElementById("successOverlay").style.display = "none";
  goToPage("page1");
}

// -------------------
// LOAD COUNSELORS
// -------------------
async function populateStudentCounselorDropdown() {
  const school_id = localStorage.getItem("school_id");

  if (!school_id) {
    console.error("Missing school_id");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/admin/get-counselors?school_id=${school_id}`
    );

    const counselors = await res.json();

    if (!Array.isArray(counselors)) {
      console.error("Invalid counselor response", counselors);
      return;
    }

    const dropdown = document.getElementById("studentCounselorDropdown");
    if (dropdown) {
      dropdown.innerHTML = "";

      counselors
        .filter(c => c.is_visible !== false)
        .forEach(c => {
          const opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = c.name;
          dropdown.appendChild(opt);
        });
    }

    const grid = document.getElementById("counselorGrid");
    if (grid) {
      grid.innerHTML = "";

      counselors
        .filter(c => c.is_visible !== false)
        .forEach(c => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.textContent = c.name;
          btn.onclick = () => openModal(c.id);
          grid.appendChild(btn);
        });
    }

  } catch (err) {
    console.error("Counselor load failed:", err);
  }
}

// -------------------
// SUBMIT ASSESSMENT
// -------------------
async function submitMessage() {
  const first_name = document.getElementById("firstName")?.value.trim();
  const last_name = document.getElementById("lastName")?.value.trim();
  const student_id = document.getElementById("studentId")?.value.trim();
  const notes = document.getElementById("extraNotes")?.value.trim();

  const school_id = localStorage.getItem("school_id");

  if (!school_id) {
    alert("Missing school ID");
    return;
  }

  if (!first_name || !last_name || !student_id) {
    alert("Please fill all required fields");
    return;
  }

  if (!selectedCounselor) {
    alert("Please select a counselor");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/students/submit-assessment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          school_id,
          counselor_id: selectedCounselor,
          student_id,
          first_name,
          last_name,
          answers: {
            reason: selectedReason,
            urgency: selectedUrgency,
            notes: notes || ""
          }
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Submission failed");
      return;
    }

    closeModal();
    openSuccess();

    selectedReason = "";
    selectedUrgency = "";
    selectedCounselor = "";

    ["firstName", "lastName", "studentId", "extraNotes"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

  } catch (err) {
    console.error("Submit error:", err);
    alert("Submission failed");
  }
}

// -------------------
// INIT
// -------------------
window.onload = async () => {
  await populateStudentCounselorDropdown();
};
