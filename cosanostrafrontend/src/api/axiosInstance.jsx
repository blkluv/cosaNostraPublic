import axios from 'axios';

const apiUrl =
process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_API_LOCAL // Use local API in development
  : process.env.REACT_APP_API;      // Use production API in production

export default axios.create({
  baseURL: apiUrl, // API base URL from environment variable
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create the axios instance for private requests
export const axiosPrivate = axios.create({
  baseURL: process.env.REACT_APP_API, // API base URL from environment variable
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for cross-origin requests if needed
});

