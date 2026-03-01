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

  // Load counselors dynamically when Page 3 opens
  if (id === "page3") loadCounselors();
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
function openCrisisModal() { document.getElementById("crisisOverlay").style.display = "flex"; }
function closeCrisisModal() { document.getElementById("crisisOverlay").style.display = "none"; }
function continueFromCrisis() { closeCrisisModal(); goToPage("page3"); }

function openModal(counselorUsername, counselorEmail) {
  selectedCounselor = counselorUsername;
  selectedCounselorEmail = counselorEmail;
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() { document.getElementById("modalOverlay").style.display = "none"; }

function openSuccess() { document.getElementById("successOverlay").style.display = "flex"; }
function closeSuccess() { document.getElementById("successOverlay").style.display = "none"; goToPage("page1"); }

// -------------------
// Load Counselors (dynamic fallback)
// -------------------
async function loadCounselors() {
  const grid = document.getElementById("counselorGrid");
  if (!grid) return; // Safety check
  grid.innerHTML = "";

  let counselors = [];
  
  try {
    const res = await fetch("/api/counselors");
    counselors = await res.json();
  } catch (err) {
    console.warn("API not available, using fallback counselors");
  }

  if (!counselors || counselors.length === 0) {
    counselors = [
      { username: "miap2k10", email: "miap2k10@gmail.com" },
      { username: "kmcconnell", email: "kmcconnell@smpanthers.org" },
      { username: "gsorbi", email: "gsorbi@smpanthers.org" },
      { username: "apanlilio", email: "apanlilio@smpanthers.org" },
      { username: "aturner", email: "aturner@smpanthers.org" },
      { username: "cfilson", email: "cfilson@smpanthers.org" }
    ];
  }

  counselors.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.email; // can switch to c.name if preferred
    btn.onclick = () => openModal(c.username, c.email);
    grid.appendChild(btn);
  });
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
  // Verify student via API
  // -------------------
  try {
    const res = await fetch("/api/verifyStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, firstName, lastName })
    });
    const verify = await res.json();
    if (!verify.valid) {
      alert("Student ID not recognized.");
      return;
    }
  } catch (err) {
    console.error(err);
    alert("Failed to verify student ID.");
    return;
  }

  // -------------------
  // Submit to Neon via API
  // -------------------
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

    closeModal();
    openSuccess();

    // Clear form fields & state
    selectedReason = "";
    selectedUrgency = "";
    selectedCounselor = "";
    selectedCounselorEmail = "";
    ["firstName","lastName","studentGrade","studentId","extraNotes"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  } catch (err) {
    console.error(err);
    alert("Failed to send message.");
  }
}

// -------------------
// INIT
// -------------------
window.onload = () => {
  loadCounselors(); // Load buttons on page load
};
