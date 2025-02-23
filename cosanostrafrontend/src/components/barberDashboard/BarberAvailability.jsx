import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';  // Import the custom hook
import { jwtDecode } from "jwt-decode";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';


export default function BarberAvaialability() {
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production
  const { auth } = useAuth();
  const decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  const [notification, setNotification] = useState(""); // State for the notification message
  const axiosPrivate = useAxiosPrivate();


  const handleAvailabilityChange = async (availability) => {
      try {
      const barberId = decoded.id;
  
      const response = await axiosPrivate.put(`${apiUrl}/barbers/${barberId}`, {
        available: availability,
      });
  
      if (response.status !== 200) {
        console.error("Failed to update availability:", response.data.error);
        setNotification('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
        return;
      }
  
      // Determine the success message based on availability
      let message = '';
      if (availability === 'All') {
        message = 'Trenutno si dostupan svima!';
      } else if (availability === 'VIPs') {
        message = 'Trenutno si dostupan samo VIP korisnicima!';
      } else if (availability === 'None') {
        message = 'Trenutno si nedostupan!';
      }
  
      setNotification(message);
  
      // Hide the notification after 10 seconds
      setTimeout(() => setNotification(''), 10000);
  
    } catch (error) {
      console.error("Error updating availability:", error);
      setNotification('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
    }
  };
  

  return (
    <div className="mb-6">
    <h3 className="text-xl font-semibold mb-2">Dostupnost</h3>
    {notification && (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-zinc-200 text-black px-4 py-2 rounded-xl shadow-md z-50">
      {notification}
    </div>
    )}
    <div className="flex mb-4">
      <button onClick={() => handleAvailabilityChange("None")} className="p-2 mx-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto">
        Dostupan nikom
      </button>
      <button onClick={() => handleAvailabilityChange("All")} className="p-2 mx-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto">
        Dostupan svima
      </button>
      <button onClick={() => handleAvailabilityChange("VIPs")} className="p-2 mx-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto">
        Dostupan samo VIP
      </button>
    </div>
  </div>
  )
}