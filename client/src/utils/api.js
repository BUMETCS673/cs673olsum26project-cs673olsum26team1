import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Makes an authenticated request to the backend.
 * Automatically attaches the current Firebase ID token.
 */
export async function apiRequest(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  // Attach the Firebase token if a user is logged in
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}