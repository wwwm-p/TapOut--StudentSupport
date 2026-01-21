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

function previewMessage(counselor) {
  const name = studentName.value || "Student";
  const grade = studentGrade.value || "N/A";

  const message = `
Student: ${name}
Grade: ${grade}
Reason: ${selectedReason}
Urgency: ${selectedUrgency}
  `;

  if (confirm("Preview Message:\n\n" + message)) {
    sendRequest(counselor, message, name, grade);
  }
}

function sendRequest(counselor, message, name, grade) {
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  requests.push({
    counselor,
    student: name,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    message,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("requests", JSON.stringify(requests));
  alert("Request sent!");
  goToPage("page1");
}





