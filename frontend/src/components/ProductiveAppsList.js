import React from 'react';
import { Box, Text, Stack, Flex, Badge, useColorModeValue } from '@chakra-ui/react';
import { Monitor } from 'lucide-react';

const ProductiveAppsList = ({ productiveApps }) => {
  const glassBg = useColorModeValue(
    "linear-gradient(120deg,rgba(255,255,255,0.22) 80%,rgba(120,255,244,0.08) 100%)",
    "linear-gradient(108deg,rgba(32,40,56,0.45) 80%,rgba(70,220,255,0.11) 100%)"
  );
  const borderCol = useColorModeValue("rgba(0,255,255,0.10)", "rgba(14,240,255,0.14)");
  const cardShadow = useColorModeValue("0 4px 18px #22d3ee19", "0 6px 16px #16f7ff44");
  const iconColor = useColorModeValue("teal.400", "teal.200");
  const textColor = useColorModeValue("#143241", "#c3f9fd");
  const badgeGlow = useColorModeValue("#2be4eb77", "#50ffeb83");

  return (
    <Box
      p={6}
      bg={glassBg}
      borderRadius="2xl"
      boxShadow={cardShadow}
      border="1.5px solid"
      borderColor={borderCol}
      backdropFilter="blur(14px)"
      minW={{ base: "90%", sm: "300px" }}
      maxW="340px"
      maxH="380px"
      display="flex"
      flexDirection="column"
      ml={{ base: 0, md: "8px" }}
      transition="all .23s cubic-bezier(.4,1.9,.5,1.02)"
    >
      <Text
        fontSize="xl"
        fontWeight={900}
        letterSpacing="wide"
        mb={4}
        color={iconColor}
        textShadow="0 1px 10px #22d3ee13"
      >
        Most Productive Apps
      </Text>
      <Stack spacing={4} flex="1" overflowY="auto">
        {productiveApps && productiveApps.length > 0 ? (
          productiveApps.map((app, idx) => (
            <Flex
              key={idx}
              align="center"
              justify="space-between"
              py={1.5}
              px={1}
              borderRadius="lg"
              _hover={{
                bg: "rgba(80, 244, 255, .10)",
                backdropFilter: "blur(2px)",
                transform: "scale(1.018)",
                transition: "all .2s cubic-bezier(.42,2,.4,1.2)"
              }}
            >
              <Flex align="center" gap={2}>
                <Box
                  as={Monitor}
                  size={20}
                  color={iconColor}
                  mr={1}
                  filter="drop-shadow(0 2px 10px #16fafa44)"
                />
                <Text color={textColor} fontWeight="medium" fontSize="md">
                  {app.name}
                </Text>
              </Flex>
              <Badge
                px={3}
                py={1}
                fontSize="sm"
                borderRadius="full"
                colorScheme="teal"
                bg="#2be4ebdc"
                boxShadow={`0 0 6px 0 ${badgeGlow}`}
                fontWeight="bold"
                style={{ letterSpacing: "0.5px" }}
              >
                {app.minutes} min
              </Badge>
            </Flex>
          ))
        ) : (
          <Text color={textColor} opacity={0.6} fontStyle="italic" fontWeight={500}>
            No productive app data yet.
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default ProductiveAppsList;
