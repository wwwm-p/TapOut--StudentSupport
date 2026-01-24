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
  const name = document.getElementById("studentName").value || "Anonymous";
  const grade = document.getElementById("studentGrade").value || "N/A";

  // ✅ Convert email → counselor username
  const counselorUsername = counselorEmail.split("@")[0];

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    name,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: counselorUsername,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Your message has been sent.");
  location.reload();
}
