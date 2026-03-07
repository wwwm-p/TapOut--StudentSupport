// components/StudentPage.jsx
import { useState, useEffect } from "react";

export default function StudentPage() {
  const [page, setPage] = useState("page1");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [selectedCounselorEmail, setSelectedCounselorEmail] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    grade: "",
    studentId: "",
    notes: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [counselors, setCounselors] = useState([]);

  // -----------------------------
  // Load counselors dynamically
  // -----------------------------
  const loadCounselors = async () => {
    try {
      const res = await fetch("/api/counselors");
      const data = await res.json();
      if (data && data.length) setCounselors(data.filter(c => c.active));
    } catch {
      setCounselors([
        { username: "counselor1", email: "counselor1@example.com" },
        { username: "counselor2", email: "counselor2@example.com" }
      ]);
    }
  };

  useEffect(() => {
    loadCounselors();
  }, []);

  // -----------------------------
  // Navigation
  // -----------------------------
  const goToPage = (id) => setPage(id);
  const chooseReason = (reason) => { setSelectedReason(reason); goToPage("page2"); };
  const chooseUrgency = (urgency) => {
    setSelectedUrgency(urgency);
    if (urgency === "I’m in Crisis") setShowCrisis(true);
    else goToPage("page3");
  };

  // -----------------------------
  // Modal handling
  // -----------------------------
  const openModal = (username, email) => {
    setSelectedCounselor(username);
    setSelectedCounselorEmail(email);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const closeCrisisModal = () => setShowCrisis(false);
  const continueFromCrisis = () => { setShowCrisis(false); goToPage("page3"); };
  const closeSuccess = () => { setShowSuccess(false); goToPage("page1"); };

  // -----------------------------
  // Form handling
  // -----------------------------
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const submitMessage = async () => {
    const { firstName, lastName, grade, studentId, notes } = formData;
    if (!firstName || !lastName || !grade || !studentId) return alert("Please fill in all required fields.");

    // Verify student via SIS API
    try {
      const res = await fetch("/api/verifyStudent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, firstName, lastName, grade })
      });
      const verify = await res.json();
      if (!verify.valid) return alert("Student ID, name, or grade does not match SIS records.");
    } catch {
      return alert("Failed to verify student ID.");
    }

    const entry = {
      firstName, lastName, grade, studentId, notes,
      reason: selectedReason,
      urgency: selectedUrgency,
      counselor: selectedCounselor,
      counselorEmail: selectedCounselorEmail,
      dateTime: new Date().toISOString()
    };

    try {
      if (selectedUrgency === "I’m in Crisis") {
        // Crisis messages go to admin
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry)
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to send crisis message");
      } else {
        // Non-crisis: local confirmation
        console.log("Non-crisis message (local):", entry);
      }

      // Reset
      setShowModal(false);
      setShowSuccess(true);
      setSelectedReason("");
      setSelectedUrgency("");
      setSelectedCounselor("");
      setSelectedCounselorEmail("");
      setFormData({ firstName: "", lastName: "", grade: "", studentId: "", notes: "" });

    } catch (err) {
      console.error(err);
      alert("Failed to submit message.");
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="student-page" style={{ textAlign:"center", background:"#fffcf5" }}>

      {/* Page 1 */}
      {page === "page1" && (
        <div className="page active">
          <img src="/page1.png" alt="Welcome Page" />
          <div style={{ marginTop: 10 }}>
            {[
              ["Academic stress or pressure","Academic"],
              ["Anxiety or panic attacks","Anxiety"],
              ["Depression or sadness","Depression"],
              ["Family issues or home stress","Family"],
              ["Relationship or friendship problems","Relationship"],
              ["Bullying or harassment","Bullying"],
              ["I just need someone to talk to","Talk"],
              ["I’m not ready to say","Unsure"]
            ].map(([reason,label])=>(
              <button key={label} className="hotspot" onClick={()=>chooseReason(reason)}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Page 2 */}
      {page === "page2" && (
        <div className="page">
          <img src="/page2.png" alt="Urgency Page" />
          <div style={{ marginTop: 10 }}>
            {[
              ["I’m Doing Fine – Just Curious","Fine"],
              ["Feeling a Little Off","Little Off"],
              ["I’m Not Coping Well","Not Coping"],
              ["I’m in Crisis","Crisis"]
            ].map(([urgency,label])=>(
              <button key={label} className="hotspot" onClick={()=>chooseUrgency(urgency)}>{label}</button>
            ))}
            <button className="back-button" onClick={()=>goToPage("page1")}>Back</button>
          </div>
        </div>
      )}

      {/* Page 3 */}
      {page === "page3" && (
        <div className="page">
          <img src="/page3.png" alt="Counselor Page" />
          <div className="counselor-grid" style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:10, marginTop:10 }}>
            {counselors.map(c => (
              <button key={c.username} onClick={()=>openModal(c.username, c.email)}>{c.email}</button>
            ))}
          </div>
          <button className="back-button" onClick={()=>goToPage("page2")}>Back</button>
        </div>
      )}

      {/* Crisis Modal */}
      {showCrisis && (
        <div className="modal-overlay" style={{ display:"flex" }}>
          <div className="modal">
            <h2>Immediate Support</h2>
            <ul style={{ listStyle:"none", padding:0 }}>
              <li><strong>Emergency</strong> 911 – Emergency services.</li>
              <li><strong>Mental Health & Crisis Support</strong><br/>
                  988 Suicide & Crisis Lifeline – Call/text 988.<br/>
                  Crisis Text Line – Text HOME to 741741.
              </li>
            </ul>
            <div style={{ marginTop: 12 }}>
              <button onClick={closeCrisisModal}>Close</button>
              <button onClick={continueFromCrisis}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ display:"flex" }}>
          <div className="modal">
            <h2>Submit Message</h2>
            {["firstName","lastName","grade","studentId","notes"].map(field=>(
              field==="notes" ? (
                <textarea key={field} id={field} placeholder="Additional notes" value={formData.notes} onChange={handleChange}></textarea>
              ) : (
                <input key={field} id={field} placeholder={field} value={formData[field]} onChange={handleChange} />
              )
            ))}
            <div style={{ marginTop:12 }}>
              <button onClick={closeModal}>Cancel</button>
              <button onClick={submitMessage}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay" style={{ display:"flex" }}>
          <div className="modal" style={{ textAlign:"center" }}>
            <div style={{ width:56,height:56,borderRadius:"50%",background:"#16a34a", color:"#fff", display:"flex", justifyContent:"center", alignItems:"center", margin:"0 auto 10px auto"}}>✓</div>
            <div>Message sent!</div>
            <button style={{ marginTop:10 }} onClick={closeSuccess}>OK</button>
          </div>
        </div>
      )}

    </div>
  );
}
