import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrandHeader } from './BrandHeader';

describe('BrandHeader', () => {
  it('renders branding elements', () => {
    render(<BrandHeader onLogoClick={vi.fn()} />);
    expect(screen.getByAltText('Tanzania coat of arms')).toBeInTheDocument();
    expect(screen.getByAltText('TanTrade logo')).toBeInTheDocument();
    expect(screen.getByText('Tanzania Trade Development Authority')).toBeInTheDocument();
  });

  it('renders Sign In button if no user is provided', () => {
    const onLoginClick = vi.fn();
    render(<BrandHeader onLogoClick={vi.fn()} onLoginClick={onLoginClick} />);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    
    fireEvent.click(signInButton);
    expect(onLoginClick).toHaveBeenCalledOnce();
  });

  it('does not render Sign In button if onLoginClick is undefined', () => {
    render(<BrandHeader onLogoClick={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('renders user info and Sign out button if userName is provided', () => {
    const onLogout = vi.fn();
    render(
      <BrandHeader 
        userName="John Doe" 
        userEmail="john@example.com" 
        userRoles={['ADMIN', 'BUYER']} 
        onLogout={onLogout} 
        onLogoClick={vi.fn()} 
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.queryByText('BUYER')).not.toBeInTheDocument(); // Excluded by logic
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('calls onLogoClick when coat of arms is clicked', () => {
    const onLogoClick = vi.fn();
    render(<BrandHeader onLogoClick={onLogoClick} />);
    
    // The coat of arms image is wrapped in a link
    const link = screen.getByAltText('Tanzania coat of arms').closest('a');
    fireEvent.click(link!);
    expect(onLogoClick).toHaveBeenCalledOnce();
  });
});
