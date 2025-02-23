import React, { useState, useEffect } from 'react';
import shopicon from '../assets/ikona.jpg';
import Footer from './Footer';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import useAxiosPrivate from '../hooks/useAxiosPrivate';


export default function UserProfile() {
  const [clientUsername, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const axiosPrivate = useAxiosPrivate();
  const [notification, setNotification] = useState(""); // State for the notification message
  const { auth } = useAuth();
  const decoded = auth?.token ? jwtDecode(auth.token) : undefined;
  const apiUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_LOCAL // Use local API in development
    : process.env.REACT_APP_API;      // Use production API in production

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const clientId = decoded.id;
          const response = await axiosPrivate.get(`${apiUrl}/clients/${clientId}`);
          setUsername(response.data.clientUsername);
          setClientPhone(response.data.clientPhone);
        } catch (err) {
          console.error("Failed to fetch client data:", err);
          setNotification('Problem sa serverom.');
          setTimeout(() => setNotification(""), 10000);
        }
      };

      fetchUserData();
    }, [apiUrl, axiosPrivate, decoded.id]);


    
	
    const handleUsernameChange = async (e) => {
      e.preventDefault();
      if (clientUsername.length < 5 || clientUsername.length > 15) {
        setUsernameError('Dužina korisničkog imena mora da bude između 5 i 15 karaktera');
      } else {
        try {
          const clientId = decoded.id;
          await axiosPrivate.put(`${apiUrl}/clients/${clientId}`, { clientUsername });
          setNotification(`Korisničko ime je promenjeno na ${clientUsername}`);
          setTimeout(() => setNotification(""), 10000);
        } catch (err) {
          console.error("Failed to update username:", err);
          setNotification('Problem sa serverom.');
          setTimeout(() => setNotification(""), 10000);
        }
        setUsernameError('');
      }
    };
    

    const handlePhoneChange = async (e) => {
      e.preventDefault();
      if (clientPhone.length < 8 || clientPhone.length > 14) {
        setPhoneError('Unesite pravilan broj telefona u formatu 06*******');
      } else {
        try {
          const clientId = decoded.id;
          await axiosPrivate.put(`${apiUrl}/clients/${clientId}`, { clientPhone });
          setNotification(`Telefon je promenjen na ${clientPhone}`);
          setTimeout(() => setNotification(""), 10000);
        } catch (err) {
          console.error("Failed to update phone:", err);
          setNotification('Problem sa serverom.');
          setTimeout(() => setNotification(""), 10000);
        }
        setPhoneError('');
      }
    };
    

    const handlePasswordChange = async (e) => {
      e.preventDefault();
      if(newPassword!==confirmNewPassword)
      {
        setPasswordError('Lozinke se ne poklapaju');
      } else if(newPassword.length<6 || newPassword.length>20){
        setPasswordError('Lozinka mora biti između 6 i 20 slova');
      } else {
        try {
          await axiosPrivate.put(`${apiUrl}/change-password`, {
            clientUsername,
            clientPassword: oldPassword,
            clientNewPassword: newPassword
          });

          setNotification('Promenjena lozinka.');
          setTimeout(() => setNotification(""), 10000);

          setOldPassword('');
          setConfirmNewPassword('');
          setNewPassword('');
          setPasswordError('');

        } catch (error) {
          console.error('Error:', error);
          if (error.response) {
            setPasswordError('Neispravna lozinka.');
          } else {
            setPasswordError('Nemoguća komunikacija sa serverom.');
          }
        }
      }

    };
    


    return (
      
    <div className="min-h-screen flex flex-col justify-between pt-6 bg-neutral-950">
        {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-zinc-200 text-black px-4 py-2 rounded-xl shadow-md z-50">
          {notification}
        </div>
        )}
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 pt-6 pb-8 m-auto h-auto md:h-[550px] shadow-lg shadow-neutral-900 sm:max-w-[900px] bg-black rounded-2xl">
        {/* First Grid Item: Image */}
        <div className="flex justify-center items-center">
          <img
            className="w-64 h-64 object-contain rounded-t-2xl md:w-full md:h-full rounded-l-2xl"
            src={shopicon}
            alt="Shop icon"
          />
        </div>
        
        {/* Second Grid Item: Form */}
        <div className="p-4 flex flex-col justify-around">
          <form className="flex flex-col items-center space-y-3">
            <p className="text-2xl font-semibold tracking-wider text-center mb-4 text-zinc-200">
              Izmeni lične podatke
            </p>
            <p className="text-l font-semibold tracking-wider text-center mb-4 text-zinc-200">
              Korisničko ime
            </p>
            <input
              className="border p-2 bg-zinc-200 text-black rounded-xl w-80 md:w-96"
              type="text"
              placeholder="Korisničko ime"
              value={clientUsername}
              onChange={(e) => setUsername(e.target.value)}
            />
            {usernameError && <p className="text-red-500">{usernameError}</p>}
            <div className="flex justify-center">
              <button   type="button" onClick={handleUsernameChange} className="w-36 py-2 my-2 bg-zinc-200 hover:bg-neutral-800 text-black rounded-xl font-bold">
                Promeni ime
              </button>
            </div>
            <p className="text-l font-semibold tracking-wider text-center text-zinc-200">
              Šifra
            </p>
            <input
              className="border p-2 bg-zinc-200 text-black rounded-xl w-80 md:w-96"
              type='password'
              placeholder="Trenutna šifra"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              className="border p-2 bg-zinc-200 text-black rounded-xl w-80 md:w-96"
              type='password'
              placeholder="Nova šifra"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              className="border p-2 bg-zinc-200 text-black rounded-xl w-80 md:w-96"
              type='password'
              placeholder="Ponovi novu šifru"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            {passwordError && <p className="text-red-500">{passwordError}</p>}
            <div className="flex justify-center">
              <button type='button' onClick={handlePasswordChange} className="w-36 py-2 my-2 bg-zinc-200 hover:bg-neutral-800 text-black rounded-xl font-bold">
                Promeni šifru
              </button>
            </div>
            <p className="text-l font-semibold tracking-wider text-center mb-4 text-zinc-200">
              Broj telefona
            </p>
            <input
              className="border p-2 bg-zinc-200 text-black rounded-xl w-80 md:w-96"
              type="text"
              placeholder="Broj telefona"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
            {phoneError && <p className="text-red-500">{phoneError}</p>}
            <div className="flex justify-center">
              <button type="button" onClick={handlePhoneChange} className="w-36 py-2 my-2 bg-zinc-200 hover:bg-neutral-800 text-black rounded-xl font-bold">
                Promeni broj
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer className="mt-auto" />
    </div>

  )
}