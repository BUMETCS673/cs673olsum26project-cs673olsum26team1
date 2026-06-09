import React from 'react';
import StatusBadge from './StatusBadge';

const FIELD_LABELS = {
  insurance: 'Insurance status',
  consult: 'Initial consultation',
  labs: 'Labs',
  psychologist: 'Psychologist visits',
  dietitian: 'Dietitian visits',
  endoscopy: 'Endoscopy',
  cardiology: 'Cardiology',
  sleep: 'Sleep study',
  barium: 'Barium swallow',
  hematology: 'Hematology',
  nephrology: 'Nephrology',
  colonoscopy: 'Colonoscopy',
};

const getChecklistSubtext = (field, status, insuranceStatus) => {
  if (field === 'insurance') {
    if (insuranceStatus === 'clear') return 'Verified by your coordinator';
    if (insuranceStatus === 'self pay') return 'You selected to pay out of pocket';
    if (insuranceStatus === 'in review') return 'Your insurance information is being reviewed';
    return 'Not yet started';
  }
  if (field === 'consult') {
    if (status === 'complete') return 'First appointment completed';
    if (status === 'ordered' || status === 'in progress') return "All set! We'll see you at your appointment";
    if (status === 'not required') return 'No consultation required';
    return 'Please schedule your initial consultation asap';
  }
  if (field === 'labs') {
    if (status === 'complete') return 'All lab results received';
    if (status === 'in progress') return "We're waiting for the remaining test results";
    if (status === 'ordered') return "All set! We'll see you at your lab tests";
    if (status === 'not required') return 'No lab work required';
    return 'Please schedule your lab tests asap';
  }
  
  if (status === 'complete') return 'Evaluation completed';
  if (status === 'in progress') return 'Sessions ongoing';
  if (status === 'ordered') return "All set! We'll see you at your appointment";
  if (status === 'not required') return 'Not required';
  return 'Please schedule your visit asap';
};

const getStatusIcon = (status) => {
  if (status === 'complete') {
    return (
      <svg className="flex-shrink-0 me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#E2F6EA"/>
        <path stroke="#1F9254" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12.5l2.5 2.5 5.5-5.5"/>
      </svg>
    );
  }
  if (status === 'in progress') {
    return (
      <svg className="flex-shrink-0 me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#FFF4E5"/>
        <path stroke="#B25E00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 2"/>
      </svg>
    );
  }
  if (status === 'ordered') {
    return (
      <svg className="flex-shrink-0 me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#E8F4FD"/>
        <path stroke="#0D6EFD" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h8m-8 3h5M8 7v2m8-2v2M7 8h10a1 1 0 011 1v7a1 1 0 01-1 1H7a1 1 0 01-1-1V9a1 1 0 011-1z"/>
      </svg>
    );
  }
  if (status === 'not required') {
    return (
      <svg className="flex-shrink-0 me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#F1F3F4"/>
        <path stroke="#5F6368" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h8"/>
      </svg>
    );
  }
  return (
    <svg className="flex-shrink-0 me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#FCE8E6"/>
      <path stroke="#C5221F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8l8 8m0-8l-8 8"/>
    </svg>
  );
};

const PatientChecklist = ({ checklist = [], insuranceStatus }) => {
  if (!checklist || checklist.length === 0) return null;

  return (
    <div className="card mb-4 shadow-sm bg-white">
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-4">
          <svg className="me-2 text-dark" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <h5 className="mb-0 fw-bold text-dark">My checklist</h5>
        </div>

        <div className="d-flex flex-column border-top">
          {checklist.map((item) => {
            const isInsurance = item.field === 'insurance';
            const displayStatus = isInsurance
              ? (insuranceStatus === 'clear' ? 'complete' : insuranceStatus === 'self pay' ? 'not required' : insuranceStatus === 'in review' ? 'in progress' : 'not complete')
              : item.status;
            const label = FIELD_LABELS[item.field] || item.field.charAt(0).toUpperCase() + item.field.slice(1);
            const subtext = getChecklistSubtext(item.field, displayStatus, insuranceStatus);
            
            return (
              <div key={item.field} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div className="d-flex align-items-center">
                  {getStatusIcon(displayStatus)}
                  <div>
                    <div className="fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>{label}</div>
                    <div className="text-muted small">{subtext}</div>
                  </div>
                </div>
                <div>
                  {item.field === 'insurance' ? (
                    <StatusBadge type="insurance" value={insuranceStatus} />
                  ) : (
                    <StatusBadge type="checklist" value={item.status} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientChecklist;
