function sendEmail(counselorEmail) {
  const name = document.getElementById("studentName").value.trim() || "Anonymous";
  const grade = document.getElementById("studentGrade").value.trim() || "N/A";
  const reason = selectedReason || "Not specified";
  const urgency = selectedUrgency || "Moderate";

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    name,
    grade,
    reason,
    urgency,
    counselor: counselorEmail,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Your message has been sent to the counselor dashboard.");
  goToPage("page1");
}



