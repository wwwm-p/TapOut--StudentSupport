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
  document.getElementById("crisisOverlay").style.display = "flex";
}

function closeCrisisModal() {
  document.getElementById("crisisOverlay").style.display = "none";
}

function continueFromCrisis() {
  closeCrisisModal();
  goToPage("page3");
}

function openModal(username, email) {
  selectedCounselor = username;
  selectedCounselorEmail = email;

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

// ==============================
// SUBMIT MESSAGE
// ==============================
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

  // ==============================
  // SIS VERIFICATION
  // ==============================
  try {

    const res = await fetch("/api/verifyStudent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        studentId,
        firstName,
        lastName,
        grade
      })
    });

    const verify = await res.json();

    if (!verify.valid) {
      alert("Student ID, name, or grade mismatch.");
      return;
    }

  } catch (err) {

    console.error(err);
    alert("Failed to verify student ID.");
    return;

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

    // ==============================
    // SAVE TO LOCAL STORAGE
    // (Counselor dashboard reads this)
    // ==============================
    const existing = JSON.parse(localStorage.getItem("studentMessages") || "[]");
    existing.push(entry);
    localStorage.setItem("studentMessages", JSON.stringify(existing));


    // ==============================
    // SEND CRISIS MESSAGES TO ADMIN
    // ==============================
    if (selectedUrgency === "I’m in Crisis") {

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(entry)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Failed to submit crisis message");
      }

    }

    // ==============================
    // SUCCESS UI
    // ==============================
    closeModal();
    openSuccess();

    // ==============================
    // RESET STATE
    // ==============================
    selectedReason = "";
    selectedUrgency = "";
    selectedCounselor = "";
    selectedCounselorEmail = "";

    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("studentGrade").value = "";
    document.getElementById("studentId").value = "";
    document.getElementById("extraNotes").value = "";

  } catch (err) {

    console.error(err);
    alert("Failed to send message.");

  }

}

// ==============================
// INIT
// ==============================
window.onload = () => {

  console.log("Student support system loaded.");

};
