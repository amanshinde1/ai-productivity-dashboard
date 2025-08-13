// src/components/ConfirmationModal.js

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
} from "@chakra-ui/react";
import { useConfirmationModal } from "../context/ConfirmationModalContext";

// This component now receives its state from props, which are passed from the context.
const ConfirmationModal = () => {
  const { isOpen, message, onConfirm, closeModal } = useConfirmationModal();

  const handleConfirmAndClose = () => {
    onConfirm();
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent
        bg="premiumDark.700"
        color="text.light"
        borderRadius="xl"
        boxShadow="2xl"
      >
        <ModalHeader borderBottom="1px solid" borderColor="premiumDark.600">
          Confirm Action
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <Text fontSize="lg">{message}</Text>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="premiumDark.600">
          <Button
            onClick={closeModal}
            colorScheme="gray"
            variant="ghost"
            mr={3}
            _hover={{ bg: "premiumDark.600" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAndClose}
            colorScheme="red"
            _hover={{ opacity: 0.8 }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
