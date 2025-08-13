// src/context/ConfirmationModalContext.js

import React, { createContext, useContext, useState, useCallback } from 'react';

// 1. Create the Context
const ConfirmationModalContext = createContext();

// 2. Create the custom hook for easy access
export const useConfirmationModal = () => useContext(ConfirmationModalContext);

// 3. Create the Provider
export const ConfirmationModalProvider = ({ children }) => {
  // State to manage the modal's visibility and content
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  // Function to open the modal from any component
  const openModal = useCallback(({ message, onConfirm }) => {
    setModalState({
      isOpen: true,
      message,
      onConfirm,
    });
  }, []);

  // Function to close the modal
  const closeModal = useCallback(() => {
    setModalState(prevState => ({
      ...prevState,
      isOpen: false,
    }));
  }, []);

  // The value provided to components that use this context
  const value = {
    ...modalState,
    openModal,
    closeModal,
  };

  return (
    <ConfirmationModalContext.Provider value={value}>
      {children}
    </ConfirmationModalContext.Provider>
  );
};
