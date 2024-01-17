// login.tsx
"use client";
import React, { useState } from 'react';
import Head from 'next/head';
import { FaEnvelope, FaKey, FaEye, FaLock, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCloseDialog = () => {
    setDialog({ isOpen: false, message: '', type: 'success' });
  };

  const displayDialog = (message: string, type: 'success' | 'error') => {
    setDialog({ isOpen: true, message, type });
    console.log('Dialog State:', { message, type });
  };

  const handleSignIn = async () => {
    const { email, password } = formData;
    try {
      const response = await axios.post(
        'https://api.dev2.constructn.ai/api/v1/users/signin',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        alert('Sign In successful!');
        storeTokensInCookie(data.result.token, data.result.refreshToken);
        window.location.href = '/';
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        if (error.response.status === 401) {
          displayDialog(`Invalid credentials. Please check your email and password.`, 'error');
        } else {
          displayDialog('Sign In failed. Please try again later.', 'error');
        }
      } else {
        displayDialog('Sign In failed. Please try again later.', 'error');
      }
    }
  };

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
            <TextField
              id="email"
              name="email"
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: <FaEnvelope style={{ color: 'orange' }} />,
              }}
              onChange={handleInputChange}
              required
            />
            <TextField
              id="password"
              name="password"
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                startAdornment: <FaKey style={{ color: 'orange' }} />,
                endAdornment: (
                  <div
                    className="text-gray-500 cursor-pointer mr-2"
                    onClick={togglePasswordVisibility}
                    style={{ color: 'orange' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                ),
              }}
              onChange={handleInputChange}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={toggleRememberMe}
                  color="primary"
                />
              }
              label="Remember Me"
              className="mt-3 asd-6"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSignIn}
              className="mt-3 mb-6"
            >
              Sign In
            </Button>
          </form>
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
