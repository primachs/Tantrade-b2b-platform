import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as client from '../../api/client';

vi.mock('../../api/client', () => ({
  apiRequest: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
    }
  }
}));

describe('useAuth hook', () => {
  const mockUser = { id: '1', name: 'Test', email: 'test@example.com', roles: [] };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with no user if token is missing', async () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.token).toBe('');
    expect(result.current.user).toBeNull();
    expect(result.current.ready).toBe(true);
  });

  it('loads user profile if token is present in localStorage', async () => {
    localStorage.setItem('tantrade_token', 'valid-token');
    vi.mocked(client.apiRequest).mockResolvedValue(mockUser);

    const { result, rerender } = renderHook(() => useAuth());
    
    // Initially not ready while loading
    expect(result.current.ready).toBe(false);
    
    // Wait for effect to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(client.apiRequest).toHaveBeenCalledWith('/auth/me', { token: 'valid-token' });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.ready).toBe(true);
  });

  it('handles login success', async () => {
    vi.mocked(client.apiRequest).mockImplementation(async (path) => {
      if (path === '/auth/login') return { token: 'new-token', user: mockUser };
      if (path === '/auth/me') return mockUser;
      return {};
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.login('test@example.com', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.token).toBe('new-token');
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('tantrade_token')).toBe('new-token');
  });

  it('handles logout', async () => {
    localStorage.setItem('tantrade_token', 'token-to-remove');
    vi.mocked(client.apiRequest).mockResolvedValue({}); // mock me
    
    const { result } = renderHook(() => useAuth());
    
    // Set up state via mock first
    act(() => {
      result.current.login('test', 'test'); // Fake login to populate state if we didn't wait for init
    });
    
    vi.mocked(client.apiRequest).mockResolvedValueOnce({}); // mock logout

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.token).toBe('');
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('tantrade_token')).toBeNull();
  });

  it('needsServiceSelection returns true if user has no roles', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.needsServiceSelection(mockUser)).toBe(true);
  });

  it('needsServiceSelection returns false if user is ADMIN', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.needsServiceSelection({ ...mockUser, roles: ['ADMIN'] })).toBe(false);
  });
});
