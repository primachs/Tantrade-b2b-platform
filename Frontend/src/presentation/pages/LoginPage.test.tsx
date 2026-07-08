import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  const defaultProps = {
    token: '',
    selectedService: null as any,
    onLogin: vi.fn().mockResolvedValue(true),
    onRegister: vi.fn().mockResolvedValue(true),
    onContinueToDashboard: vi.fn(),
    loading: false,
    error: null,
    onClearError: vi.fn(),
  };

  it('renders login form by default', () => {
    render(<LoginPage {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@tantrade.go.tz')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('switches to register form', () => {
    render(<LoginPage {...defaultProps} />);
    const registerTab = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(registerTab);
    
    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Asha Mwakalobo')).toBeInTheDocument();
  });

  it('submits login form and shows success notice', async () => {
    render(<LoginPage {...defaultProps} />);
    
    const emailInput = screen.getByPlaceholderText('name@tantrade.go.tz');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getAllByRole('button', { name: 'Sign in' })[1];

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    expect(defaultProps.onLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    
    await waitFor(() => {
      expect(screen.getByText('Session kept on this device.')).toBeInTheDocument();
    });
  });

  it('submits register form and shows success notice', async () => {
    render(<LoginPage {...defaultProps} />);
    
    // Switch to register tab
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    const nameInput = screen.getByPlaceholderText('Asha Mwakalobo');
    const emailInput = screen.getAllByPlaceholderText('name@tantrade.go.tz')[1] || screen.getByPlaceholderText('name@tantrade.go.tz');
    const passInput = screen.getByPlaceholderText('Minimum 12 characters');
    const confirmInput = screen.getByPlaceholderText('Repeat the password');
    const submitBtn = screen.getByRole('button', { name: 'Create account & continue' });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    expect(defaultProps.onRegister).toHaveBeenCalledWith(
      'Test User',
      'new@example.com',
      'password123',
      'password123',
      undefined
    );

    await waitFor(() => {
      expect(screen.getByText('Account created. Taking you to your dashboard…')).toBeInTheDocument();
    });
  });

  it('shows error notice if passwords do not match during registration', async () => {
    render(<LoginPage {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    fireEvent.change(screen.getByPlaceholderText('Minimum 12 characters'), { target: { value: 'pass1' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat the password'), { target: { value: 'pass2' } });
    const form = screen.getByRole('button', { name: 'Create account & continue' }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('renders continue to dashboard button when userName is present', () => {
    render(<LoginPage {...defaultProps} userName="Logged In User" />);
    const continueBtn = screen.getByRole('button', { name: 'Continue to dashboard' });
    expect(continueBtn).toBeInTheDocument();
    
    fireEvent.click(continueBtn);
    expect(defaultProps.onContinueToDashboard).toHaveBeenCalledOnce();
  });
});
