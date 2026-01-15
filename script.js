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
  updatePreview();
}

function updatePreview() {
  const box = document.getElementById("previewBox");
  box.innerHTML = `
    <strong>Preview:</strong><br>
    Reason: ${selectedReason}<br>
    Urgency: ${selectedUrgency}
  `;
}

function sendRequest(counselorEmail) {
  const name = studentName.value.trim();
  const grade = studentGrade.value.trim();

  if (!name || !grade) {
    alert("Enter name and grade");
    return;
  }

  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  requests.push({
    counselor: counselorEmail,
    name,
    grade,
    reason: selectedReason,
    urgency: selectedUrgency,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("requests", JSON.stringify(requests));

  alert("Message sent to counselor!");
  goToPage("page1");
}
