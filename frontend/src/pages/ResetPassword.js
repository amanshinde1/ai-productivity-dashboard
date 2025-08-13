// src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import {
  Flex,
  Box,
  VStack,
  Heading,
  Text,
  FormControl,
  InputGroup,
  Input,
  InputLeftElement,
  InputRightElement,
  Button,
  Link,
  Alert,
  AlertIcon,
  CloseButton,
  IconButton,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { confirmPasswordReset } from '../services/passwordReset';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const {
    error,
    successMessage,
    setError,
    setSuccessMessage,
    clearAllErrors,
    clearSuccessMessage
  } = useAuthContext();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Colors
  const bg = useColorModeValue('gray.50', 'dark.900');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.6)');
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const inputBg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)');
  const inputBorder = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const focusBorder = useColorModeValue('purple.300', 'purple.500');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');

  useEffect(() => {
    clearAllErrors();
    clearSuccessMessage();
    setNewPassword('');
    setConfirmPassword('');
  }, [clearAllErrors, clearSuccessMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();
    clearSuccessMessage();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await confirmPasswordReset(uid, token, newPassword);
      const message = res.data.message || 'Password has been reset successfully.';
      setSuccessMessage(message);

      // Show success toast
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated. You can now log in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect to login after 2 sec
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg} p={4}>
      <Box
        bg={cardBg}
        p={8}
        maxW="400px"
        w="full"
        borderRadius="xl"
        boxShadow="xl"
        border="1px solid rgba(255, 255, 255, 0.15)"
        backdropFilter="blur(10px)"
      >
        <VStack as="form" spacing={5} onSubmit={handleSubmit}>
          <Heading size="lg" color={headingColor} textAlign="center">
            Reset Password
          </Heading>
          <Text color={textColor} textAlign="center">
            Enter your new password below.
          </Text>

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

          {/* New Password */}
          <FormControl isRequired>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Lock color={placeholderColor} />
              </InputLeftElement>
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                bg={inputBg}
                borderColor={inputBorder}
                _placeholder={{ color: placeholderColor }}
                _focus={{ borderColor: focusBorder, boxShadow: 'outline' }}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showNew ? 'Hide' : 'Show'}
                  icon={showNew ? <EyeOff /> : <Eye />}
                  onClick={() => setShowNew(!showNew)}
                  size="sm"
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Confirm Password */}
          <FormControl isRequired>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Lock color={placeholderColor} />
              </InputLeftElement>
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                bg={inputBg}
                borderColor={inputBorder}
                _placeholder={{ color: placeholderColor }}
                _focus={{ borderColor: focusBorder, boxShadow: 'outline' }}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showConfirm ? 'Hide' : 'Show'}
                  icon={showConfirm ? <EyeOff /> : <Eye />}
                  onClick={() => setShowConfirm(!showConfirm)}
                  size="sm"
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            colorScheme="purple"
            w="full"
            isLoading={submitting}
            loadingText="Resetting..."
          >
            Reset Password
          </Button>

          <Link as={RouterLink} to="/login" color="purple.400" textAlign="center" width="full">
            Back to Login
          </Link>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ResetPassword;
