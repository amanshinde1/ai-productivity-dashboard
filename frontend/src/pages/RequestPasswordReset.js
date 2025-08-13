// src/pages/RequestPasswordReset.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link,
  VStack,
  Alert,
  AlertIcon,
  CloseButton,
  useColorModeValue,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { requestPasswordReset } from '../services/passwordReset';

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    error,
    setError,
    successMessage,
    setSuccessMessage,
    clearAllErrors,
    clearSuccessMessage,
  } = useAuthContext();

  const toast = useToast();

  // Colors
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.6)');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const headingColor = useColorModeValue('gray.900', 'white');
  const linkColor = useColorModeValue('purple.500', 'purple.300');
  const inputBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)');
  const inputBorder = useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)');
  const focusBorder = useColorModeValue('purple.300', 'purple.500');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');

  // Reset on mount
  useEffect(() => {
    setEmail('');
    clearAllErrors();
    clearSuccessMessage();
  }, [clearAllErrors, clearSuccessMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();
    clearSuccessMessage();

    setSubmitting(true);
    try {
      const res = await requestPasswordReset(email);
      const msg = res.data.message || 'If an account with that email exists, a password reset link has been sent.';
      setSuccessMessage(msg);

      toast({
        title: 'Request Sent',
        description: msg,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      const errMsg = 'Failed to request password reset. Please try again.';
      setError(errMsg);
      toast({
        title: 'Error',
        description: errMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'dark.900')}
      backgroundImage={useColorModeValue(
        'none',
        'url(https://images.unsplash.com/photo-1518621736915-f3b1c6742571?q=80&w=1920&auto=format&fit=crop)'
      )}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      p={4}
    >
      <Box
        bg={bgColor}
        p={8}
        borderRadius="xl"
        boxShadow="xl"
        w={{ base: '90%', md: '450px' }}
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.15)"
      >
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading size="lg" color={headingColor} textAlign="center">
            Request Password Reset
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md" w="full">
              <AlertIcon />
              <Text flex="1">{error}</Text>
              <CloseButton onClick={clearAllErrors} />
            </Alert>
          )}
          {successMessage && (
            <Alert status="success" borderRadius="md" w="full">
              <AlertIcon />
              <Text flex="1">{successMessage}</Text>
              <CloseButton onClick={clearSuccessMessage} />
            </Alert>
          )}

          <FormControl id="email" isRequired>
            <FormLabel color={textColor}>Email Address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              bg={inputBg}
              borderColor={inputBorder}
              _placeholder={{ color: placeholderColor }}
              _focus={{ borderColor: focusBorder, boxShadow: 'outline' }}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="purple"
            width="full"
            isLoading={submitting}
            loadingText="Sending..."
          >
            Send Reset Link
          </Button>

          <Text color={textColor} fontSize="sm">
            Remember your password?{' '}
            <Link as={RouterLink} to="/login" color={linkColor} fontWeight="semibold">
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default RequestPasswordResetPage;
