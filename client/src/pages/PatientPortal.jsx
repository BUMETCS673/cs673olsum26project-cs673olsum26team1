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

  // Poll every 30 seconds per BARI-213 acceptance criteria
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
      <div className="container mt-4">
        <h2>Patient Portal</h2>
        <p className="text-muted">Welcome, {user?.name}.</p>

        {error && (
          <div className="alert alert-warning" role="alert">{error}</div>
        )}

        {/* Patient Status Card */}
        {patientData && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Your Status</h5>
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Insurance:</strong>{' '}
                    <span className={`badge ${
                      patientData.insuranceStatus === 'clear' ? 'bg-success' :
                      patientData.insuranceStatus === 'not clear' ? 'bg-danger' :
                      'bg-warning text-dark'
                    }`}>
                      {patientData.insuranceStatus || 'Pending'}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Specialist:</strong>{' '}
                    {patientData.assignedSpecialist || 'Not assigned yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>Notifications</strong>
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
      </div>
    </>
  );
}

export default PatientPortal;