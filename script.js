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

function chooseUrgency(urgency) {
  selectedUrgency = urgency;
  goToPage("page3");
  updatePreview();
}

function updatePreview() {
  const name = studentName.value || "[Name]";
  const grade = studentGrade.value || "[Grade]";

  previewText.textContent = 
`Hello,

I would like to reach out for support.

Reason: ${selectedReason}
Urgency: ${selectedUrgency}

Thank you,
${name}, ${grade}`;
}

studentName?.addEventListener("input", updatePreview);
studentGrade?.addEventListener("input", updatePreview);

function sendRequest(counselor) {
  if (!studentName.value || !studentGrade.value) {
    alert("Enter your name and grade.");
    return;
  }

  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  requests.push({
    counselor,
    name: studentName.value,
    grade: studentGrade.value,
    reason: selectedReason,
    urgency: selectedUrgency,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("requests", JSON.stringify(requests));

  alert("Request sent!");
  goToPage("page1");
}
