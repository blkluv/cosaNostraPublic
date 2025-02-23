import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../assets/css/style.css"; // Ensure to import your CSS file
import knglava from '../assets/knglava.jpg';
import axios from 'axios';
import useAuth from '../hooks/useAuth'; // Ensure correct path
import UserPng from '../assets/User.png'
import AddUserPng from '../assets/CreateUser.png'
import SchedulePng from '../assets/scissor 2.png'
import AppointmentsPng from '../assets/Calendar.png'
import Logoutpng from '../assets/logout.png'
import User from '../assets/User.png'
import { jwtDecode } from "jwt-decode";


export default function Navbar({ isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production


  const handleLogoutClick = async (e) => {
    e.preventDefault();

    try {
        await axios.post(`${apiUrl}/logout`, {}, { withCredentials: true, 
        headers: {
          'Content-Type': 'application/json',
        } });
        setAuth({token: null});        
        navigate("/");
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
<>
  <nav className="relative nav">
    <div className="flex justify-between items-center w-full p-4">
      <a href="/">
        <img src={knglava} className="w-16 h-16" alt="Logo" />
      </a>
      <button className="lg:hidden text-white text-2xl" onClick={toggleMenu}>
        ☰ {/* Hamburger icon */}
      </button>
    </div>

    <ul
      className={`fixed top-0 right-0 h-full w-3/4 lg:w-auto bg-zinc-900 lg:bg-transparent transition-transform transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:flex lg:flex-row lg:space-x-4 lg:items-center lg:h-auto`}
    >
      <li className="lg:hidden flex justify-end p-4">
        <button onClick={closeMenu} className="text-white text-4xl">
          × {/* Close icon */}
        </button>
      </li>

      {decoded?.userType === 'barber' ? (
        <>
          <li className="mt-12 lg:mt-0 whitespace-nowrap">
            <Link
              to="/barber-dashboard"
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
              onClick={closeMenu}
            >
              {isMenuOpen && (
                <img
                  className="w-10 h-10"
                  src={User}  // Replace with appropriate barber icon if needed
                  alt="Barber Dashboard"
                />
              )}
              Barber Dashboard
            </Link>
          </li>

          <li className="mt-4 lg:mt-0 whitespace-nowrap">
            <a
              onClick={(e) => {
                handleLogoutClick(e); // Call the logout function
                closeMenu(); // Close the menu
              }}
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
            >
              {isMenuOpen && (
                <img
                  className="w-10 h-10"
                  src={Logoutpng}
                  alt="Logout"
                />
              )}
              Odjavi se
            </a>
          </li>
        </>
      ) : isAuthenticated ? (
        <>
          <li className="mt-12 lg:mt-0 whitespace-nowrap">
            <Link
              to="/schedule"
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
              onClick={closeMenu}
            >
              {isMenuOpen && (
                <img className="w-10 h-10" src={SchedulePng} alt="User" />
              )}
              Zakaži termin
            </Link>
          </li>
          <li className="mt-4 lg:mt-0 whitespace-nowrap">
            <Link
              to="/appointments"
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
              onClick={closeMenu}
            >
              {isMenuOpen && (
                <img className="w-10 h-10" src={AppointmentsPng} alt="User" />
              )}
              Pogledaj termin
            </Link>
          </li>
          <li className="mt-4 lg:mt-0 whitespace-nowrap">
            <Link
              to="/user-profile"
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
              onClick={closeMenu}
            >
              {isMenuOpen && (
                <img className="w-10 h-10" src={User} alt="User" />
              )}
              Pogledaj profil
            </Link>
          </li>
          <li className="mt-4 lg:mt-0 whitespace-nowrap">
            <a
              onClick={(e) => {
                handleLogoutClick(e); // Call the logout function
                closeMenu(); // Close the menu
              }}
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
            >
              {isMenuOpen && (
                <img className="w-10 h-10" src={Logoutpng} alt="User" />
              )}
              Odjavi se
            </a>
          </li>
        </>
      ) : (
        <>
          <li className="mt-12 lg:mt-0 whitespace-nowrap">
            <Link
              to="/login"
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
              onClick={closeMenu}
            >
              {isMenuOpen && (
                <img className="w-10 h-10" src={UserPng} alt="User" />
              )}
              Prijavi se
            </Link>
          </li>

          <li className="mt-4 lg:mt-0 whitespace-nowrap">
            <Link
              to="/register"
              className="block text-white bg-zinc-900 flex items-center gap-2 hover:bg-zinc-700 active:bg-gray-500 px-4 py-2 rounded transition text-lg"
              onClick={closeMenu}
            >
              {isMenuOpen && (
                <img className="w-10 h-10" src={AddUserPng} alt="Add User" />
              )}
              Kreiraj nalog
            </Link>
          </li>
        </>
      )}
    </ul>
  </nav>

  <div className="bg-red-500 text-white text-center p-4 text-lg lg:text-2xl font-semibold">
    <p>Trenutno je moguće samo zakazivanje korisnicima koji imaju odobrenje od salona.</p>
  </div>
</>


  );
}
