import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/contexts/AuthContext';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    const { container } = render(<AuthButton />);
    
    const loadingElements = container.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('shows sign in button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    render(<AuthButton />);
    
    const signInButton = screen.getByRole('button', { name: /sign in with google/i });
    expect(signInButton).toBeInTheDocument();
  });

  it('shows user profile and sign out button when authenticated', () => {
    const mockUser = {
      id: 'test-uid',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/photo.jpg',
      },
    } as any;

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    render(<AuthButton />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
  });

  it('calls signInWithGoogle when sign in button is clicked', async () => {
    const mockSignInWithGoogle = jest.fn().mockResolvedValue({});

    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: mockSignInWithGoogle,
      signOut: jest.fn(),
    });

    render(<AuthButton />);
    
    const signInButton = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  it('calls signOut when sign out button is clicked', async () => {
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    const mockUser = {
      id: 'test-uid',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
      },
    } as any;

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
    });

    render(<AuthButton />);
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it('displays user initial when no avatar URL is provided', () => {
    const mockUser = {
      id: 'test-uid',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
      },
    } as any;

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    render(<AuthButton />);
    
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders compact variant without user name', () => {
    const mockUser = {
      id: 'test-uid',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
      },
    } as any;

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    });

    render(<AuthButton variant="compact" />);
    
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
