// src/components/Success.jsx
import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cancel() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
      <h1 className="text-red-600 text-4xl font-bold">Transaction unuccessful!</h1>
      <button
        onClick={handleButtonClick}
        className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg text-lg hover:bg-blue-700"
      >
        Back to home
      </button>
    </div>
  );
};
