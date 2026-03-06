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

  // Load counselors (API fallback)
  const loadCounselors = async () => {
    try {
      const res = await fetch("/api/counselors");
      const data = await res.json();
      if (data && data.length) setCounselors(data);
      else throw new Error("Empty API");
    } catch {
      // fallback hardcoded counselors (SIS-ready placeholders)
      setCounselors([
        { username: "counselor1", email: "counselor1@example.com" },
        { username: "counselor2", email: "counselor2@example.com" },
        { username: "counselor3", email: "counselor3@example.com" },
        { username: "counselor4", email: "counselor4@example.com" }
      ]);
    }
  };

  useEffect(() => {
    loadCounselors();
  }, []);

  // Page navigation
  const goToPage = (id) => setPage(id);

  // Reason / Urgency
  const chooseReason = (reason) => { setSelectedReason(reason); goToPage("page2"); };
  const chooseUrgency = (urgency) => {
    setSelectedUrgency(urgency);
    if (urgency === "I’m in Crisis") setShowCrisis(true);
    else goToPage("page3");
  };

  // Modal handling
  const openModal = (username, email) => {
    setSelectedCounselor(username);
    setSelectedCounselorEmail(email);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const closeCrisisModal = () => setShowCrisis(false);
  const continueFromCrisis = () => { setShowCrisis(false); goToPage("page3"); };
  const closeSuccess = () => { setShowSuccess(false); goToPage("page1"); };

  // Form handling
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const submitMessage = async () => {
    const { firstName, lastName, grade, studentId, notes } = formData;
    if (!firstName || !lastName || !grade || !studentId) {
      alert("Please fill in all required fields.");
      return;
    }

    // Verify student ID
    try {
      const res = await fetch("/api/verifyStudent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, firstName, lastName })
      });
      const verify = await res.json();
      if (!verify.valid) {
        alert("Student ID not recognized.");
        return;
      }
    } catch {
      alert("Failed to verify student ID.");
      return;
    }

    // Submit to Neon
    const entry = {
      firstName, lastName, grade, studentId, notes,
      reason: selectedReason,
      urgency: selectedUrgency,
      counselor: selectedCounselor,
      counselorEmail: selectedCounselorEmail,
      dateTime: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");

      // success
      setShowModal(false);
      setShowSuccess(true);
      setSelectedReason(""); setSelectedUrgency(""); setSelectedCounselor(""); setSelectedCounselorEmail("");
      setFormData({ firstName:"", lastName:"", grade:"", studentId:"", notes:"" });
    } catch {
      alert("Failed to send message.");
    }
  };

  return (
    <div className="student-page" style={{textAlign:"center", background:"#fffcf5"}}>
      {/* Page 1 */}
      {page==="page1" && (
        <div className="page active">
          <img src="/page1.png" alt="Welcome Page" />
          <div style={{marginTop:10}}>
            <button className="hotspot" onClick={()=>chooseReason("Academic stress or pressure")}>Academic</button>
            <button className="hotspot" onClick={()=>chooseReason("Anxiety or panic attacks")}>Anxiety</button>
            <button className="hotspot" onClick={()=>chooseReason("Depression or sadness")}>Depression</button>
            <button className="hotspot" onClick={()=>chooseReason("Family issues or home stress")}>Family</button>
            <button className="hotspot" onClick={()=>chooseReason("Relationship or friendship problems")}>Relationship</button>
            <button className="hotspot" onClick={()=>chooseReason("Bullying or harassment")}>Bullying</button>
            <button className="hotspot" onClick={()=>chooseReason("I just need someone to talk to")}>Talk</button>
            <button className="hotspot" onClick={()=>chooseReason("I’m not ready to say")}>Unsure</button>
          </div>
        </div>
      )}

      {/* Page 2 */}
      {page==="page2" && (
        <div className="page">
          <img src="/page2.png" alt="Urgency Page" />
          <div style={{marginTop:10}}>
            <button className="hotspot" onClick={()=>chooseUrgency("I’m Doing Fine – Just Curious")}>Fine</button>
            <button className="hotspot" onClick={()=>chooseUrgency("Feeling a Little Off")}>Little Off</button>
            <button className="hotspot" onClick={()=>chooseUrgency("I’m Not Coping Well")}>Not Coping</button>
            <button className="hotspot" onClick={()=>chooseUrgency("I’m in Crisis")}>Crisis</button>
            <button className="back-button" onClick={()=>goToPage("page1")}>Back</button>
          </div>
        </div>
      )}

      {/* Page 3 */}
      {page==="page3" && (
        <div className="page">
          <img src="/page3.png" alt="Counselor Page" />
          <div className="counselor-grid" style={{display:"flex", flexWrap:"wrap", justifyContent:"center", gap:10, marginTop:10}}>
            {counselors.map(c=>(
              <button key={c.username} onClick={()=>openModal(c.username,c.email)}>{c.email}</button>
            ))}
          </div>
          <button className="back-button" onClick={()=>goToPage("page2")}>Back</button>
        </div>
      )}

      {/* Crisis Modal */}
      {showCrisis && (
        <div className="modal-overlay" style={{display:"flex", position:"fixed", inset:0, justifyContent:"center", alignItems:"center", background:"rgba(15,23,42,0.55)"}}>
          <div className="modal" style={{background:"#fff", padding:26, borderRadius:18, width:360}}>
            <h2>Immediate Support</h2>
            <ul style={{listStyle:"none", padding:0}}>
              <li><strong>Emergency</strong> 911 – Emergency services.</li>
              <li><strong>Mental Health & Crisis Support</strong>
                <br/>988 Suicide & Crisis Lifeline – Call or text 988.
                <br/>Crisis Text Line – Text HOME to 741741.
              </li>
            </ul>
            <div style={{marginTop:12}}>
              <button onClick={closeCrisisModal}>Close</button>
              <button onClick={continueFromCrisis}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {showModal && (
        <div className="modal-overlay" style={{display:"flex", position:"fixed", inset:0, justifyContent:"center", alignItems:"center", background:"rgba(15,23,42,0.55)"}}>
          <div className="modal" style={{background:"#fff", padding:26, borderRadius:18, width:360}}>
            <h2>Submit Message</h2>
            <input id="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
            <input id="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
            <input id="grade" placeholder="Grade" value={formData.grade} onChange={handleChange} />
            <input id="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} />
            <textarea id="notes" placeholder="Additional notes" value={formData.notes} onChange={handleChange}></textarea>
            <div style={{marginTop:12}}>
              <button onClick={closeModal}>Cancel</button>
              <button onClick={submitMessage}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay" style={{display:"flex", position:"fixed", inset:0, justifyContent:"center", alignItems:"center", background:"rgba(15,23,42,0.55)"}}>
          <div className="modal" style={{background:"#fff", padding:26, borderRadius:18, width:320, textAlign:"center"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:"#16a34a",color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px auto"}}>✓</div>
            <div>Message sent!</div>
            <button style={{marginTop:10}} onClick={closeSuccess}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
