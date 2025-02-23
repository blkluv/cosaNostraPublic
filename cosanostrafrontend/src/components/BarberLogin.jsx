import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import useAuth from '../hooks/useAuth';  // Import the custom hook
import axiosPrivate from '../api/axiosInstance';  // axios instance with interceptors applied
import shopicon from '../assets/ikona.jpg';


export default function BarberLogin() {

  const [barberUsername, setUsername] = useState('');
  const [barberPassword, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production




  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      // Send the login request using axios
      const response = await axiosPrivate.post(`${apiUrl}/barberlogin`, {
        barberUsername,
        barberPassword
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Handle successful login response
      const { accessToken } = response.data; // Directly access the accessToken from response.data
      
      setAuth({ token: accessToken });
      navigate('/barber-dashboard'); 
    } catch (error) {
      // Handle errors in the request or response
      console.error('Error logging in:', error);
      
      // Check if error is related to response
      if (error.response) {
        // If there's an error response from the server
        setError(error.response.data.message || 'Failed to login');
      } else {
        // If there was an issue with the request itself
        setError('Failed to login');
      }
    }
  };
  



  return (
<div className="min-h-screen flex flex-col justify-between bg-neutral-950">
  <div className="grid grid-cols-1 lg:grid-cols-2 m-auto h-auto lg:h-[550px] shadow-lg shadow-neutral-900 sm:max-w-[900px] bg-black rounded-2xl">
    {/* Left Section: Placeholder or Icon */}
    <div className="w-full h-full lg:h-auto flex justify-center items-center">
      <img
        className="w-full h-64 lg:w-auto lg:h-auto object-contain rounded-t-2xl lg:rounded-l-2xl"
        src={shopicon} // Replace with the correct icon/image variable
        alt="Shop icon"
      />
    </div>

    {/* Right Section: Login Form */}
    <div className="p-4 lg:pr-24 pr-0 flex flex-col justify-around">
      <p className="text-4xl font-semibold tracking-wider self-center mt-8 text-zinc-200 hidden sm:hidden md:hidden lg:block">
        Prijavi se
      </p>
      <form className="flex flex-col items-center" onSubmit={handleLogin}>
        <div className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
          {/* Username Input */}
          <input
            className="border p-2 mb-2 sm:mb-0 bg-zinc-200 text-black rounded-xl"
            type="text"
            placeholder="Korisničko ime"
            value={barberUsername}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {/* Password Input */}
          <input
            className="border p-2 bg-zinc-200 text-black rounded-xl"
            type="password"
            placeholder="Šifra"
            value={barberPassword}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Error Message */}
        {error && <p className="text-red-500">{error}</p>}
        {/* Submit Button */}
        <button className="w-48 py-2 my-4 bg-zinc-200 hover:bg-neutral-800 text-black rounded-xl font-bold mx-auto">
          Prijavi se
        </button>
      </form>
      {/* Back to Home Link */}
      <Link to="/" className="text-center text-zinc-200 font-bold sm:pt-4">
        Nazad na početnu stranicu
      </Link>
    </div>
  </div>
  <Footer className="mt-auto" />
</div>

  );
}
