let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";
let selectedCounselorEmail = "";

function goToPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
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

async function submitMessage() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const grade = document.getElementById("studentGrade").value.trim();
  const studentId = document.getElementById("studentId").value.trim();
  const notes = document.getElementById("extraNotes").value.trim();

  // Required fields validation
  if (!firstName || !lastName || !grade || !studentId) {
    alert("Please fill in all required fields.");
    return;
  }

  // ✅ Replace with SIS verification if needed
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

  // Build message payload
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
    dateTime: new Date().toISOString() // exact timestamp for SIS
  };

  // Send to SIS
  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    const data = await res.json();
    if (!data.success) throw new Error("Failed to submit message");

    // ✅ Optional: keep local copy for offline caching
    const existing = JSON.parse(localStorage.getItem("studentMessages") || "[]");
    existing.push(entry);
    localStorage.setItem("studentMessages", JSON.stringify(existing));

    closeModal();
    openSuccess();

    // Reset selections
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
    alert("Failed to send message. Check your network.");
  }
}
