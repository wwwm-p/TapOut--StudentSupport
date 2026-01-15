let selectedReason = "";
let selectedUrgency = "";

// ----------------------
// PAGE NAVIGATION
// ----------------------
function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

function chooseReason(reason) {
  selectedReason = reason;
  goToPage("page2");
  updatePreview();
}

function chooseUrgency(level) {
  selectedUrgency = level;
  goToPage("page3");
  updatePreview();
}

// ----------------------
// FIREBASE CONFIG
// ----------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ----------------------
// UPDATE MESSAGE PREVIEW
// ----------------------
function updatePreview() {
  const name = document.getElementById("studentName")?.value || "[Your Name]";
  const grade = document.getElementById("studentGrade")?.value || "[Your Grade]";
  const reason = selectedReason || "No reason selected";
  const urgency = selectedUrgency || "No urgency selected";

  const previewText = `Hello,

I would like to reach out for support.

Reason: ${reason}
Urgency: ${urgency}

Thank you,
${name}, ${grade}`;

  document.getElementById("previewText").textContent = previewText;
}

// Add input listeners to live-update preview
document.getElementById("studentName")?.addEventListener("input", updatePreview);
document.getElementById("studentGrade")?.addEventListener("input", updatePreview);

// ----------------------
// SUBMIT REQUEST TO FIRESTORE
// ----------------------
function sendRequest(counselorEmail) {
  const name = document.getElementById("studentName").value.trim() || "[Your Name]";
  const grade = document.getElementById("studentGrade").value.trim() || "[Your Grade]";
  const reason = selectedReason || "No reason selected";
  const urgency = selectedUrgency || "Moderate";

  if (!name || !grade) {
    alert("Please enter your name and grade.");
    return;
  }

  db.collection("requests").add({
    student: name,
    grade: grade,
    reason: reason,
    urgency: urgency,
    counselor: counselorEmail,
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Your request has been sent!");
    resetForm();
  })
  .catch(err => {
    console.error("Error submitting request:", err);
    alert("Failed to submit request. Try again.");
  });
}

// ----------------------
// RESET FORM
// ----------------------
function resetForm() {
  selectedReason = "";
  selectedUrgency = "";
  document.getElementById("studentName").value = "";
  document.getElementById("studentGrade").value = "";
  document.getElementById("previewText").textContent = "Select a counselor to see your message here.";
  goToPage("page1");
}

