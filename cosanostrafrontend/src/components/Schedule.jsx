import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { jwtDecode  } from "jwt-decode";
import useAuth from '../hooks/useAuth';  // Import the custom hook
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



export default function Schedule() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [note] = useState('');
  const [error, setError] = useState('');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDateString = tomorrow.toISOString().split('T')[0];
  const [barberDays, setBarberDays] = useState([]);
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + barberDays);
  const [lastDayString, setLastDayString] = useState('');
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production
  const axiosPrivate = useAxiosPrivate();
  let decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  let isVIP = decoded?.isVIP?.data?.[0] === 1;



  useEffect(() => {

    decoded = auth?.token ? jwtDecode(auth.token) : undefined;
    isVIP = decoded?.isVIP?.data?.[0] === 1;
    if(isVIP) {
      fetchBarbers();
    } else {
      fetchBarbersNonVIP();
    }
    fetchServices();
    lastDay.setDate(today.getDate() + barberDays);
    setLastDayString(lastDay.toISOString().split('T')[0]);
    
  }, [auth.token]);

  useEffect(() => {
    // Whenever selectedBarber, selectedService, or selectedDate changes, reset the selectedSlot
    setSelectedSlot('');
  }, [selectedBarber, selectedService, selectedDate]);

  useEffect(() => {  
    if (selectedBarber && barbers.length > 0) {
      // Choose either of the following:
      // If selectedBarber is a number and barberId is a string:
      const selectedBarberDetails = barbers.find(barber => String(barber.barberId) === String(selectedBarber));
  
      // OR if selectedBarber is a string and barberId is a number:
      // const selectedBarberDetails = barbers.find(barber => Number(barber.barberId) === selectedBarber);
  
  
      if (selectedBarberDetails) {
        setBarberDays(selectedBarberDetails.barberDays);
        const lastDay = new Date(today);
        lastDay.setDate(today.getDate() + selectedBarberDetails.barberDays);
        setLastDayString(lastDay.toISOString().split('T')[0]);
      } else {
        console.error('Selected barber not found');
      }
    }
  }, [selectedBarber, barbers]); // Trigger effect when selectedBarber or barbers change
  
  


