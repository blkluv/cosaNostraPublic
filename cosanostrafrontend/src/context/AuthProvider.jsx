import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import js-cookie
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import { axiosPrivate } from "../api/axiosInstance";

const AuthContext = createContext({});

const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null  });
  const [persist, setPersist] = useState(true);

  // Function to refresh the token by calling the /refresh endpoint
  const refreshToken = async () => {
    try {
      const response = await axiosPrivate.post(`${apiUrl}/refresh`); // Your refresh route
      const newToken = response.data.accessToken;

      if (newToken) {

        const decodedToken = jwtDecode(newToken);
        setAuth({ token: newToken, user: decodedToken });
      }
    } catch (err) {
      setAuth({ token: null, user: null }); // Clear token if refresh fails
    }
  };

  // Read the token from cookies on initial load
  useEffect(() => {
    const storedToken = Cookies.get("token"); // Read token from cookies
    if (storedToken) {
      setAuth({
        token: storedToken,
        user: null, // Optionally, fetch and set user info
      });
    } else {
      refreshToken(); // If no token, attempt to refresh it
    }
  }, []); // Run this only on initial mount

  return (
    <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
