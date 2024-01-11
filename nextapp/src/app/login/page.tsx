// login.tsx
"use client";
import React, { useState } from 'react';
import Head from 'next/head';
import { FaEnvelope, FaKey, FaEye, FaLock, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';
import DialogBox from '../components/dialog';
import { storeTokensInCookie } from '../components/cookie';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'success' });

  //password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Function to toggle Remember Me option
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  // Function to handle input changes
  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //close the dialog
  const handleCloseDialog = () => {
    setDialog({ isOpen: false, message: '', type: 'success' });
  };


  //display a dialog
  const displayDialog = (message: string, type: 'success' | 'error') => {
    setDialog({ isOpen: true, message, type });
    console.log('Dialog State:', { message, type });
  };

  //handle sign-in
  const handleSignIn = async () => {
    const { email, password } = formData;
    try {
      // API call for user sign-in using axios
      const response = await axios.post(
        "https://api.dev2.constructn.ai/api/v1/users/signin",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        //successful
        const data = response.data;
        alert('Sign In successful!');
        storeTokensInCookie(data.result.token, data.result.refreshToken);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      // error
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        if (error.response.status === 401) {
         //invalid
          displayDialog(`Invalid credentials. Please check your email and password.`, 'error');
        } else {
          console.error("Sign In error:", error);
          displayDialog('Sign In failed. Please try again later.', 'error');
        }
      } else {
        console.error("Sign In error:", error);
        displayDialog('Sign In failed. Please try again later.', 'error');
      }
    }     
  };

  //login page
  return (
    <div>
      <Head>
        <title>Login Page</title>
      </Head>
      {dialog.isOpen && (
        <DialogBox
          message={dialog.message}
          type={dialog.type as 'success' | 'error'}
          onClose={handleCloseDialog}
        />
      )}
      <div className="flex h-screen">
        <div className="w-2/3 bg-cover bg-center" style={{ backgroundImage: 'url("/images/login-beside.png")' }}></div>
        <div className="w-1/3 p-10 flex flex-col items-center justify-center">
          <div className="mb-6">
            <div className="bg-gradient-to-br from-orange-600 to-purple-400 p-4 rounded-full">
              <FaLock className="text-l align-center" />
            </div>
            <h2 className='mt-3'>Sign In</h2>
          </div>
          <form className="w-full max-w-md mx-auto">
            {/* Email input field */}
            <fieldset className="border border-gray-300 rounded h-15">
              <legend className="text-xs ml-3 text-grey-500" style={{ color: 'orange' }}>
                Email Address**
              </legend>
              <div className="relative flex items-center">
                <FaEnvelope className="text-m ml-5 text-grey-500" style={{ color: 'orange' }} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=""
                  className="w-full p-1 pl-5 rounded focus:outline-none focus:shadow-outline border-0"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </fieldset>
            {/* Password input field */}
            <fieldset className=" mt-3 border border-gray-300 rounded h-15">
              <legend className="text-xs ml-3 text-grey-500" style={{ color: 'orange' }}>
                Password**
              </legend>
              <div className="relative flex items-center">
                <FaKey className="text-m ml-5 text-grey-500" style={{ color: 'orange' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder=""
                  className="w-full p-1 pl-5 rounded focus:outline-none focus:shadow-outline border-0"
                  onChange={handleInputChange}
                  required
                />
                <div
                  className="text-gray-500 cursor-pointer mr-2"
                  onClick={togglePasswordVisibility}
                  style={{ color: 'orange' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </fieldset>
            {/* Remember Me checkbox */}
            <div className="mt-3 mb-6 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="mr-2"
                checked={rememberMe}
                onChange={toggleRememberMe}
              />
              <label htmlFor="rememberMe" className="text-s text-gray-500">
                Remember Me
              </label>
            </div>
            {/* Sign In button */}
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-orange-600 to-purple-400 text-white p-3 rounded hover:from-orange-600 hover:to-purple-600 transition"
            >
              Sign In
            </button>
          </form>
          {/* Link to register page for new users */}
          <div className="mt-5 text-gray-500">
            New User?
            <Link href="/register" style={{ color: 'orange' }}>
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
