import { useState, useEffect } from "react";

export default function StudentPage() {
  const [page,setPage]=useState("page1");
  const [selectedReason,setSelectedReason]=useState("");
  const [selectedUrgency,setSelectedUrgency]=useState("");
  const [selectedCounselor,setSelectedCounselor]=useState("");
  const [selectedCounselorEmail,setSelectedCounselorEmail]=useState("");
  const [formData,setFormData]=useState({ firstName:"", lastName:"", grade:"", studentId:"", notes:"" });
  const [showModal,setShowModal]=useState(false);
  const [showCrisis,setShowCrisis]=useState(false);
  const [showSuccess,setShowSuccess]=useState(false);
  const [counselors,setCounselors]=useState([]);

  useEffect(()=>{
    // example counselors, could fetch from admin API
    setCounselors([
      {username:"counselor1", email:"counselor1@example.com"},
      {username:"counselor2", email:"counselor2@example.com"},
      {username:"counselor3", email:"counselor3@example.com"}
    ]);
  },[]);

  const goToPage=id=>setPage(id);

  const chooseReason=reason=>{ setSelectedReason(reason); goToPage("page2"); };
  const chooseUrgency=urgency=>{ setSelectedUrgency(urgency); if(urgency==="In Crisis") setShowCrisis(true); else goToPage("page3"); };

  const openModal=(username,email)=>{ setSelectedCounselor(username); setSelectedCounselorEmail(email); setShowModal(true); };
  const closeModal=()=>setShowModal(false);
  const closeCrisisModal=()=>setShowCrisis(false);
  const continueFromCrisis=()=>{ setShowCrisis(false); goToPage("page3"); };
  const closeSuccess=()=>{ setShowSuccess(false); goToPage("page1"); };

  const handleChange=e=>setFormData(prev=>({...prev,[e.target.id]:e.target.value}));

  const submitMessage=async()=>{
    const { firstName,lastName,grade,studentId,notes }=formData;
    if(!firstName||!lastName||!grade||!studentId){ alert("Please fill all required fields."); return; }

    const entry={ firstName,lastName,grade,studentId,notes,reason:selectedReason,urgency:selectedUrgency,counselor:selectedCounselor,counselorEmail:selectedCounselorEmail,dateTime:new Date().toISOString() };
    console.log("Message ready for Neon API:", entry);

    setShowModal(false);
    setShowSuccess(true);
    setSelectedReason(""); setSelectedUrgency(""); setSelectedCounselor(""); setSelectedCounselorEmail("");
    setFormData({ firstName:"", lastName:"", grade:"", studentId:"", notes:"" });
  };

  return (
    <div className="student-page">
      {page==="page1" && <div className="page active">
        <h2>Why are you reaching out today?</h2>
        <button onClick={()=>chooseReason("Academic stress")}>Academic</button>
        <button onClick={()=>chooseReason("Anxiety or panic")}>Anxiety</button>
        <button onClick={()=>chooseReason("Depression or sadness")}>Depression</button>
        <button onClick={()=>chooseReason("Family issues")}>Family</button>
        <button onClick={()=>chooseReason("Relationship/friendship")}>Relationship</button>
        <button onClick={()=>chooseReason("Bullying/harassment")}>Bullying</button>
        <button onClick={()=>chooseReason("Just need someone to talk")}>Talk</button>
        <button onClick={()=>chooseReason("Not ready to say")}>Unsure</button>
      </div>}

      {page==="page2" && <div className="page">
        <h2>How urgent is this?</h2>
        <button onClick={()=>chooseUrgency("Just Curious")}>Just Curious</button>
        <button onClick={()=>chooseUrgency("Feeling a Little Off")}>Little Off</button>
        <button onClick={()=>chooseUrgency("Not Coping Well")}>Not Coping</button>
        <button onClick={()=>chooseUrgency("In Crisis")}>Crisis</button>
        <button onClick={()=>goToPage("page1")}>Back</button>
      </div>}

      {page==="page3" && <div className="page">
        <h2>Select a counselor</h2>
        <div className="counselor-grid">
          {counselors.map(c=> <button key={c.username} onClick={()=>openModal(c.username,c.email)}>{c.email}</button>)}
        </div>
        <button onClick={()=>goToPage("page2")}>Back</button>
      </div>}

      {showCrisis && <div className="modal-overlay" style={{display:"flex"}}>
        <div className="modal crisis-modal">
          <h2>Immediate Support</h2>
          <ul>
            <li><strong>Emergency:</strong> 911</li>
            <li><strong>Mental Health:</strong> 988 Suicide & Crisis Lifeline; 741741 Crisis Text Line</li>
          </ul>
          <button onClick={closeCrisisModal}>Close</button>
          <button onClick={continueFromCrisis}>Continue</button>
        </div>
      </div>}

      {showModal && <div className="modal-overlay" style={{display:"flex"}}>
        <div className="modal">
          <h2>Submit Message</h2>
          <input id="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange}/>
          <input id="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange}/>
          <input id="grade" placeholder="Grade" value={formData.grade} onChange={handleChange}/>
          <input id="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange}/>
          <textarea id="notes" placeholder="Additional notes" value={formData.notes} onChange={handleChange}/>
          <button onClick={closeModal}>Cancel</button>
          <button onClick={submitMessage}>Submit</button>
        </div>
      </div>}

      {showSuccess && <div className="modal-overlay" style={{display:"flex"}}>
        <div className="modal success-modal">
          <div className="success-icon">✓</div>
          <div className="success-text">Message sent!</div>
          <button onClick={closeSuccess}>OK</button>
        </div>
      </div>}
    </div>
  );
}
