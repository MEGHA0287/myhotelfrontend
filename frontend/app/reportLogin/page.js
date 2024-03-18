'use client'
import { useState,useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { faEye, faEyeSlash, faUser, faFileLines, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export default function Login1() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.removeItem('authToken')
  }, [])
  
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/superAdmin/login', { username, password });
      // Handle successful login, save token to localStorage, redirect, etc.
      console.log(response.data);
      const token = response.data.token;
      localStorage.setItem('authToken', token);
      setMessage('Login successful');
      router.push('/reportDashboard')
    } catch (error) {
      setMessage('Authentication failed');
    }
  };

  const handleClose = () => {
    // Add logic to handle the close button click, for example, navigate back to the home page
    router.push('/dashboard');
  };

  return (
    <div className="py-16 font-sans -mt-5 lg:mt-10" >
     <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-sm relative">

        <button
                 onClick={handleClose}
                className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 py-1 rounded-full text-center"
            >
                <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
        <div className="w-full p-3 lg:w-96 border-solid mt-5">
          <p className="text-2xl text-gray-600 text-center font-bold ">Report Login</p>

          <div className="mt-4 relative">
            <label className="block text-gray-700 text-sm md:text-base font-semibold mb-2">Username</label>
            <input
              className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-0.5 px-4 block w-full appearance-none pr-10 text-sm md:text-base"

              type="text"
              value={username}
              placeholder='Enter Username'
              onChange={(e) => setUsername(e.target.value)}

            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 mt-8">
              <FontAwesomeIcon icon={faUser} className="text-gray-500 cursor-pointer"
              />

            </div>
          </div>

          <div className="mt-4 relative">
            <label className="block text-gray-700 text-sm md:text-base font-semibold mb-2">Password</label>
            <input
              className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-0.5 px-4 block w-full appearance-none pr-10 text-sm md:text-base"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder='*******'
              onChange={(e) => setPassword(e.target.value)}

            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 mt-8">
              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                className="text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

          </div>
          <div className="mt-2 flex justify-end">
            <Link href="/forgotReportPassword" className="text-sm md:text-sm text-blue-500">Forgot Password?</Link>
          </div>
          <div className="mt-3">
            <button
              className="bg-orange-100 text-orange-600 font-bold py-2 px-4 w-full rounded-full hover:bg-orange-200"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>

          {message && <p className="mt-4 text-red-500">{message}</p>}

        </div>
      </div>
    </div>
  );
}