function sendMessage(reason, urgency, counselor) {
  const message = {
    reason,
    urgency,
    counselor,
    message: `Student needs help with: ${reason}`
  };

  const messages = JSON.parse(localStorage.getItem("studentMessages")) || [];
  messages.push(message);
  localStorage.setItem("studentMessages", JSON.stringify(messages));

  alert("Message sent to counselor dashboard!");
}
