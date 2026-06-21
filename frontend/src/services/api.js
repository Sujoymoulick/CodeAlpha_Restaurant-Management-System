export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const getHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('customer_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const config = {
      method,
      headers: getHeaders()
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};
