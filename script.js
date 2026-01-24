let selectedReason = "";
let selectedUrgency = "";

function chooseReason(reason) {
  selectedReason = reason;
  goToPage("page2");
}

function chooseUrgency(urgency) {
  selectedUrgency = urgency;
  goToPage("page3");
}

function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");
}

function sendEmail(counselorEmail) {
  const name = document.getElementById("studentName").value || "Anonymous";
  const grade = document.getElementById("studentGrade").value || "N/A";

  // Extract username from email
  const counselorUsername = counselorEmail.split("@")[0];

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    name,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: counselorUsername, // ✅ THIS FIXES THE DASHBOARD
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Message sent successfully!");
  location.reload();
}


