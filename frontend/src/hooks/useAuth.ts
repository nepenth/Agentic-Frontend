import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import type { RootState, AppDispatch } from '../store';
import { loginUser, logoutUser, checkAuthStatus, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Check if user is already authenticated on app start
    // Only run if we're not already loading and not authenticated
    if (!isAuthenticated && !isLoading) {
      // Add error handling to prevent app crashes
      try {
        dispatch(checkAuthStatus()).catch((error) => {
          console.warn('Auth check failed, user will need to login:', error);
          // Don't throw - just let the user go to login
        });
      } catch (error) {
        console.warn('Auth check error:', error);
      }
    }
  }, [dispatch, isAuthenticated, isLoading]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await dispatch(loginUser({ username, password }));
    return result.type === 'auth/loginUser/fulfilled';
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearAuthError,
  };
};