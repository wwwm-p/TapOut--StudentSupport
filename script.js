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

function chooseUrgency(level) {
  selectedUrgency = level;
  goToPage("page3");
}

function sendEmail(counselorEmail) {
  const name = studentName.value || "Anonymous";
  const grade = studentGrade.value || "N/A";

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    name,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: counselorEmail.split("@")[0],
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Message sent to counselor dashboard!");
}
