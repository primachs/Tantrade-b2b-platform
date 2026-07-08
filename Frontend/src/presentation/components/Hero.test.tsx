import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  const defaultProps = {
    apiBaseInput: 'http://localhost/api',
    apiBase: 'http://localhost/api',
    token: 'test-token',
    authEmail: 'admin@test.com',
    authName: 'Admin User',
    onApiBaseChange: vi.fn(),
    onTokenChange: vi.fn(),
    onClearToken: vi.fn(),
  };

  it('renders copy and active identity', () => {
    render(<Hero {...defaultProps} />);
    expect(screen.getByText('Government Trade Enablement Console')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('calls onApiBaseChange on input change', () => {
    render(<Hero {...defaultProps} />);
    const apiInput = screen.getByPlaceholderText('http://localhost:8000/api');
    fireEvent.change(apiInput, { target: { value: 'https://newapi.com/api' } });
    expect(defaultProps.onApiBaseChange).toHaveBeenCalledWith('https://newapi.com/api');
  });

  it('calls onTokenChange on input change', () => {
    render(<Hero {...defaultProps} />);
    const tokenInput = screen.getByPlaceholderText('Paste token here');
    fireEvent.change(tokenInput, { target: { value: 'new-token' } });
    expect(defaultProps.onTokenChange).toHaveBeenCalledWith('new-token');
  });

  it('calls onClearToken when button is clicked', () => {
    render(<Hero {...defaultProps} />);
    const clearButton = screen.getByRole('button', { name: /clear token/i });
    fireEvent.click(clearButton);
    expect(defaultProps.onClearToken).toHaveBeenCalledOnce();
  });
});
