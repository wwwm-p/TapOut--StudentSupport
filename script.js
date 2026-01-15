// ===============================
// STATE VARIABLES
// ===============================
let selectedReason = "";
let selectedUrgency = "";

// ===============================
// PAGE NAVIGATION
// ===============================
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

// ===============================
// FIREBASE CONFIGURATION
// ===============================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
// SUBMIT REQUEST TO FIRESTORE
// ===============================
function sendRequest(counselorEmail) {
  const name = document.getElementById("studentName").value.trim() || "[Your Name]";
  const grade = document.getElementById("studentGrade").value.trim() || "[Your Grade]";
  const reason = selectedReason || "I need support.";
  const urgency = selectedUrgency || "Moderate";

  if (!name || !grade) {
    alert("Please enter your name and grade.");
    return;
  }

  // Add request to Firestore
  db.collection("requests").add({
    student: name,
    grade: grade,
    reason: reason,
    urgency: urgency,
    counselor: counselorEmail,
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Your request has been sent to your counselor!");
    resetForm();
  })
  .catch(err => {
    console.error("Error submitting request:", err);
    alert("Failed to submit request. Please try again.");
  });
}

// Replace old sendEmail function to keep buttons functional
function sendEmail(counselorEmail) {
  sendRequest(counselorEmail);
}

// ===============================
// RESET FORM AFTER SUBMISSION
// ===============================
function resetForm() {
  selectedReason = "";
  selectedUrgency = "";
  document.getElementById("studentName").value = "";
  document.getElementById("studentGrade").value = "";
  goToPage("page1");
}
