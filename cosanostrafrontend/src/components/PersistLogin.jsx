import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { refresh } = useRefreshToken(); // Ensure refresh is destructured here
  const { auth, persist } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        // If there's no token, try to refresh it
        if (!auth?.token && persist) {
          await refresh();
        }
      } catch (err) {
        console.error("Error refreshing token:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false); // Set loading state to false once the process is complete
        }
      }
    };


    // Only try to refresh the token if persist is true and auth.token is missing
    if (!auth?.token && persist) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);  // Skip refresh if token exists or persist is false
    }

    return () => {
      isMounted = false;  // Clean up if the component unmounts
    };
  }, [auth?.token, persist, refresh]);  // Ensure refresh is in dependencies

  return (
    <>
      {!persist
        ? <Outlet />
        : isLoading
          ? <p>Loading...</p>
          : <Outlet />
      }
    </>
  );
};

export default PersistLogin;
