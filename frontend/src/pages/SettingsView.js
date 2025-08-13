// src/pages/SettingsView.js
import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  Icon,
  useColorMode,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Divider,
  HStack,
  Alert,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import {
  Bell,
  Moon,
  HelpCircle,
} from 'lucide-react';

const SettingsView = ({ isGuest, onLoginPromptModal }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  // Color tokens for glassmorphism look
  const bg = useColorModeValue('gray.50', 'dark.900');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.6)');
  const headingColor = useColorModeValue('gray.900', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardHeaderColor = useColorModeValue('gray.800', 'whiteAlpha.800');
  const cardBorder = useColorModeValue('1px solid rgba(255, 255, 255, 0.3)', '1px solid rgba(255, 255, 255, 0.1)');
  const cardShadow = useColorModeValue(
    '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  );
  const cardHoverShadow = useColorModeValue(
    '0 16px 64px 0 rgba(31, 38, 135, 0.5)',
    '0 16px 64px 0 rgba(0, 0, 0, 0.5)'
  );

  // Restricted action handler for guests
  const handleRestrictedAction = (_featureName) => {
    if (isGuest) {
      onLoginPromptModal?.();
      return true;
    }
    return false;
  };

  // Placeholder: Would hook up real notification state if integrated
  const onEmailToggle = () => {
    if (handleRestrictedAction('Email Notifications')) return;
    // TODO: Implement email notifications toggle functionality here!
    // e.g. setEmailNotifEnabled(prev => !prev)
  };

  const onHelpClick = () => {
    if (handleRestrictedAction('Help & Support')) return;
    // TODO: Route to /help or open support modal
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={bg}
      p={{ base: 4, md: 8 }}
      display="flex"
      justifyContent="center"
      alignItems="start"
    >
      <VStack
        maxW={{ base: '90%', sm: '480px', md: '600px' }}
        w="full"
        spacing={8}
        align="stretch"
      >
        <Heading
          as="h1"
          size="2xl"
          textAlign="center"
          color={headingColor}
          mb={2}
          userSelect="none"
        >
          Settings
        </Heading>
        <Text textAlign="center" fontSize="md" color={textColor}>
          Manage your account preferences and configure your experience.
        </Text>

        {isGuest && (
          <Alert status="info" borderRadius="md" mb={6} bg={cardBg} border={cardBorder}>
            <Text color={textColor}>
              You are currently in guest mode. Some settings are disabled.
              Please log in to manage all settings.
            </Text>
          </Alert>
        )}

        {/* General Settings */}
        <Card
          bg={cardBg}
          border={cardBorder}
          boxShadow={cardShadow}
          borderRadius="xl"
          backdropFilter="blur(10px)"
          _hover={{ boxShadow: cardHoverShadow }}
          transition="all 0.3s"
        >
          <CardHeader>
            <Heading size="md" color={cardHeaderColor}>
              General Settings
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={5} align="stretch">
              {/* Email Notifications */}
              <FormControl
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                isDisabled={isGuest}
              >
                <HStack spacing={3}>
                  <Icon as={Bell} color="purple.400" boxSize={5} />
                  <FormLabel htmlFor="email-notif" mb={0} color={textColor} userSelect="none">
                    Enable Email Notifications
                  </FormLabel>
                </HStack>
                <Tooltip label={isGuest ? "Log in to enable notifications" : "Toggle email notifications"} openDelay={250}>
                  <Switch
                    id="email-notif"
                    colorScheme="purple"
                    isDisabled={isGuest}
                    onChange={onEmailToggle}
                    aria-label="Toggle Email Notifications"
                  />
                </Tooltip>
              </FormControl>

              <Divider borderColor={cardBorder} />

              {/* Dark Mode */}
              <FormControl
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                isDisabled={isGuest}
              >
                <HStack spacing={3}>
                  <Icon as={Moon} color="purple.400" boxSize={5} />
                  <FormLabel htmlFor="dark-mode" mb={0} color={textColor} userSelect="none">
                    Dark Mode
                  </FormLabel>
                </HStack>
                <Tooltip label={isGuest ? "Log in to change theme" : "Toggle dark/light mode"} openDelay={250}>
                  <Switch
                    id="dark-mode"
                    colorScheme="purple"
                    isChecked={colorMode === 'dark'}
                    onChange={toggleColorMode}
                    isDisabled={isGuest}
                    aria-label="Toggle Dark Mode"
                  />
                </Tooltip>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Help & Support */}
        <Card
          bg={cardBg}
          border={cardBorder}
          boxShadow={cardShadow}
          borderRadius="xl"
          backdropFilter="blur(10px)"
          _hover={{ boxShadow: cardHoverShadow }}
          transition="all 0.3s"
        >
          <CardHeader>
            <Heading size="md" color={cardHeaderColor}>
              Help & Support
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch" textAlign="center">
              <Text color={textColor} fontSize="md">
                Need assistance? Our support team is here to help you with any questions or issues.
              </Text>

              <Tooltip label={isGuest ? "Log in to access support" : "Get help"} openDelay={250}>
                <Button
                  leftIcon={<HelpCircle />}
                  colorScheme="purple"
                  onClick={onHelpClick}
                  isDisabled={isGuest}
                  aria-label="Open Help and Support"
                  tabIndex={0}
                >
                  Get Help
                </Button>
              </Tooltip>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default SettingsView;
