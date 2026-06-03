// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~40%
// AI-Assisted Areas: polling logic, useEffect cleanup, notification rendering, token retrieval
// Human Contributions: integration with AuthContext, route decisions, testing
// Notes: polling every 30s per BARI-23 acceptance criteria. Token fetched via Firebase getIdToken.

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { apiRequest } from '../utils/api';
import StatusBadge from '../components/StatusBadge';

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
  
  // Default mapping for other clinical items (psychologist, dietitian, endoscopy, cardiology, etc.)
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
  // Default: not complete
  return (
    <svg className="flex-shrink-0 me-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#FCE8E6"/>
      <path stroke="#C5221F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8l8 8m0-8l-8 8"/>
    </svg>
  );
};

function PatientPortal() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const patientId = user?.patientId || user?.id;

  const fetchNotifications = useCallback(async () => {
    if (!patientId) return;
    try {
      const data = await apiRequest(`/notifications/${patientId}`);
      setNotifications(data);
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  }, [patientId]);

  const fetchPatientData = useCallback(async () => {
    if (!patientId) return;
    try {
      const data = await apiRequest(`/patients/${patientId}`);
      setPatientData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const markAsRead = async (notificationId) => {
    try {
      await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPatientData();
    fetchNotifications();
  }, [fetchPatientData, fetchNotifications]);

  // Poll every 30 seconds per BARI-213 and BARI-18 acceptance criteria
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchPatientData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchPatientData]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <>
      <Navbar />
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container mt-4 text-start">
        <h2>Welcome back, {user?.name ? user.name.split(' ')[0] : ''}</h2>
        <p className="text-muted fs-5">
          Your appointment checklist for {patientData?.assignedSpecialist || 'Not assigned yet'}
        </p>

        {error && (
          <div className="alert alert-warning" role="alert">{error}</div>
        )}

        {/* Progress Bar Section */}
        {patientData && patientData.progress && (
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              {/* Top labels */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Your overall preparation progress</span>
                <span className="fw-semibold text-primary">
                  {patientData.progress.completed}/{patientData.progress.total} (
                  {patientData.progress.total > 0
                    ? Math.round((patientData.progress.completed / patientData.progress.total) * 100)
                    : 0}
                  %)
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="progress" style={{ height: '14px' }}>
                <div
                  className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{
                    width: `${
                      patientData.progress.total > 0
                        ? (patientData.progress.completed / patientData.progress.total) * 100
                        : 0
                    }%`,
                  }}
                  aria-valuenow={patientData.progress.completed}
                  aria-valuemin="0"
                  aria-valuemax={patientData.progress.total}
                />
              </div>

              {/* Bottom labels */}
              <div className="d-flex justify-content-between align-items-center mt-2 small text-muted">
                <span>{patientData.progress.completed} items complete</span>
                <span>{patientData.progress.total - patientData.progress.completed} items remaining</span>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Section */}
        {patientData && patientData.checklist && patientData.checklist.length > 0 && (
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
                {patientData.checklist.map((item) => {
                  const isInsurance = item.field === 'insurance';
                  const insuranceStatus = patientData.insuranceStatus;
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
                          <StatusBadge type="insurance" value={patientData.insuranceStatus} />
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
        )}

        {/* Notifications Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong className="mb-0">Notifications</strong>
            {unreadCount > 0 && (
              <span className="badge bg-danger rounded-pill">{unreadCount} new</span>
            )}
          </div>
          <ul className="list-group list-group-flush">
            {notifications.length === 0 ? (
              <li className="list-group-item text-muted">No notifications yet.</li>
            ) : (
              notifications.map(n => (
                <li
                  key={n.id}
                  className={`list-group-item d-flex justify-content-between align-items-start ${
                    !n.isRead ? 'list-group-item-warning' : ''
                  }`}
                >
                  <div>
                    <p className="mb-1">{n.message}</p>
                    <small className="text-muted">
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {!n.isRead && (
                    <button
                      className="btn btn-sm btn-outline-secondary ms-3 flex-shrink-0"
                      onClick={() => markAsRead(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Need Help Section */}
        {patientData && (
          <div className="card shadow-sm mb-4 bg-white">
            <div className="card-body p-4 text-start">
              <h5 className="fw-bold text-dark mb-3">Need help?</h5>
              <p className="text-muted mb-3" style={{ fontSize: '1.02rem', lineHeight: '1.5' }}>
                Your coordinator will contact you to schedule your next steps. If you have questions contact your program coordinator.
              </p>
              <div className="d-flex align-items-center text-dark fw-semibold">
                <svg className="me-2 text-secondary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>
                  {patientData.assignedCoordinator
                    ? `Assigned coordinator: ${patientData.assignedCoordinator}`
                    : 'No coordinator is assigned.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PatientPortal;