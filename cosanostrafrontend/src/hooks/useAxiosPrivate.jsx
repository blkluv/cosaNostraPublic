import { useEffect } from "react";
import { axiosPrivate } from "../api/axiosInstance";
import useRefreshToken from "./useRefreshToken";
import useAuth from '../hooks/useAuth';
import { useNavigate, useLocation } from "react-router-dom";

const useAxiosPrivate = () => {
  const { refresh } = useRefreshToken();
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth?.token) return; // 🚀 Prevent API calls if logged out

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error("Response Interceptor Error:", error);
        const prevRequest = error?.config;

        if (error?.response?.status === 500) {
          console.error("Internal Server Error (500) encountered. Logging out...");
          setAuth(null);
          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          }
        }

        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;

          try {
            const newAccessToken = await refresh();
            if (newAccessToken) {
              setAuth((prev) => ({
                ...prev,
                token: newAccessToken,  // ✅ Correctly update the token
              }));

              prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axiosPrivate(prevRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            setAuth(null);
            if (location.pathname !== "/login") {
              navigate("/login", { replace: true });
            }
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth?.token, refresh, navigate, location.pathname, setAuth]);

  useEffect(() => {
    if (!auth?.token) return; // 🚀 Skip API setup if not logged in

    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (auth?.token && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${auth.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
    };
  }, [auth?.token]);

  return axiosPrivate;
};

export default useAxiosPrivate;
