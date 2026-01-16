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
  const name = document.getElementById("studentName").value.trim() || "Anonymous";
  const grade = document.getElementById("studentGrade").value.trim() || "N/A";

  const request = {
    counselor: counselorEmail,
    name,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    time: new Date().toLocaleString()
  };

  let requests = JSON.parse(localStorage.getItem("requests") || "[]");
  requests.push(request);
  localStorage.setItem("requests", JSON.stringify(requests));

  alert("Message sent to counselor.");
  goToPage("page1");
}
