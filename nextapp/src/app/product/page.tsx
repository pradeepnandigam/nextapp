// product.tsx
"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getToken, deleteCookie } from '../components/cookie';
import { getUserProfile, UserProfile } from '../components/userprofile';

export default function Product() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = getToken();
    console.log(token);
    if (!token) {
      // Push to login
      router.push('/login');
    } else {
      // Fetch profile
      fetchUserProfile(token);
    }
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    const profile = await getUserProfile(token);
    setUserProfile(profile);
  };

  const handleLogout = () => {
    // Delete the cookie
    deleteCookie();
    router.push('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Product Page</h1>
      {userProfile ? (
        <div className="bg-gray-100 p-4 border rounded-md mb-6">
          <h2 className="text-xl font-bold mb-4">User Profile</h2>
          <p className="text-lg">Name: {userProfile.fullName}</p>
          <p className="text-lg">Email: {userProfile.email}</p>
        </div>
      ) : (
        <p>Loading user profile...</p>
      )}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-md border border-red-600 hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
