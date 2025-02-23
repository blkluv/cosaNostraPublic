import useAuth from '../../hooks/useAuth';  // Import the custom hook
import React, { useState } from 'react';
import { jwtDecode } from "jwt-decode";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';


export default function BarberBreakHandler({ setError, fetchAllAppointmentsForBarber }) {
  const [breakStart, setBreakStart] = useState(null);
  const [breakEnd, setBreakEnd] = useState(null);
  const [breakDate, setBreakDate] = useState(null);
  const [notification, setNotification] = useState(""); // State for the notification message
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production
    const handleBreakSubmit = async () => {
      if (!breakStart || !breakEnd || !breakDate) {
        setError('Izaberi datume za pauzu');
        return;
      }
    
      try {
        const barberId = decoded.id;
        const response = await axiosPrivate.post(`${apiUrl}/guestAppointment`, {
          appointmentDate: breakDate,
          appointmentTime: breakStart,
          appointmentDuration: await calculateTimeDifference(breakStart, breakEnd),
          barberId: barberId,
          note: "BREAK",
        });
    
        if (response.status !== 200) {
          console.error('Failed to set break:', response.data.error);
          setNotification('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
          return;
        } else {
          setBreakStart(null);
          setBreakEnd(null);
          fetchAllAppointmentsForBarber(); // Refresh appointments after setting break
        }
    
      } catch (error) {
        console.error('Error setting break:', error);
        setNotification('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
      }
    };
    
  function calculateTimeDifference(startTime, endTime) {
  
  
    // Parse the start and end times
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
  
    // Ensure hours and minutes are valid numbers
    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      throw new Error('Invalid time value.');
    }
  
    // Convert the start and end times to minutes
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
  
    // Calculate the difference in minutes
    const differenceInMinutes = endTotalMinutes - startTotalMinutes;
  
  
    return differenceInMinutes;
  };

  const timeOptions = [];
  for (let i = 7; i <= 21; i++) {
    timeOptions.push(`${i}:00`);
    timeOptions.push(`${i}:30`);
  }

  return (
    <>
      {notification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-zinc-200 text-black px-4 py-2 rounded-xl shadow-md z-50">
            {notification}
          </div>
      )}
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Zakaži pauzu</h3>
      <div className="mb-4">
        {/* Break Start Date */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
          <label className="mb-2 sm:mb-0 sm:mr-2">Datum pauze:</label>
          <input
            type="date"
            className="border p-2 bg-neutral-700 text-white rounded-xl w-full sm:w-auto"
            value={breakDate}
            onChange={(e) => setBreakDate(e.target.value)}
          />
        </div>

        {/* Break Start Time */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
          <label className="mb-2 sm:mb-0 sm:mr-2">Start:</label>
          <select
            className="border p-2 bg-neutral-700 text-white rounded-xl w-full sm:w-auto"
            value={breakStart}
            onChange={(e) => setBreakStart(e.target.value)}
          >
            <option value="">Izaberi vreme</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Break End Time */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
          <label className="mb-2 sm:mb-0 sm:mr-2">Kraj:</label>
          <select
            className="border p-2 bg-neutral-700 text-white rounded-xl w-full sm:w-auto"
            value={breakEnd}
            onChange={(e) => setBreakEnd(e.target.value)}
          >
            <option value="">Izaberi vreme</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex xl:justify-start lg:justify-start md:justify-start sm:justify-center xs:justify-center">
        <button
          onClick={handleBreakSubmit}
          className="p-4 my-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold"
        >
          Napravi pauzu
        </button>
      </div>

      </div>
    </>

  )
}