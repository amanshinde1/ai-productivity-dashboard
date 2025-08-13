// src/pages/HelpView.js
import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Card,
  Button,
  Icon,
  useColorModeValue,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { HelpCircle, Mail, Search } from 'lucide-react';

// Example FAQ data — can be expanded or fetched dynamically
const FAQS = [
  { question: "How do I add a new task?", answer: "Click on the 'Add New Task' button on the dashboard or in the planner view." },
  { question: "How can I switch to dark mode?", answer: "Go to Settings and toggle the Dark Mode switch." },
  { question: "Why can't I edit tasks in guest mode?", answer: "Guest mode limits some features. Log in or register to unlock all functionality." },
  { question: "How do I reset my password?", answer: "From the Login page, click 'Forgot Password' and follow the reset link sent to your email." },
  { question: "Can I export my task list?", answer: "Currently exporting is not available, but we plan to add it in the future." },
];

const HelpView = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Color mode styling
  const bgColor = useColorModeValue('gray.50', 'dark.900');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.6)');
  const headingColor = useColorModeValue('gray.900', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardHeaderColor = useColorModeValue('gray.800', 'whiteAlpha.800');

  const cardBorder = useColorModeValue(
    '1px solid rgba(255, 255, 255, 0.3)',
    '1px solid rgba(255, 255, 255, 0.1)'
  );
  const cardBoxShadow = useColorModeValue(
    '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  );
  const cardHoverBoxShadow = useColorModeValue(
    '0 16px 64px 0 rgba(31, 38, 135, 0.5)',
    '0 16px 64px 0 rgba(0, 0, 0, 0.5)'
  );

  const buttonBg = useColorModeValue('whiteAlpha.900', 'whiteAlpha.200');
  const buttonColor = useColorModeValue('gray.800', 'white');
  const buttonHoverBg = useColorModeValue('gray.200', 'whiteAlpha.300');

  // Filtered FAQs based on search
  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return FAQS;
    return FAQS.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <Box
      p={{ base: 4, md: 6, lg: 8 }}
      w="100%"
      minH="100vh"
      bg={bgColor}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <VStack
        spacing={6}
        align="stretch"
        maxW={{ base: '90%', sm: '500px', md: '700px' }}
        w="full"
      >
        <Heading size="xl" mb={2} color={headingColor} textAlign="center" userSelect="none">
          Help & Support
        </Heading>

        <Text color={textColor} mb={4} textAlign="center">
          Find answers to common questions or contact support.
        </Text>

        {/* Search bar for FAQs */}
        <Input
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          mb={4}
          bg={buttonBg}
          color={buttonColor}
          _placeholder={{ color: textColor }}
          borderRadius="md"
        />

        <VStack spacing={4} align="stretch">
          {/* FAQs Card with Accordion */}
          <Card
            bg={cardBg}
            boxShadow={cardBoxShadow}
            borderRadius="xl"
            backdropFilter="blur(10px)"
            border={cardBorder}
            _hover={{ boxShadow: cardHoverBoxShadow }}
            transition="all 0.3s ease-in-out"
            p={4}
          >
            <Heading size="md" mb={4} color={cardHeaderColor}>
              FAQs
            </Heading>
            {filteredFaqs.length > 0 ? (
              <Accordion allowToggle>
                {filteredFaqs.map((faq, idx) => (
                  <AccordionItem key={idx} border="none">
                    <AccordionButton _expanded={{ bg: 'purple.500', color: 'white' }} borderRadius="md" mb={1}>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} color={textColor}>
                      {faq.answer}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Text color={textColor} fontSize="sm">No FAQs match your search.</Text>
            )}
          </Card>

          {/* Contact Support Card */}
          <Card
            bg={cardBg}
            boxShadow={cardBoxShadow}
            borderRadius="xl"
            backdropFilter="blur(10px)"
            border={cardBorder}
            _hover={{ boxShadow: cardHoverBoxShadow }}
            transition="all 0.3s ease-in-out"
            p={4}
          >
            <Heading size="md" mb={2} color={cardHeaderColor}>
              Contact Support
            </Heading>
            <Text fontSize="sm" color={textColor}>
              Couldn't find what you're looking for? Reach out to our support team.
            </Text>
            <Button
              as="a"
              href="mailto:support@prodexa.com"
              size="md"
              mt={4}
              leftIcon={<Icon as={Mail} />}
              colorScheme="purple"
              bg={buttonBg}
              color={buttonColor}
              _hover={{ bg: buttonHoverBg }}
              borderRadius="md"
              boxShadow="sm"
              aria-label="Send an Email to Support"
            >
              Send an Email
            </Button>
          </Card>
        </VStack>
      </VStack>
    </Box>
  );
};

export default HelpView;
