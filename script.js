let selectedReason = "";
let selectedUrgency = "";
let selectedCounselor = "";

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

function openEmailOptions(email) {
  selectedCounselor = email;
  document.getElementById("emailModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("emailModal").style.display = "none";
}

function getEmailData() {
  const name = document.getElementById("studentName").value.trim() || "[Your Name]";
  const grade = document.getElementById("studentGrade").value.trim() || "[Your Grade]";
  const reason = selectedReason || "I need academic or personal support.";
  const urgency = selectedUrgency || "Moderate";

  const subject = "Support Request from Student";
  const body = `Hello,

I would like to reach out for support.

Reason: ${reason}
Urgency: ${urgency}

Thank you,
${name}, ${grade}`;

  return { subject, body };
}

function sendWithDefaultMail() {
  const { subject, body } = getEmailData();
  const link = `mailto:${selectedCounselor}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = link;
}

function sendWithGmail() {
  const { subject, body } = getEmailData();
  const link = `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedCounselor}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(link, "_blank");
}

function sendWithYahoo() {
  const { subject, body } = getEmailData();
  const link = `https://compose.mail.yahoo.com/?to=${selectedCounselor}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(link, "_blank");
}

