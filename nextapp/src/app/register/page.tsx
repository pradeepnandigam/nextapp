//register.tsx
"use client";
import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import DialogBox from '../components/dialog';
import axios from 'axios';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  //handle input changes
  const handleChange = (e: { target: { name: any; value: any; type: any; checked: any; }; }) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // State for dialog
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'success' });

  //password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  //close the dialog
  const handleCloseDialog = () => {
    setDialog({ isOpen: false, message: '', type: 'success' });
  };

  // display a dialog 
  const displayDialog = (message: string, type: 'success' | 'error') => {
    setDialog({ isOpen: true, message, type });
    console.log('Dialog State:', { message, type });
    console.log(dialog.message);
  };

  // handle form submit
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Check empty field
    for (const key in formData) {
      if (formData[key as keyof typeof formData] === '') {
        displayDialog(`${key} is required.`, 'error');
        return;
      }
    }

    // Check if password and confirmPassword match
    if (formData.password !== formData.confirmPassword) {
      displayDialog('Password and Confirm Password do not match!', 'error');
      return;
    }

    try {
      // API call for register
      const response = await axios.post(
        'https://api.dev2.constructn.ai/api/v1/users/register',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        // If registration is successful
        alert('Signup successful!');
        console.log('Registration successful:', formData);
        window.location.href = '/login';
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      // Check if it's an Axios error with a response
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        if (error.response.status === 409) {
          displayDialog(`Email Already Exists: ${responseData.message}`, 'error');
        } else {
          // Handle other non-successful status codes
          console.error('Registration error:', error);
          displayDialog('Registration failed. Please try again later.', 'error');
        }
      } else {
        // Handle other types of errors
        console.error('Registration error:', error);
        displayDialog('Registration failed. Please try again later.', 'error');
      }
    }
  };

  //registration page
  return (
    <div>
      <div>
        <Head>
          <title>Register Page</title>
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
              <div className="bg-gradient-to-br from-orange-400 to-purple-400 p-4 rounded-full">
                <FaUser className="text-l align-center ml-1" />
              </div>
              <h2 className='mt-3'>Sign Up</h2>
            </div>
            <form className="w-full max-w-md mx-auto" onSubmit={handleSubmit}>
              {/* First Name input field */}
              <fieldset className="border border-gray-300 rounded">
                <legend className="text-xs ml-2 text-grey-500" style={{ color: 'orange' }}>
                  First Name
                </legend>
                <div className="relative flex items-center">
                  <FaUser className="text-m ml-2 text-grey-500" style={{ color: 'orange' }} />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder=""
                    className="w-full p-1 pl-4 rounded focus:outline-none focus:shadow-outline border-0"
                    onChange={handleChange}
                    required
                  />
                </div>
              </fieldset>
              {/* Last Name input field */}
              <fieldset className="mt-2 border border-gray-300 rounded">
                <legend className="text-xs ml-2 text-grey-500" style={{ color: 'orange' }}>
                  Last Name
                </legend>
                <div className="relative flex items-center">
                  <FaUser className="text-m ml-2 text-grey-500" style={{ color: 'orange' }} />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder=""
                    className="w-full p-1 pl-4 rounded focus:outline-none focus:shadow-outline border-0"
                    onChange={handleChange}
                    required
                  />
                </div>
              </fieldset>
              {/* Email input field */}
              <fieldset className="mt-2 border border-gray-300 rounded">
                <legend className="text-xs ml-2 text-grey-500" style={{ color: 'orange' }}>
                  Email Address
                </legend>
                <div className="relative flex items-center">
                  <FaEnvelope className="text-m ml-2 text-grey-500" style={{ color: 'orange' }} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder=""
                    className="w-full p-1 pl-4 rounded focus:outline-none focus:shadow-outline border-0"
                    onChange={handleChange}
                    required
                  />
                </div>
              </fieldset>
              {/* Password input field */}
              <fieldset className="mt-2 border border-gray-300 rounded">
                <legend className="text-xs ml-2 text-grey-500" style={{ color: 'orange' }}>
                  Password
                </legend>
                <div className="relative flex items-center">
                  <FaKey className="text-m ml-2 text-grey-500" style={{ color: 'orange' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder=""
                    className="w-full p-1 pl-4 rounded focus:outline-none focus:shadow-outline border-0"
                    onChange={handleChange}
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
              {/* Confirm Password input field */}
              <fieldset className="mt-2 border border-gray-300 rounded">
                <legend className="text-xs ml-2 text-grey-500" style={{ color: 'orange' }}>
                  Confirm Password
                </legend>
                <div className="relative flex items-center">
                  <FaKey className="text-m ml-2 text-grey-500" style={{ color: 'orange' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder=""
                    className="w-full p-1 pl-4 rounded focus:outline-none focus:shadow-outline border-0"
                    onChange={handleChange}
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
              {/*checkbox */}
              <div className="mb-2 mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  className="mr-2"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeTerms" className="text-s text-gray-500">
                  I agree to the Terms and Conditions
                </label>
              </div>
              {/* SignUp button */}
              <button
                type="submit"
                className="w-full mt-5 bg-gradient-to-r from-orange-500 to-purple-400 text-white p-3 rounded hover:from-orange-600 hover:to-purple-600 transition"
              >
                Sign Up
              </button>
            </form>
            {/* Link to Login page*/}
            <div className="mt-5 text-gray-500">
              Already a user?{' '}
              <Link href="/login" style={{ color: 'orange' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
