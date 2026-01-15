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

// 🔹 SAVE DATA INSTEAD OF EMAIL
function sendEmail(counselorEmail) {
  const name = document.getElementById("studentName").value.trim() || "Anonymous";
  const grade = document.getElementById("studentGrade").value.trim() || "N/A";

  const request = {
    counselor: counselorEmail,
    name: name,
    grade: grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    time: new Date().toLocaleString()
  };

  let requests = JSON.parse(localStorage.getItem("requests") || "[]");
  requests.push(request);
  localStorage.setItem("requests", JSON.stringify(requests));

  alert("Your message has been sent to the counselor dashboard.");
  goToPage("page1"); // reset
}
