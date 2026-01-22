let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";

function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// BUTTON: reason
function chooseReason(reason) {
  selectedReason = reason;
  goToPage("page2");
}

// BUTTON: urgency
function chooseUrgency(urgency) {
  selectedUrgency = urgency;
  goToPage("page3");
}

// BUTTON: counselor
function chooseCounselor(counselorUsername) {
  selectedCounselor = counselorUsername;
  goToPage("page4");
}

// FINAL SEND BUTTON
function sendEmail() {
  const name = document.getElementById("studentName").value || "Anonymous";
  const grade = document.getElementById("studentGrade").value || "N/A";

  if (!selectedReason || !selectedUrgency || !selectedCounselor) {
    alert("Missing information.");
    return;
  }

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    name,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: selectedCounselor, // MUST MATCH LOGIN USERNAME
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Message sent successfully.");
  location.reload();
}


