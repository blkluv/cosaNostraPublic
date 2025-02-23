// src/components/Success.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/appointments');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
      <h1 className="text-green-600 text-4xl font-bold">Transaction Successful!</h1>
      <button
        onClick={handleButtonClick}
        className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg text-lg hover:bg-blue-700"
      >
        See Your Appointments
      </button>
    </div>
  );
};

export default Success;
