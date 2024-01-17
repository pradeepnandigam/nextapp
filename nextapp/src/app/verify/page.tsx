"use client";
import { useEffect, useState } from 'react';

const VerifyPage = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    // Get the token from the current URL
    const currentUrl = window.location.href;
    const token = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);

    // Make API call to verify the user
    const apiUrl = `https://api.dev2.constructn.ai/api/v1/users/verify/${token}`;

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // You might need to include additional headers like authentication tokens
      },
    })
      .then(response => response.json())
      .then(data => {
        // Set the verification status
        setVerificationStatus(data.status);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []); // The empty dependency array ensures this effect runs only once on component mount

  return (
    <div>
      <h1>Verification Status</h1>
      {verificationStatus === 'success' ? (
        <p>Congratulations! Your account has been successfully verified.</p>
      ) : (
        <p>Verification failed. Please try again or contact support.</p>
      )}
    </div>
  );
};

export default VerifyPage;
