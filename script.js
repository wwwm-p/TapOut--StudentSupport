let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";

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
}

function openModal(email) {
  selectedCounselor = email.split("@")[0];
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

function submitMessage() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const grade = document.getElementById("studentGrade").value.trim();
  const notes = document.getElementById("extraNotes").value.trim();

  if (!firstName || !lastName || !grade) {
    alert("First name, last name, and grade are required.");
    return;
  }

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    firstName,
    lastName,
    grade,
    notes,
    reason: selectedReason,
    urgency: selectedUrgency,
    counselor: selectedCounselor,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));
  alert("Your message has been sent.");
  location.reload();
}
