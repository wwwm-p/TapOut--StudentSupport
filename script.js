let selectedReason = "";
let selectedUrgency = "";

function goToPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function chooseReason(reason) {
  selectedReason = reason;
  goToPage("page2");
}

function chooseUrgency(level) {
  selectedUrgency = level;
  goToPage("page3");
}

function previewMessage(counselorEmail) {
  const name = studentName.value || "Student";
  const grade = studentGrade.value || "N/A";

  const message = `
Student: ${name}
Grade: ${grade}
Reason: ${selectedReason}
Urgency: ${selectedUrgency}
  `;

  if (confirm("Preview Message:\n\n" + message)) {
    sendToDashboard(counselorEmail, message, name, grade);
  }
}

function sendToDashboard(email, message, name, grade) {
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  requests.push({
    counselor: email,
    student: name,
    grade: grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    message: message,
    time: new Date().toISOString()
  });

  localStorage.setItem("requests", JSON.stringify(requests));
  alert("Message sent!");
  location.reload();
}




