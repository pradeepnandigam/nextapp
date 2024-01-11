// product.tsx
"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getToken, deleteCookie } from '../components/cookie';
import { getUserProfile,UserProfile} from '../components/userprofile';

export default function Product() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
     //push to login
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
    <div>
      <h1>Product Page</h1>
      {userProfile ? (
        <div>
          <h2>User Profile</h2>
          <p>Name: {userProfile.fullName}</p>
          <p>Email: {userProfile.email}</p>
        </div>
      ) : (
        <p>Loading user profile...</p>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
