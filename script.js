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
function chooseReason(reason) { selectedReason = reason; goToPage("page2"); }
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
// Populate Counselor Dropdown
// -------------------
async function populateStudentCounselorDropdown(){
  try {
    const res = await fetch('/api/counselors');
    const counselors = await res.json();
    const dropdown = document.getElementById('studentCounselorDropdown');
    dropdown.innerHTML = '';
    counselors.forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c.username; opt.textContent = c.name;
      dropdown.appendChild(opt);
    });
    // Save a persistent copy for admin merge
    localStorage.setItem('studentCounselors', JSON.stringify(counselors));
  } catch(err){ console.error(err); }
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

  try {
    const res = await fetch("/api/verifyStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, firstName, lastName })
    });
    const verify = await res.json();
    if (!verify.valid) { alert("Student ID not recognized."); return; }
  } catch (err) { console.error(err); alert("Failed to verify student ID."); return; }

  const entry = {
    firstName, lastName, grade, studentId, notes,
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

    closeModal(); openSuccess();

    selectedReason = ""; selectedUrgency = ""; selectedCounselor = ""; selectedCounselorEmail = "";
    ["firstName","lastName","studentGrade","studentId","extraNotes"].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value="";
    });
  } catch(err){ console.error(err); alert("Failed to send message."); }
}

// -------------------
// INIT
// -------------------
window.onload = async ()=>{
  await populateStudentCounselorDropdown();
};
