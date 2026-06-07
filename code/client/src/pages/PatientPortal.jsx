// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~40%
// AI-Assisted Areas: polling logic, useEffect cleanup, notification rendering, token retrieval
// Human Contributions: integration with AuthContext, route decisions, testing
// Notes: polling every 30s per BARI-23 acceptance criteria. Token fetched via Firebase getIdToken.
import AIChatWidget from '../components/AIChatWidget';


import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import SurgeryCleared from '../components/SurgeryCleared';
import { auth } from '../config/firebase';
import { apiRequest } from '../utils/api';
import ProgressBar from '../components/ProgressBar';
import PatientChecklist from '../components/PatientChecklist';
import NotificationsCard from '../components/NotificationsCard';
import NeedHelpCard from '../components/NeedHelpCard';

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

  const isCleared =
    patientData?.progress &&
    patientData.progress.completed === patientData.progress.total &&
    patientData.progress.total > 0;

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

        {isCleared && <SurgeryCleared />}

        {/* Progress Bar Section */}
        {patientData && patientData.progress && (
          <ProgressBar
            completed={patientData.progress.completed}
            total={patientData.progress.total}
            alwaysGreen={true}
            striped={true}
            animated={true}
            variant="detailed"
          />
        )}

        {/* Checklist Section */}
        {patientData && patientData.checklist && (
          <PatientChecklist
            checklist={patientData.checklist}
            insuranceStatus={patientData.insuranceStatus}
          />
        )}

        {/* Notifications Section */}
        <NotificationsCard
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />

        {/* Need Help Section */}
        {patientData && (
          <NeedHelpCard
            assignedCoordinator={patientData.assignedCoordinator}
          />
        )}
      </div>
      <AIChatWidget 
        role="PATIENT"
        patientContext={{
          insuranceStatus: patientData?.insurance || patientData?.insuranceStatus || "unknown",
          assignedSpecialist: patientData?.visitType || patientData?.assignedSpecialist || "not yet assigned",
          name: user?.name,
        }}
      />
    </>
  );
}

export default PatientPortal;
