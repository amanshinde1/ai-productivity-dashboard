// src/pages/ProfileView.js
import React, { useState } from 'react';
import {
  Box, Heading, VStack, FormControl, FormLabel, Input, Button,
  Alert, AlertIcon, Text, Divider, useColorModeValue, Card, CardHeader,
  CardBody, InputGroup, InputLeftElement, Spinner, Flex, useToast, InputRightElement, IconButton
} from '@chakra-ui/react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { apiClient } from '../services/api';

const ProfilePage = ({ onLoginPromptModalOpen }) => {
  const toast = useToast();
  const {
    currentProfileUsername, setCurrentProfileUsername,
    currentProfileEmail, setCurrentProfileEmail,
    profileLoading, setProfileLoading,
    isGuest, handleLogout, fetchProfile,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword
  } = useAuthContext();

  const cardBg = useColorModeValue('white', 'premiumDark.800');
  const headingColor = useColorModeValue('gray.900', 'text.heading');
  const textColor = useColorModeValue('gray.600', 'text.dark');

  const [profileFormLoading, setProfileFormLoading] = useState(false);
  const [passwordFormLoading, setPasswordFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (isGuest) return onLoginPromptModalOpen();

    // Example simple client-side validation
    if (!currentProfileUsername.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentProfileEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setProfileFormLoading(true);
    try {
      await apiClient.put(`/users/me/`, { username: currentProfileUsername, email: currentProfileEmail });
      await fetchProfile();
      setSuccess('Profile updated successfully!');
      toast({ title: 'Profile Updated.', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      let msg = 'Failed to update profile. Please try again.';
      if (err.response?.data?.username) msg = `Username error: ${err.response.data.username.join(', ')}`;
      else if (err.response?.data?.email) msg = `Email error: ${err.response.data.email.join(', ')}`;
      else if (err.response?.status === 401) { handleLogout(); msg = 'Session expired. Please log in again.'; }
      setError(msg);
      toast({ title: 'Update Failed.', description: msg, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setProfileFormLoading(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (isGuest) return onLoginPromptModalOpen();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setPasswordFormLoading(true);
    try {
      await apiClient.post(`/change-password/`, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password Changed.', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      let msg = 'Failed to change password. Please try again.';
      if (err.response?.data?.old_password) msg = `Old password error: ${err.response.data.old_password.join(', ')}`;
      else if (err.response?.data?.new_password) msg = `New password error: ${err.response.data.new_password.join(', ')}`;
      else if (err.response?.data?.detail) msg = err.response.data.detail;
      setError(msg);
      toast({ title: 'Password Change Failed.', description: msg, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setPasswordFormLoading(false);
    }
  };

  const toggleShow = (field) => setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <Box p={{ base: 4, md: 8 }} maxWidth="container.lg" mx="auto">
      <Heading size="xl" mb="8" color={headingColor}>User Profile</Heading>

      {error && <Alert status="error" borderRadius="md" mb="4"><AlertIcon /><Text>{error}</Text></Alert>}
      {success && <Alert status="success" borderRadius="md" mb="4"><AlertIcon /><Text>{success}</Text></Alert>}

      {profileLoading ? (
        <Flex justify="center" align="center" height="200px" gap={4}>
          <Spinner size="xl" color="brand.500" /><Text color={textColor}>Loading profile...</Text>
        </Flex>
      ) : (
        <>
          {/* Profile Info */}
          <Card bg={cardBg} boxShadow="xl" borderRadius="xl" mb="8">
            <CardHeader><Heading size="md" color={headingColor}>Profile Information</Heading></CardHeader>
            <CardBody>
              <VStack spacing="4" as="form" onSubmit={handleProfileUpdate}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Username</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><User color="gray.400" size="1.2em" /></InputLeftElement>
                    <Input value={currentProfileUsername || ''} onChange={(e) => setCurrentProfileUsername(e.target.value)} isReadOnly={isGuest} />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none"><Mail color="gray.400" size="1.2em" /></InputLeftElement>
                    <Input type="email" value={currentProfileEmail || ''} onChange={(e) => setCurrentProfileEmail(e.target.value)} isReadOnly={isGuest} />
                  </InputGroup>
                </FormControl>
                <Button type="submit" colorScheme="purple" width="full" isLoading={profileFormLoading} isDisabled={isGuest}>Update Profile</Button>
                {isGuest && <Text fontSize="sm" color="text.subtle">Login to update your profile.</Text>}
              </VStack>
            </CardBody>
          </Card>

          <Divider my="8" />

          {/* Change Password */}
          <Card bg={cardBg} boxShadow="xl" borderRadius="xl">
            <CardHeader><Heading size="md" color={headingColor}>Change Password</Heading></CardHeader>
            <CardBody>
              <VStack spacing="4" as="form" onSubmit={onChangePassword}>
                {['old', 'new', 'confirm'].map((field) => (
                  <FormControl key={field} isRequired>
                    <FormLabel color={textColor}>
                      {field === 'old' ? 'Old Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none"><Lock color="gray.400" size="1.2em" /></InputLeftElement>
                      <Input
                        type={showPasswords[field] ? 'text' : 'password'}
                        value={
                          field === 'old'
                            ? oldPassword
                            : field === 'new'
                            ? newPassword
                            : confirmPassword
                        }
                        onChange={(e) =>
                          field === 'old'
                            ? setOldPassword(e.target.value)
                            : field === 'new'
                            ? setNewPassword(e.target.value)
                            : setConfirmPassword(e.target.value)
                        }
                        isDisabled={isGuest}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label={showPasswords[field] ? 'Hide password' : 'Show password'}
                          icon={showPasswords[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                          onClick={() => toggleShow(field)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                ))}
                <Button type="submit" colorScheme="purple" width="full" isLoading={passwordFormLoading} isDisabled={isGuest}>Change Password</Button>
                {isGuest && <Text fontSize="sm" color="text.subtle">Login to change your password.</Text>}
              </VStack>
            </CardBody>
          </Card>
        </>
      )}
    </Box>
  );
};

export default ProfilePage;
