let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";
let selectedCounselorEmail = "";

// --------------------------
// Page Navigation
// --------------------------
function goToPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById(id);
  if (page) page.classList.add("active");
}

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

// --------------------------
// Modals
// --------------------------
function openCrisisModal() {
  const overlay = document.getElementById("crisisOverlay");
  if (overlay) overlay.style.display = "flex";
}

function closeCrisisModal() {
  const overlay = document.getElementById("crisisOverlay");
  if (overlay) overlay.style.display = "none";
}

function continueFromCrisis() {
  closeCrisisModal();
  goToPage("page3");
}

function openModal(counselorUsername, counselorEmail) {
  selectedCounselor = counselorUsername;
  selectedCounselorEmail = counselorEmail;
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.style.display = "flex";
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.style.display = "none";
}

function openSuccess() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.style.display = "flex";
}

function closeSuccess() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.style.display = "none";
  goToPage("page1");
}

// --------------------------
// Fetch & Populate Counselor Dropdown
// --------------------------
async function updateCounselorDropdown() {
  try {
    const res = await fetch("/api/counselors");
    const counselors = await res.json(); // Array of { name, email, username }

    const dropdown = document.getElementById("counselorSelect"); // change to your select ID
    if (!dropdown) return;
    const current = selectedCounselor;
    dropdown.innerHTML = "";

    counselors.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.username;
      opt.textContent = c.name;
      if (c.username === current) opt.selected = true;
      dropdown.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load counselors", err);
  }
}

// Call this periodically to sync with admin changes
setInterval(updateCounselorDropdown, 5000);

// --------------------------
// Message Submission
// --------------------------
async function submitMessage() {
  const firstName = document.getElementById("firstName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const grade = document.getElementById("studentGrade")?.value.trim();
  const studentId = document.getElementById("studentId")?.value.trim();
  const notes = document.getElementById("extraNotes")?.value.trim();
  const counselorSelect = document.getElementById("counselorSelect");
  selectedCounselor = counselorSelect ? counselorSelect.value : selectedCounselor;

  if (!firstName || !lastName || !grade || !studentId || !selectedCounselor) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    const res = await fetch("/api/verifyStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, firstName, lastName })
    });
    const verify = await res.json();
    if (!verify.valid) {
      alert("Student ID not recognized. Please check and try again.");
      return;
    }
  } catch (err) {
    console.error(err);
    alert("Failed to verify student ID. Check your network.");
    return;
  }

  const entry = {
    firstName,
    lastName,
    grade,
    studentId,
    notes,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: selectedCounselor,
    dateTime: new Date().toISOString()
  };

  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    const data = await res.json();
    if (!data.success) throw new Error("Failed to submit message");

    closeModal();
    openSuccess();

    // Reset form
    selectedReason = "";
    selectedUrgency = "";
    selectedCounselor = "";
    ["firstName", "lastName", "studentGrade", "studentId", "extraNotes"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

  } catch (err) {
    console.error(err);
    alert("Failed to send message. Check your network.");
  }
}

// --------------------------
// Init
// --------------------------
window.onload = async () => {
  await updateCounselorDropdown(); // populate on load
};
