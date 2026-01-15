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

  const mailtoLink = `mailto:${counselorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink; // Opens default mail app (Apple Mail / Gmail App / Outlook)
}
