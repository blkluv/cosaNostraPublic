import axios from "../api/axiosInstance";
import useAuth from "./useAuth";

let refreshPromise = null; // Store the ongoing refresh request globally

const useRefreshToken = () => {
  const {  setAuth } = useAuth();

  const refresh = async () => {


    if (!refreshPromise) {
      refreshPromise = axios
        .post("/refresh", {}, { withCredentials: true })
        .then((response) => {
          const newAccessToken = response.data?.accessToken;

          if (!newAccessToken) {
            throw new Error("No access token returned by /refresh endpoint");
          }

          // Update auth context with the new token
          setAuth((prev) => ({
            ...prev,
            token: newAccessToken, // Ensure token is updated
          }));

          return newAccessToken;
        })
        .catch((error) => {
          console.error("Token refresh failed:", error);
          setAuth(null); // Clear auth on failure
          return null;
        })
        .finally(() => {
          refreshPromise = null; // Reset promise after completion
        });
    }

    return refreshPromise;
  };

  return { refresh };
};

export default useRefreshToken;
