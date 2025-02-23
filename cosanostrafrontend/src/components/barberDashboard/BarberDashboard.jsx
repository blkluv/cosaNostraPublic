import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from "jwt-decode";
import useAuth from '../../hooks/useAuth';  // Import the custom hook
import BarberAvaialability from './BarberAvailability';
import BarberVipHandling from './BarberVIPHandling';
import BarberBreakHandler from './BarberBreakHandler';
import BarberMultipleDayBreak from './BarberMultipleDayBreak';
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';




export default function BarberDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [barberDays, setBarberDays] = useState('');
  const [workStart, setWorkStart] = useState('');
  const [workEnd, setWorkEnd] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [notification, setNotification] = useState(""); // State for the notification message
  const axiosPrivate = useAxiosPrivate();

  const { auth } = useAuth();
  const decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production
  useEffect(() => {
    fetchAllAppointmentsForBarber();
    fetchBarberDays();
  }, []);

  function calculateEndTime(startTime, durationInMinutes) {
    // Ensure startTime is in the correct format (HH:MM:SS)
    const timeParts = startTime.split(':');
    if (timeParts.length !== 3) {
      throw new Error('Invalid time format. Expected HH:MM:SS.');
    }
  
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);
  
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error('Invalid hours, minutes, or seconds.');
    }
  
    // Create a Date object for the start time with a fixed date
    const startDate = new Date();
    startDate.setHours(hours);
    startDate.setMinutes(minutes);
    startDate.setSeconds(seconds);
    startDate.setMilliseconds(0);
  
    // Debug: Log the initial Date object
  
    // Add the duration
    startDate.setMinutes(startDate.getMinutes() + durationInMinutes);
  
    // Debug: Log the Date object after adding duration
  
    // Format the end time
    const endHours = startDate.getHours().toString().padStart(2, '0');
    const endMinutes = startDate.getMinutes().toString().padStart(2, '0');
  
    return `${endHours}:${endMinutes}`;
  }

  const handleBarberDaysChange = async (barberDays) => {
    axiosPrivate
    .put(`${apiUrl}/barbers/${decoded.id}`, { barberDays })
    .then(() => {
      setNotification(`Trenutno je moguće zakazati ${barberDays} dana unapred.`);
      setTimeout(() => setNotification(""), 10000);
    })
    .catch((error) => {
      console.error("Error updating availability:", error);
      setNotification("Problem sa serverom. Probaj Logout i Login, pa zovi Darka :).");
      setTimeout(() => setNotification(""), 10000);
    });
  
  };
  

  const fetchBarberDays = async () => {
    axiosPrivate
    .get(`${apiUrl}/barbers/${decoded.id}`)
    .then((response) => {
      setBarberDays(response.data.barberDays);
      setWorkEnd(response.data.workEnd);
      setWorkStart(response.data.workStart);
    })
    .catch((error) => {
      console.error("Error fetching barber details:", error);
      setError("Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).");
    });
  
  }
  
  const fetchAllAppointmentsForBarber = async () => {
    axiosPrivate
    .get(`${apiUrl}/appointment-details/${decoded.id}`)
    .then((response) => {
      const sortedAppointments = response.data.sort(
        (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
      );
      setAppointments(sortedAppointments);
    })
    .catch((error) => {
      console.error("Error fetching appointments:", error);
      setError('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0); // Reset time to midnight

    const matchesDateRange =
      (!startDate || appointmentDate >= startDate) &&
      (!endDate || appointmentDate <= endDate);

    return appointmentDate >= today && matchesDateRange;
  });
  
  const convertTime = (timeString) => {
    const timeParts = timeString.split(':');
    const convertedTime = timeParts.slice(0, 2).join(':');
    return convertedTime;
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString); 
    return date.toLocaleString('en-US', options);
  };

  


  const deleteAppointment = async (appointmentId) => {
    if (!appointmentId) {
      console.error('Invalid appointmentId:', appointmentId);
      setError('Invalid appointment ID');
      return;
    }
  
    try {
      const response = axiosPrivate.get(`${apiUrl}/appointment/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
  
      // Update state to remove the deleted appointment
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.appointmentId !== appointmentId)
      );
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
    }
  };

  const handleWorkTimeChange = async (start, end) => {
    try {
      const barberId = decoded?.id;
      if (!barberId) throw new Error("Barber ID is undefined.");
  
      const response = await axiosPrivate.put(`${apiUrl}/barbers/${barberId}`, {
        workStart: start,
        workEnd: end,
      });
  
      setNotification(`Radno vreme promenjeno na: ${start} - ${end}`);
      setTimeout(() => setNotification(""), 10000);
    } catch (err) {
      console.error("Error updating work time:", err);
      setNotification("Problem sa serverom. Probaj Logout i Login, pa zovi Darka :).");
      setTimeout(() => setNotification(""), 10000);
    }
  };

  
  return (
<div className="flex flex-col items-center p-4 sm:p-6 bg-neutral-950 text-white">  <h2 className="text-xl sm:text-2xl font-bold mb-4">Stranica za frizera</h2>
  {error && <p className="text-red-500 mb-4">{error}</p>}
  <BarberAvaialability />
  <BarberVipHandling setError={setError} />
  <div className="mt-4">
    <BarberBreakHandler
      setError={setError}
      fetchAllAppointmentsForBarber={fetchAllAppointmentsForBarber}
    />
  </div>
  <BarberMultipleDayBreak
    setError={setError}
    fetchAllAppointmentsForBarber={fetchAllAppointmentsForBarber}
  />

  <h1>Promeni koliko dana unapred se može zakazati</h1>
  <div>
    <input
      type="number"
      placeholder={barberDays}
      className="p-2 m-2 border border-gray-500 rounded-xl text-black"
      value={barberDays}
      onChange={(e) => setBarberDays(e.target.value)} // Update state locally first
    />
    <button 
      className="w-48 py-2 my-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto"
      onClick={() => handleBarberDaysChange(barberDays)}
    >
      Promeni
    </button>
  </div>

  <h1>Promeni radno vreme</h1>
  {notification && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-zinc-200 text-black px-4 py-2 rounded-xl shadow-md z-50">
    {notification}
  </div>
)}
  <div>
    <input
      type="number"
      placeholder={workStart}
      className="p-2 m-2 border border-gray-500 rounded-xl text-black"
      value={workStart}
      onChange={(e) => setWorkStart(e.target.value)} // Update state locally first
    />
    <input
      type="number"
      placeholder={workEnd}
      className="p-2 m-2 border border-gray-500 rounded-xl text-black"
      value={workEnd}
      onChange={(e) => setWorkEnd(e.target.value)} // Update state locally first
    />
    <button 
      className="w-48 py-2 my-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto"
      onClick={() => handleWorkTimeChange(workStart, workEnd)}
    >
      Promeni
    </button>
  </div>
  <button
      onClick={() => navigate("/barber-create-appointment")}
      className="w-48 py-2 my-4 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto"
    >
      Kreiraj termin
    </button>

    <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by client name"
          className="p-2 border border-gray-500 rounded-xl text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          isClearable={true}
          className="p-2 border border-gray-500 rounded-xl text-black"
          placeholderText="Select date range"
        />
      </div>

  <div className="mt-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-2">Termini</h3>
      <div className="overflow-auto border border-neutral-700 rounded-md">
        <table className="w-full table-auto text-sm sm:text-base">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Client Name</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Remove</th>
            </tr>
          </thead>
          <tbody>
          {filteredAppointments
            .filter((appointment) => new Date(appointment.appointmentDate) >= today)
            .map((appointment) => (
              <tr
                key={appointment.appointmentId}
                className="border-b border-neutral-700"
              >
                <td className="px-4 py-2">
                  {appointment.appointmentDate
                    ? formatDate(appointment.appointmentDate)
                    : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {appointment.appointmentTime
                    ? convertTime(appointment.appointmentTime)
                    : "N/A"}
                  {appointment.serviceName === null
                    ? "-" +
                      calculateEndTime(
                        appointment.appointmentTime,
                        appointment.appointmentDuration
                      )
                    : ""}
                </td>
                <td className="px-4 py-2">
                  {`${appointment.clientName ?? ""} ${appointment.clientSurname ?? ""}`.trim() || 
                    (appointment.note === "BREAK" ? "Pauza" : appointment.note || "Pauza")}
                </td>
                <td className="px-4 py-2">{appointment.serviceName ?? "Pauza"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => {
                      if (appointment.appointmentId) {
                        deleteAppointment(appointment.appointmentId);
                      } else {
                        console.error("Appointment ID is undefined:", appointment);
                      }
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs sm:text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
        </table>
      </div>
    </div>
    <div className="w-full max-w-full overflow-auto mt-6">
      <iframe 
        src="https://calendar.google.com/calendar/embed?src=fef5ebed7d3454fd02ad200f962a40fa4f568fad05aabd803920680ab225b3ae%40group.calendar.google.com&ctz=Europe%2FBelgrade" 
        className="w-full h-[600px] border-0"
        scrolling="no"
      ></iframe>
    </div>  
  </div>
  )
  
  
}
