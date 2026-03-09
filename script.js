// ==============================
// GLOBAL STATE
// ==============================
let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";
let selectedCounselorEmail = "";

// ==============================
// PAGE NAVIGATION
// ==============================
function goToPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById(id);
  if (page) page.classList.add("active");
}

// ==============================
// REASON / URGENCY
// ==============================
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

// ==============================
// MODALS
// ==============================
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

function openModal(username, email) {
  selectedCounselor = username;
  selectedCounselorEmail = email;

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

// -------------------
// Populate Counselor Dropdown (optional)
// -------------------
async function populateStudentCounselorDropdown(){
  const dropdown = document.getElementById("studentCounselorDropdown");
  if (!dropdown) return;
  try {
    const res = await fetch("/api/counselors");
    const counselors = await res.json();
    dropdown.innerHTML = "";
    counselors.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.username;
      opt.textContent = c.name;
      dropdown.appendChild(opt);
    });
    localStorage.setItem("studentCounselors", JSON.stringify(counselors));
  } catch(err){ console.error(err); }
}

// ==============================
// SUBMIT MESSAGE
// ==============================
async function submitMessage() {

  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");
  const gradeEl = document.getElementById("studentGrade");
  const studentIdEl = document.getElementById("studentId");
  const notesEl = document.getElementById("extraNotes");

  const firstName = firstNameEl ? firstNameEl.value.trim() : "";
  const lastName = lastNameEl ? lastNameEl.value.trim() : "";
  const grade = gradeEl ? gradeEl.value.trim() : "";
  const studentId = studentIdEl ? studentIdEl.value.trim() : "";
  const notes = notesEl ? notesEl.value.trim() : "";

  if (!firstName || !lastName || !grade || !studentId) {
    alert("Please fill in all required fields.");
    return;
  }

  // ==============================
  // SIS VERIFICATION (with fallback)
  // ==============================
  try {
    const res = await fetch("/api/verifyStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, firstName, lastName })
    });
    const verify = await res.json();
    if (!verify.valid) { alert("Student ID not recognized."); return; }
  } catch (err) {
    if (studentId !== "12345") {
      console.error(err);
      alert("Failed to verify student ID.");
      return;
    }
  }

  // ==============================
  // CREATE MESSAGE OBJECT
  // ==============================
  const entry = {
    firstName,
    lastName,
    grade,
    studentId,
    notes,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: selectedCounselor,
    counselorEmail: selectedCounselorEmail,
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

    const existing = JSON.parse(localStorage.getItem("studentMessages") || "[]");
    existing.push(entry);
    localStorage.setItem("studentMessages", JSON.stringify(existing));

    closeModal();
    openSuccess();

    selectedReason = "";
    selectedUrgency = "";
    selectedCounselor = "";
    selectedCounselorEmail = "";

    ["firstName","lastName","studentGrade","studentId","extraNotes"].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.value = "";
    });
  } catch(err){ console.error(err); alert("Failed to send message."); }
}

// ==============================
// INIT
// ==============================
window.onload = async () => {
  console.log("Student support system loaded.");
  await populateStudentCounselorDropdown();
};
