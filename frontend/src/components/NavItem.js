// src/components/NavItem.js
import React, { useCallback } from 'react';
import { Button, Flex, useColorModeValue, Text, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

/**
 * NavItem
 * Universal navigation button with optional icon, label/text, logout handler, and route navigation.
 *
 * Props:
 * - icon: React component (icon)
 * - to: string route path
 * - label / children: text to display
 * - onClick: callback when clicked (runs after navigation)
 * - handleLogout: function if this item is logout/exit
 * - closeDrawer: optional function to close mobile drawer after click
 * - isActive: boolean to highlight active item
 * - extra: right-aligned extra element (badge, count, etc.)
 * - color: override text/icon color
 */
const NavItem = ({
  icon: IconCmp,
  to,
  label,
  children,
  onClick,
  handleLogout,
  closeDrawer,
  color,
  extra,
  isActive,
  ...props
}) => {
  const navigate = useNavigate();

  const defaultColor = useColorModeValue('gray.200', 'gray.300');
  const activeColor = useColorModeValue('cyan.400', 'cyan.300');
  const hoverBg = useColorModeValue('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.1)');
  const bgActive = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.2)');

  const displayText = label || children || '';

  const clickHandler = useCallback(() => {
    if (handleLogout) {
      handleLogout();
      if (closeDrawer) closeDrawer();
      return;
    }
    if (to) {
      navigate(to.startsWith('/') ? to : `/${to}`);
    }
    if (onClick) onClick();
    if (closeDrawer) closeDrawer();
  }, [handleLogout, closeDrawer, to, onClick, navigate]);

  return (
    <Button
      variant="unstyled"
      onClick={clickHandler}
      color={color || (isActive ? activeColor : defaultColor)}
      bg={isActive ? bgActive : 'transparent'}
      _hover={{
        bg: hoverBg,
        color: activeColor,
        transform: 'scale(1.05)',
      }}
      _active={{
        bg: bgActive,
        color: activeColor,
        transform: 'scale(1.03)',
      }}
      transition="all 0.2s ease"
      borderRadius="lg"
      w="full"
      px={4}
      py={3}
      textAlign="left"
      aria-label={typeof displayText === 'string' ? displayText : undefined}
      {...props}
    >
      <Flex align="center" gap={4} w="full" position="relative">
        {IconCmp && (
          <Box
            as={IconCmp}
            boxSize={5}
            color={isActive ? activeColor : defaultColor}
            aria-hidden="true"
            flexShrink={0}
            transition="color 0.2s ease"
          />
        )}
        <Text fontWeight="semibold" fontSize="md" noOfLines={1} userSelect="none" flex="1">
          {displayText}
        </Text>
        {extra && (
          <Box
            as="span"
            ml="auto"
            fontSize="sm"
            color={isActive ? activeColor : defaultColor}
            userSelect="none"
          >
            {extra}
          </Box>
        )}
      </Flex>
    </Button>
  );
};

export default NavItem;
