let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";
let selectedCounselorEmail = "";

// -------------------
// Page Navigation
// -------------------
function goToPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById(id);
  if (page) page.classList.add("active");
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
  if (urgency === "I’m in Crisis") openCrisisModal();
  else goToPage("page3");
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

function openModal(counselorUsername, counselorEmail) {
  selectedCounselor = counselorUsername;
  selectedCounselorEmail = counselorEmail;
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
// Populate Counselors dynamically
// -------------------
async function populateStudentCounselorDropdown() {
  let counselors = [];

  try {
    const res = await fetch('/api/getCounselors'); // use new API
    const data = await res.json();
    if (data.success && Array.isArray(data.counselors)) {
      counselors = data.counselors;
    }
  } catch (err) {
    console.warn("Failed to fetch counselors, using default examples.", err);
    counselors = [
      { username: "counselor1", email: "counselor1@example.com", name: "Counselor One" },
      { username: "counselor2", email: "counselor2@example.com", name: "Counselor Two" },
      { username: "counselor3", email: "counselor3@example.com", name: "Counselor Three" }
    ];
  }

  // Populate counselor dropdown if exists
  const dropdown = document.getElementById('studentCounselorDropdown');
  if (dropdown) {
    dropdown.innerHTML = '';
    counselors.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.username;
      opt.textContent = c.name || c.email || c.username;
      dropdown.appendChild(opt);
    });
  }

  // Populate the counselor grid
  const grid = document.getElementById('counselorGrid');
  if (grid) {
    grid.innerHTML = '';
    counselors.forEach(c => {
      const btn = document.createElement('button');
      btn.type = "button"; // prevent default form behavior
      btn.textContent = c.name || c.email;
      btn.style.cursor = "pointer";
      btn.onclick = () => openModal(c.username, c.email);
      grid.appendChild(btn);
    });
  }

  // Save locally
  localStorage.setItem('studentCounselors', JSON.stringify(counselors));
}

// -------------------
// Submit Message
// -------------------
async function submitMessage() {
  const firstName = document.getElementById("firstName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const grade = document.getElementById("studentGrade")?.value.trim();
  const studentId = document.getElementById("studentId")?.value.trim();
  const notes = document.getElementById("extraNotes")?.value.trim();

  if (!firstName || !lastName || !grade || !studentId) {
    alert("Please fill in all required fields.");
    return;
  }

  // -------------------
  // Verify Student
  // -------------------
  try {
    const res = await fetch("/api/verifyStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, firstName, lastName, grade })
    });
    const verify = await res.json();
    if (!verify.valid) {
      alert("Student ID, name, or grade mismatch.");
      return;
    }
  } catch (err) {
    console.error(err);
    alert("Failed to verify student.");
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
    counselorEmail: selectedCounselorEmail,
    dateTime: new Date().toISOString()
  };

  // -------------------
  // Send to messages API
  // -------------------
  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    const data = await res.json();
    if (!data.success) throw new Error("Failed to submit message");
  } catch (err) {
    console.error(err);
    alert("Failed to send message.");
    return;
  }

  // Save locally
  const existing = JSON.parse(localStorage.getItem("studentMessages") || "[]");
  existing.push(entry);
  localStorage.setItem("studentMessages", JSON.stringify(existing));

  // -------------------
  // Reset form
  // -------------------
  closeModal();
  openSuccess();
  selectedReason = selectedUrgency = selectedCounselor = selectedCounselorEmail = "";
  ["firstName", "lastName", "studentGrade", "studentId", "extraNotes"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// -------------------
// INIT
// -------------------
window.onload = async () => {
  await populateStudentCounselorDropdown();
};
