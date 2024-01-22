// // components/HierarchyComponent.js
// Import the necessary modules
"use client";
import { useRouter } from 'next/navigation';

// Inside your component function
const YourComponent = () => {
  // Get the history object from React Router
  const history = useRouter();

  // Function to handle the button click and redirect
  const handleButtonClick = () => {
    // Redirect to the specified URL
    history.push('/projects/PRJ201897/sections');
  };

  return (
    <div>
      {/* Your other components */}
      <button onClick={handleButtonClick}>Redirect to PRJ201897</button>
    </div>
  );
};

export default YourComponent;
