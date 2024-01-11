import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface DialogBoxProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void; // Function to close the dialog
}

const DialogBox: React.FC<DialogBoxProps> = ({ message, type, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);

  //border styles
  const getBorderStyle = () => {
    if (type === 'success') {
      return 'border-green-500 bg-green-100';
    } else if (type === 'error') {
      return 'border-red-500 bg-red-100';
    } else {
      return 'border-gray-500 bg-gray-100';
    }
  };

  useEffect(() => {
    // Automatically close
    const timeoutId = setTimeout(() => {
      onClose();
    }, 10000);

    // Cleanup the timeout
    return () => clearTimeout(timeoutId);
  }, [onClose]);

  const handleCloseClick = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className={`dialog-box border-2 mt-2 p-2 rounded ${getBorderStyle()}`}>
          <div className="flex justify-between items-center">
            <span>{message}</span>
            <button onClick={handleCloseClick} className="text-gray-500 hover:text-red-500">
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DialogBox;

