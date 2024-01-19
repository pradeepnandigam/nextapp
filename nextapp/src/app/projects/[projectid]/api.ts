// api.ts
import axios from 'axios';

export const fetchData = async (token: string, projectid: string) => {
  try {
    const response = await axios.get(
      `https://api.dev2.constructn.ai/api/v1/views/web/${projectid}/sectionList`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.result;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
