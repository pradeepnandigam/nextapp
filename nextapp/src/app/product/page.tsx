"use client"
import { useEffect } from 'react';
import { getToken } from '../components/cookie';

export default function Product() {
  useEffect(() => {
    //getToken
    const token = getToken();
    console.log('Token from product page:', token);
  }, []);

  return (
    <div>
      <h1>Product Page</h1>
    </div>
  );
}
