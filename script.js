let selectedReason = "";
let selectedUrgency = "";

function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

function chooseReason(reason) {
  selectedReason = reason;
  goToPage("page2");
}

function chooseUrgency(urgency) {
  selectedUrgency = urgency;
  goToPage("page3");
}

function sendEmail(counselorEmail) {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const grade = document.getElementById("studentGrade").value.trim();

  // 🔒 REQUIRED FIELD VALIDATION
  if (!firstName || !lastName || !grade) {
    alert("First name, last name, and grade are required before submitting.");
    return;
  }

  if (!selectedReason || !selectedUrgency) {
    alert("Please complete all steps before submitting.");
    return;
  }

  // Convert email → counselor username (matches dashboard logic)
  const counselorUsername = counselorEmail.split("@")[0];

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    firstName,
    lastName,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: counselorUsername,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Your message has been sent to the counselor.");

  location.reload();
}
