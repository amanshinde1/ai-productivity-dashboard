// src/components/ErrorBoundary.js

import React from 'react';
import { Box, Heading, Text, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { RefreshCcw, Home } from 'lucide-react';


const ErrorBoundaryFallbackUI = ({ error }) => {
  const bgColor = useColorModeValue('white', 'premiumDark.900');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');

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
        <Heading fontSize={{ base: '4xl', md: '5xl' }} fontWeight="bold" color="red.400" mb={4}>
          Oh no! Something went wrong.
        </Heading>
        <Text fontSize="lg" color={textColor} opacity={0.8} mb={10}>
          An unexpected error has occurred. Please try reloading the page or return to the dashboard.
        </Text>

        {/* Action Buttons */}
        <Flex direction={{ base: 'column', sm: 'row' }} gap={4} justify="center">
          <Button
            leftIcon={<RefreshCcw size={20} />}
            colorScheme="red"
            size="lg"
            px={8}
            py={6}
            borderRadius="full"
            boxShadow="lg"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>

          <Button
            leftIcon={<Home size={20} />}
            variant="outline"
            colorScheme="red"
            size="lg"
            px={8}
            py={6}
            borderRadius="full"
            boxShadow="lg"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </Flex>

        {/* Optional: Show error details in development mode for debugging */}
        {process.env.NODE_ENV === 'development' && error && (
          <Box mt={6} p={4} bg="red.900" borderRadius="md" textAlign="left">
            <Text fontSize="sm" fontWeight="bold">Error Details:</Text>
            <Text fontSize="xs" color="red.200" whiteSpace="pre-wrap">{error.toString()}</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
};



class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);


  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallbackUI error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
