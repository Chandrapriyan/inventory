const API_BASE_URL = 'http://localhost:5000/api';
const API_KEY = 'your-secure-api-key'; // Should match backend .env

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...(options.headers || {}),
    'x-api-key': API_KEY,
  };
  const opts = { ...options, headers };
  const response = await fetch(url, opts);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
} 