// src/pages/NotFoundPage.js

import React from 'react';
import { Box, Heading, Text, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  const bgColor = useColorModeValue('white', 'premiumDark.900');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const headingColor = useColorModeValue('purple.500', 'purple.300');
  const buttonHoverBg = useColorModeValue('purple.600', 'purple.400');

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      p={8}
      bg={bgColor}
      textAlign="center"
    >
      <Box p={8} bg="premiumDark.800" borderRadius="2xl" boxShadow="xl" maxW="lg">
        <Heading
          fontSize={{ base: '6xl', md: '8xl' }}
          fontWeight="extrabold"
          color={headingColor}
          mb={4}
        >
          404
        </Heading>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="semibold" color={textColor} mb={6}>
          Page Not Found
        </Text>
        <Text fontSize="lg" color={textColor} opacity={0.8} mb={10}>
          Oops! It seems the page you are looking for does not exist.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          leftIcon={<Home size={20} />}
          colorScheme="purple"
          size="lg"
          px={8}
          py={6}
          borderRadius="full"
          boxShadow="lg"
          _hover={{
            bg: buttonHoverBg,
            boxShadow: 'xl',
            transform: 'translateY(-2px)',
          }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Flex>
  );
};

export default NotFoundPage;
