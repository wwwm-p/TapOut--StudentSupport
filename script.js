function sendMessage(reason, urgency, counselor) {
  const name = document.getElementById("studentName").value || "Anonymous";
  const grade = document.getElementById("studentGrade").value || "N/A";

  // Normalize counselor ID (username only)
  const counselorId = counselor.trim();

  const messages = JSON.parse(localStorage.getItem("studentMessages") || "[]");

  messages.push({
    name,
    grade,
    reason,
    urgency: urgency.trim(),
    counselor: counselorId,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Message sent to counselor dashboard!");
}

