import React, { useCallback, useState, useEffect, useMemo, Fragment } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { jwtDecode } from "jwt-decode";
import useAuth from '../../hooks/useAuth';

export default function BarberScheduler({
  localizer,
  dayLayoutAlgorithm = 'no-overlap'
}) {
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const { auth } = useAuth();
  const decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production  

  // Fetch appointments and transform them into events
  const fetchAllAppointmentsForBarber = async () => {
    try {
      const barberId = decoded.id;
      const response = axiosPrivate.get(`${apiUrl}/appointment-details/${barberId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();


      const transformedEvents = data.map((appointment) => {
        const { appointmentDate, appointmentTime, appointmentDuration, clientName, clientSurname, serviceName, note, clientPhone, clientId } = appointment;
      
        // Combine appointmentDate with appointmentTime to form a valid datetime
        const fullDateString = `${appointmentDate.slice(0, 10)}T${appointmentTime}`; // Take only the date part and append the time
        const start = new Date(fullDateString);
      
        // Handle invalid dates
        if (isNaN(start)) {
          console.error('Invalid start date:', start);
          return null; // Return null or skip this event if invalid
        }
      
        // Calculate the end time based on appointmentDuration
        const end = new Date(start.getTime() + appointmentDuration * 60 * 1000);
        return {
          title: clientName
            ? `${clientName} ${clientSurname} - ${serviceName}`
            : note || 'No Title',
          start,
          end,
          phone: clientPhone
        };
      }).filter(event => event !== null);  // Filter out invalid events
      
      setAppointments(data);
      setEvents(transformedEvents);
      

    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAllAppointmentsForBarber();
  }, []);


  const handleSelectEvent = useCallback((event) => window.alert(`${event.title} \nBroj telefona: ${event.phone}`), []);

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  );

  return (
    <Fragment>
      <div className="height600">
        <Calendar
          dayLayoutAlgorithm={dayLayoutAlgorithm}
          defaultDate={defaultDate}
          defaultView={Views.DAY}
          events={events} // Use the transformed events here
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          selectable
          min={new Date(1970, 1, 1, 9, 0, 0)} // Start at 9:00 AM
          max={new Date(1970, 1, 1, 18, 0, 0)} // End at 6:00 PM
          step={15} // Time slot duration in minutes
          timeslots={4} // Number of slots per step (for 15-min slots, use 4)
          scrollToTime={scrollToTime}
        />
      </div>
    </Fragment>
  )
}
