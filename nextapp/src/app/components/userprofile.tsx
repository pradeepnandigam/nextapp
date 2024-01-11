// components/getUserProfile.ts
import axios from 'axios';

interface UserProfile {
  fullName: string;
  email: string;
}

export const getUserProfile = async (token: string): Promise<UserProfile | null> => {
  try {
    const response = await axios.get('https://api.dev2.constructn.ai/api/v1/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data.result;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
