import useAuth from '../../hooks/useAuth'; // Import the custom hook
import React, { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

export default function BarberVipHandling({ setError }) {
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production
  const { auth } = useAuth();
  const [username, setUsername] = useState('');
  const [notification, setNotification] = useState('');
  const axiosPrivate = useAxiosPrivate();

  const handleGiveClientVIP = async () => {
    if (!username) {
      setError('Unesi username');
      return;
    }
    try {
      const response = axiosPrivate.get(`${apiUrl}/clientsByUsername/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ isVIP: 1 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update client VIP:', errorData.error);
        setError(errorData.error || 'Failed to update VIP status');
        return;
      } else {
        setNotification('Korisniku je dat VIP status!');
        setTimeout(() => setNotification(''), 3000); // Hide notification after 3 seconds
      }

      
    } catch (error) {
      console.error('Error updating client VIP:', error);
      setError('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
    }
  };

  const handleRevokeClientVIP = async () => {
    if (!username) {
      setError('Unesi username');
      return;
    }
    
    try {
      const response = await axiosPrivate.put(`${apiUrl}/clientsByUsername/${username}`, {
        isVIP: 0
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        }
      });
  
      setNotification('VIP status oduzet!');
      setTimeout(() => setNotification(''), 10000); // Hide notification after 3 seconds
  
    } catch (error) {
      console.error('Error updating client VIP:', error);
      if (error.response) {
        setError(error.response.data.error || 'Failed to update VIP status');
      } else {
        setError('Problem sa serverom, probaj Logout i Login. Pa zovi Darka :).');
      }
    }
  };
  

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Dodeli VIP korisniku</h3>
      <div className="items-center flex space-x-4 mb-4">
        <input
          className="border p-2 mr-2 bg-neutral-700 text-white rounded-xl"
          type="text"
          placeholder="Unesi username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleGiveClientVIP}
          className="p-2 mr-2 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto"
        >
          Daj VIP
        </button>
        <button
          onClick={handleRevokeClientVIP}
          className="p-2 m-2 bg-zinc-200 hover:bg-neutral-800 text-black hover:text-white rounded-xl font-bold mx-auto"
        >
          Oduzmi VIP
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-zinc-200 text-black px-4 py-2 rounded-xl shadow-md z-50">
          {notification}
        </div>
      )}
    </div>
  );
}
