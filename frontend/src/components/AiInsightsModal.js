// src/components/AiInsightsModal.js

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Text,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { Zap, Brain, Lightbulb, RefreshCw } from 'lucide-react';
import { mockSuggestions } from '../constants/aiSuggestions';

const iconMap = {
  Zap,
  Brain,
  Lightbulb,
};

const AiInsightsModal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [tip, setTip] = useState(null);
  const [iconName, setIconName] = useState('Zap');

  // Method exposed to parent components
  useImperativeHandle(ref, () => ({
    show: () => {
      getNewTip();
      setIsOpen(true);
    }
  }));

  const onClose = () => setIsOpen(false);

  const getNewTip = () => {
    let newTip;
    let newIcon;

    // Prevent same tip twice in a row
    do {
      newTip = mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)];
    } while (tip && newTip === tip);

    // Prevent same icon twice in a row
    const icons = Object.keys(iconMap);
    do {
      newIcon = icons[Math.floor(Math.random() * icons.length)];
    } while (iconName && newIcon === iconName);

    setTip(newTip);
    setIconName(newIcon);
    setFadeKey(prev => prev + 1);
  };

  const IconComp = iconMap[iconName] || Zap;
  const textColor = useColorModeValue('gray.700', 'gray.100');

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="scale">
      <ModalOverlay />
      <ModalContent
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="xl"
        boxShadow="lg"
        p={6}
        maxW="sm"
      >
        <ModalHeader fontWeight="bold" fontSize="lg">
          AI Productivity Tip
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {tip && (
            <VStack
              key={fadeKey}
              spacing={4}
              align="center"
              textAlign="center"
              transition="opacity 0.3s ease-in-out"
            >
              <IconComp size={36} color="#805ad5" />
              <Text fontSize="md" color={textColor}>
                {tip}
              </Text>
              <IconButton
                aria-label="Get another tip"
                icon={<RefreshCw size={18} />}
                onClick={getNewTip}
                colorScheme="purple"
                variant="outline"
              />
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default AiInsightsModal;
