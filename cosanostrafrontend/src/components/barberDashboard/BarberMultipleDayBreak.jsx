import { jwtDecode } from "jwt-decode";
import useAuth from '../../hooks/useAuth';  // Import the custom hook
import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

export default function BarberMultipleDayBreak({ setError, fetchAllAppointmentsForBarber }) {
  
  const [startBreakDate, setStartBreakDate] = useState(null);
  const [endBreakDate, setEndBreakDate] = useState(null);
  const { auth } = useAuth();
  const decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  const axiosPrivate = useAxiosPrivate();
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production
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

  const iterateDaysInRange = (start, end, callback) => {
    const startDate = new Date(start);
    const endDate = new Date(end);


    const date = new Date(startDate);
    while (date <= endDate) {
        callback(new Date(date));
        date.setDate(date.getDate() + 1);
    }
};

const handleMultipleDayBreakSubmit = async () => {
  if (!startBreakDate || !endBreakDate) {
    setError('Izaberi datume za pauzu');
    return;
  }

  try {
    const barberId = decoded.id;

    // Iterate through the range of dates
    iterateDaysInRange(startBreakDate, endBreakDate, async (date) => {
      try {
        const response = await axiosPrivate.post(`${apiUrl}/guestAppointment`, {
          appointmentDate: date.toISOString().split('T')[0],
          appointmentTime: "07:00", // Ensure time is in HH:MM format
          appointmentDuration: calculateTimeDifference("07:00", "22:00"),
          barberId: barberId,
          note: 'BREAK',
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
          },
        });

        if (response.status !== 200) {
          console.error(`Failed to set break for ${date}:`, response.data.error);
          return;
        }
      } catch (error) {
        console.error(`Error setting break for ${date}:`, error);
      }
    });

    // Reset date fields and refresh the appointments
    setStartBreakDate(null);
    setEndBreakDate(null);
    fetchAllAppointmentsForBarber();
  } catch (error) {
    console.error('Error setting break:', error);
  }
};


return (
    <div className="mb-4">
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Napravi pauzu od više dana</h3>

      {/* Break Start Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <label className="mb-2 sm:mb-0 sm:mr-2">Početni datum:</label>
        <input
          type="date"
          className="border p-2 bg-neutral-700 text-white rounded-xl w-full sm:w-auto"
          value={startBreakDate}
          onChange={(e) => setStartBreakDate(e.target.value)}
        />
      </div>

      {/* Break End Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <label className="mb-2 sm:mb-0 sm:mr-2">Krajnji datum:</label>
        <input
          type="date"
          className="border p-2 bg-neutral-700 text-white rounded-xl w-full sm:w-auto"
          value={endBreakDate}
          onChange={(e) => setEndBreakDate(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div className="justify-center lg:justify-start">
        <button
          onClick={handleMultipleDayBreakSubmit}
          className="p-4 my-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto"
        >
          Napravi pauzu od više dana
        </button>
      </div>
    </div>

)
}