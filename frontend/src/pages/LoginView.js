// src/pages/LoginView.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Flex,
  Card,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  FormControl,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Button,
  Link,
  useColorModeValue,
  AlertIcon,
  CloseButton,
  IconButton,
} from '@chakra-ui/react';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import * as THREE from 'three';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const LoginView = () => {
  const navigate = useNavigate();
  const {
    username, setUsername,
    password, setPassword,
    error, successMessage,
    clearAllErrors, clearSuccessMessage,
    handleLogin, handleRegister, handleGuestLogin,
    isAuthenticated, isGuest, loading
  } = useAuthContext();

  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mountRef = useRef(null);

  // Three.js particle background
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x805ad5,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.0001;
      particles.rotation.x += 0.00005;
      particles.position.z = Math.sin(Date.now() * 0.0001) * 2;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Reset form when toggling
  useEffect(() => {
    setUsername('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
    clearAllErrors();
    clearSuccessMessage();
  }, [isRegister, clearAllErrors, clearSuccessMessage, setUsername, setPassword]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated || isGuest) navigate('/dashboard');
  }, [isAuthenticated, isGuest, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      handleRegister(username, password, email, confirmPassword);
    } else {
      handleLogin(username, password);
    }
  };

  // Styling props
  const bgColor = useColorModeValue('gray.50','dark.900');
  const cardBg = useColorModeValue('rgba(255,255,255,0.15)','rgba(26,32,44,0.6)');
  const textColor = useColorModeValue('gray.700','gray.200');
  const inputBg = useColorModeValue('rgba(255,255,255,0.1)','rgba(255,255,255,0.05)');
  const inputBorder = useColorModeValue('rgba(255,255,255,0.2)','rgba(255,255,255,0.1)');
  const focusBorder = useColorModeValue('purple.300','purple.500');
  const placeholderColor = useColorModeValue('gray.400','gray.500');
  const btnBg = useColorModeValue('whiteAlpha.900','whiteAlpha.200');
  const btnHover = useColorModeValue('gray.200','whiteAlpha.300');
  const cardBorder = useColorModeValue('1px solid rgba(255,255,255,0.3)','1px solid rgba(255,255,255,0.1)');
  const cardShadow = useColorModeValue('0 8px 32px rgba(31,38,135,0.37)','0 8px 32px rgba(0,0,0,0.37)');
  const cardHover = useColorModeValue('0 16px 64px rgba(31,38,135,0.5)','0 16px 64px rgba(0,0,0,0.5)');

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor} p={6} position="relative" overflow="hidden">
      <div
        ref={mountRef}
        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }}
      />
      <Card
        p={4}
        maxW="360px" w="full"
        bg={cardBg}
        borderRadius="2xl"
        backdropFilter="blur(10px)"
        border={cardBorder}
        boxShadow={cardShadow}
        _hover={{ boxShadow:cardHover }}
        transition="all 0.3s ease"
        zIndex={1}
      >
        <VStack as="form" onSubmit={handleSubmit} spacing={4}>
          {/* Toggle */}
          <HStack w="full">
            <Button
              flex={1}
              variant={isRegister?"solid":"ghost"}
              colorScheme={isRegister?"purple":"gray"}
              onClick={()=>setIsRegister(true)}
              _hover={{bg:isRegister?"purple.600":"gray.700",color:"white"}}
            >Sign up</Button>
            <Button
              flex={1}
              variant={!isRegister?"solid":"ghost"}
              colorScheme={!isRegister?"purple":"gray"}
              onClick={()=>setIsRegister(false)}
              _hover={{bg:!isRegister?"purple.600":"gray.700",color:"white"}}
            >Sign in</Button>
          </HStack>

          <Heading size="lg" color={textColor} textAlign="center">
            {isRegister?"Create an account":"Log in to your account"}
          </Heading>
          <Text fontSize="sm" color={textColor} textAlign="center">
            {isRegister
              ?"Join us to manage your productivity."
              :"Welcome back! Enter your details below."
            }
          </Text>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon /><Text>{error}</Text>
              <CloseButton onClick={clearAllErrors}/>
            </Alert>
          )}
          {successMessage && (
            <Alert status="success" borderRadius="md">
              <AlertIcon /><Text>{successMessage}</Text>
              <CloseButton onClick={clearSuccessMessage}/>
            </Alert>
          )}

          {/* Username */}
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none"><User color={placeholderColor}/></InputLeftElement>
              <Input
                placeholder="Username"
                value={username}
                onChange={e=>setUsername(e.target.value)}
                bg={inputBg} borderColor={inputBorder}
                _hover={{borderColor:inputBorder}}
                _focus={{borderColor:focusBorder,boxShadow:'outline'}}
                _placeholder={{color:placeholderColor}}
              />
            </InputGroup>
          </FormControl>

          {/* Email */}
          {isRegister && (
            <FormControl>
              <InputGroup>
                <InputLeftElement pointerEvents="none"><Mail color={placeholderColor}/></InputLeftElement>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  bg={inputBg} borderColor={inputBorder}
                  _hover={{borderColor:inputBorder}}
                  _focus={{borderColor:focusBorder,boxShadow:'outline'}}
                  _placeholder={{color:placeholderColor}}
                />
              </InputGroup>
            </FormControl>
          )}

          {/* Password */}
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none"><Lock color={placeholderColor}/></InputLeftElement>
              <Input
                type={showPassword?"text":"password"}
                placeholder="Password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                bg={inputBg} borderColor={inputBorder}
                _hover={{borderColor:inputBorder}}
                _focus={{borderColor:focusBorder,boxShadow:'outline'}}
                _placeholder={{color:placeholderColor}}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost" size="sm"
                  icon={showPassword?<EyeOff/>:<Eye/>}
                  onClick={()=>setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Confirm Password */}
          {isRegister && (
            <FormControl>
              <InputGroup>
                <InputLeftElement pointerEvents="none"><Lock color={placeholderColor}/></InputLeftElement>
                <Input
                  type={showConfirm?"text":"password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e=>setConfirmPassword(e.target.value)}
                  bg={inputBg} borderColor={inputBorder}
                  _hover={{borderColor:inputBorder}}
                  _focus={{borderColor:focusBorder,boxShadow:'outline'}}
                  _placeholder={{color:placeholderColor}}
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost" size="sm"
                    icon={showConfirm?<EyeOff/>:<Eye/>}
                    onClick={()=>setShowConfirm(!showConfirm)}
                    aria-label="Toggle confirm password visibility"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          )}

          {/* Forgot Password */}
          {!isRegister && (
            <Text fontSize="sm" color="purple.400" textAlign="right" w="full" as={RouterLink} to="/request-password-reset">
              Forgot your password?
            </Text>
          )}

          {/* Submit */}
          <Button
            type="submit"
            w="full"
            isLoading={loading}
            bg={btnBg}
            _hover={{bg:btnHover}}
          >
            {isRegister?"Create an account":"Log in"}
          </Button>

          {/* Terms */}
          <Text fontSize="xs" color={textColor} textAlign="center">
            By creating an account you agree to{' '}
            <Link href="#" color="purple.400" onClick={e=>e.preventDefault()}>
              Terms & Service
            </Link>
          </Text>

          {/* Guest */}
          {!isRegister && (
            <Text fontSize="xs" color={textColor} textAlign="center">
              Or continue as{' '}
              <Link color="purple.400" onClick={handleGuestLogin}>
                Guest
              </Link>
            </Text>
          )}
        </VStack>
      </Card>
    </Flex>
  );
};

export default LoginView;