const fetchBarbers = async () => {
  try {
    const response = await axiosPrivate.get(`${apiUrl}/barbers`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    const filteredBarbers = Array.isArray(response.data) ? response.data.filter(barber => barber.available !== "None") : [];
    setBarbers(filteredBarbers);
    if (filteredBarbers.length === 0) {
      setError('Nema slobodan frizer');
    } else {
      setError('');
    }
  } catch (error) {
    console.error('Error fetching barbers:', error);
    setError('Nemoguća komunikacija sa serverom.');
  }
};

const fetchBarbersNonVIP = async () => {
  try {
    const response = await axiosPrivate.get(`${apiUrl}/barbers`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    const filteredBarbers = Array.isArray(response.data) ? response.data.filter(barber => barber.available === "All") : [];
    setBarbers(filteredBarbers);
    if (filteredBarbers.length === 0) {
      setError('Nema slobodan frizer');
    } else {
      setError('');
    }
  } catch (error) {
    console.error('Error fetching barbers:', error);
    setError('Nemoguća komunikacija sa serverom.');
  }
};

const fetchServices = async () => {
  try {
    const response = await axiosPrivate.get(`${apiUrl}/services`);
    setServices(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error('Error fetching services:', error);
    setError('Nemoguća komunikacija sa serverom.');
  }
};


const handleBarberSelect = async (e) => {
  // Get the barberDays from selected barber and update the barberDays state
  const selectedBarberDetails = barbers.find(barber => barber.barberId === selectedBarber);
  if (selectedBarberDetails) {
    setBarberDays(selectedBarberDetails.barberDays);
  }
}

const handleBarberAndServiceSelect = async (e) => {
  e.preventDefault();


  if (selectedBarber && selectedService && selectedDate) {
    try {
      const response = await axiosPrivate.get(`${apiUrl}/available-slots`, {
        params: {
          barberId: selectedBarber,
          serviceId: selectedService,
          date: selectedDate.toLocaleDateString("en-CA"),
        },
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });
      
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Nemoguća komunikacija sa serverom.');
    }
  }
};

const vipPayment = async () => {
  if (!selectedService || !selectedBarber || !selectedDate || !selectedSlot) {
    setError('Izaberite sva polja.');
    return;
  }


  try {
    const response = await axiosPrivate.post(
      `${apiUrl}/appointment`,
      {
        serviceId: selectedService,
        barberId: selectedBarber,
        appointmentDate: selectedDate.toLocaleDateString("en-CA"),
        appointmentTime: dateToTime(selectedSlot),
        appointmentDuration: await getServiceDuration(selectedService),
        note: note,
        clientId: decoded.id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      }
    );

    if (response.status === 201) {
      navigate('/appointments');
    } else {
      console.error('Unexpected response:', response);
      setError('Nemoguća komunikacija sa serverom.');
    }
  } catch (error) {
    console.error('Failed to create appointment:', error.response?.data?.error || error);
    setError('Nemoguća komunikacija sa serverom.');
  }
};


const getServiceDuration = async (id) => {
  try {
    const response = await axiosPrivate.get(`${apiUrl}/services/${id}`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    return response.data.serviceDuration;
  } catch (error) {
    console.error('Error fetching service duration:', error);
    setError('Nemoguća komunikacija sa serverom.');
  }
};

  /*const makePayment = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedSlot) {
      setError('Please select all required fields');
      return;
    }
  
    const response = await fetch('http://localhost:8080/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        serviceId: selectedService,
        barberId: selectedBarber,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        note: note,
        //clientId: localStorage.getItem('clientId') // Assuming you store clientId in localStorage
      })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create Checkout Session:', errorData.error);
      return;
    }
  
    const session = await response.json();
  
    const stripe = await loadStripe("pk_test_51PP98SRxP15yUwgN35ZxmfdI3sBYz2B8hGEReLM387HBhlwJaGQ4PqhtgfD2YorNEsj2YpjYbkeYAwfnPRTZTNHY00KAQaZwPD");
  
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id
    });
  
    if (error) {
      console.error('Error redirecting to Checkout:', error);
    }
  };*/

  function makePayment() {
    alert("Ovo će da vodi na Raiffeisen POS terminal na kraju razvoja sajta");
  }
  
  
  function dateToTime(date) {
    const date2 = new Date(date);
  
    if (isNaN(date2.getTime())) {
      console.error('Invalid date:', date);
      return null; // or handle it as per your need
    }
  
    const hours = date2.getUTCHours().toString().padStart(2, '0');
    const minutes = date2.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date2.getUTCSeconds().toString().padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  }
  

  const formatTime = (time) => {
    const date = new Date(time);
    
    // Subtract one hour
    date.setHours(date.getHours() - 1);
  
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Disable weekends
  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };
  

  const handleDateChange = (date) => {
    if (!date) {
      setError("Izaberite datum.");
      setSelectedDate(null);
      return;
    }

    if (date < today) {
      setError("Ne možete da rezervišete danas.");
      setSelectedDate(null);
    } else {
      setError("");
      setSelectedDate(date);
    }
  };

  
  return (
    <div className='min-h-screen flex flex-col justify-between bg-neutral-950'>
      <div className='m-auto h-auto shadow-lg shadow-neutral-900 bg-black p-6 sm:max-w-[900px] rounded-2xl'>
        <h2 className='text-4xl font-bold text-center mb-8 text-zinc-200'>Zakaži termin</h2>
        <form onSubmit={handleBarberAndServiceSelect}>
          <div className='mb-4'>
            <label className='block text-zinc-200 mb-2'>Izaberi frizera:</label>
            <select
              className='w-full p-2 bg-zinc-200 text-black rounded-xl'
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              required
            >
              <option value='' disabled>Frizer</option>
              {barbers.map((barber) => (
                <option key={barber.barberId} value={barber.barberId}>{barber.barberName} {barber.barberSurname}</option>
              ))}
            </select>
          </div>
          <div className='mb-4'>
            <label className='block text-zinc-200 mb-2'>Izaberi uslugu:</label>
            <select
              className='w-full p-2 bg-zinc-200 text-black rounded-xl'
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              required
            >
              <option value='' disabled>Usluga</option>
              {services.map((service) => (
                <option key={service.serviceId} value={service.serviceId}>{service.serviceName} - {service.servicePrice}</option>
              ))}
            </select>
          </div>
          <div className='mb-4'>
            <label className='block text-zinc-200 mb-2'>Izaberi datum:</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              filterDate={isWeekday} // Disables weekends
              minDate={tomorrow} // Prevents past dates
              maxDate={lastDay} // Limits selection to a range
              placeholderText="Izaberi datum"
              className="w-72 p-2 bg-zinc-200 text-black rounded-xl"
              required
            />
          </div>
          <div className='mb-4'>
            <button className='w-full py-2 my-4 bg-zinc-200 hover:bg-neutral-800 text-black rounded-xl'>Pogledaj dostupnu satnicu</button>
          </div>
        </form>
        {availableSlots.length > 0 && (
          <div className='mb-4'>
            <label className='block text-zinc-200 mb-2'>Izaberi vreme:</label>
            <select
              className='w-full p-2 bg-zinc-200 text-black rounded-xl'
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              required
            >
              <option value='' disabled>Termini</option>
              {availableSlots.map((slot, index) => (
              <option key={index} value={`${slot.start}`}>
                {formatTime(new Date(slot.start))} {/* Ensure slot.start is valid */}
              </option>
            ))}

            </select>
            {/* 
              <button
                className='w-full py-2 my-4 bg-zinc-200 hover:bg-neutral-800 text-black rounded-xl'
                onClick={makePayment}
              >
                Zakaži termin
              </button>
            */}

            {decoded?.isVIP && (
              <button
                className='w-full py-2 my-4 bg-zinc-200 hover:bg-neutral-800 text-black rounded-xl'
                onClick={vipPayment}
              >
                Zakaži termin
              </button>
            )}
          </div>
        )}
        {error && <p className='text-red-500'>{error}</p>}
        <form onSubmit={makePayment}>
          {/* Other input fields and submit button for scheduling the appointment */}
        </form>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}
