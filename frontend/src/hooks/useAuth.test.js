// src/hooks/useAuth.test.js
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock useToast from Chakra UI
jest.mock('@chakra-ui/react', () => ({
  useToast: () => jest.fn(),
}));

// Mock apiClient and setTokens
const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('../services/api', () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
  setTokens: jest.fn(),
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('initial state when no tokens in localStorage', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.token).toBe('');
    expect(result.current.username).toBe('');
    expect(result.current.isGuest).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('handleGuestLogin sets guest mode correctly', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.handleGuestLogin();
    });

    expect(result.current.isGuest).toBe(true);
    expect(result.current.username).toBe('Guest');
    expect(localStorage.getItem('isGuest')).toBe('true');
  });

  test('handleLogout clears tokens and resets state', () => {
    localStorage.setItem('accessToken', 'abc123');
    localStorage.setItem('username', 'TestUser');

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.handleLogout();
    });

    expect(result.current.token).toBe('');
    expect(result.current.username).toBe('');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  test('fetchProfile sets error if not authenticated and not guest', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.fetchProfile();
    });

    expect(result.current.profileError).toBe('Please log in to view your profile.');
  });

  test('handleLogin stores tokens and calls fetchProfile', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        access: 'mockAccess',
        refresh: 'mockRefresh',
        email: 'test@example.com',
      },
    });
    mockGet.mockResolvedValueOnce({
      data: { username: 'TestUser', email: 'test@example.com' },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.handleLogin('TestUser', 'password123');
    });

    expect(result.current.username).toBe('TestUser');
    expect(result.current.profileEmail).toBe('test@example.com');
    expect(localStorage.getItem('accessToken')).toBe('mockAccess');
  });
});
