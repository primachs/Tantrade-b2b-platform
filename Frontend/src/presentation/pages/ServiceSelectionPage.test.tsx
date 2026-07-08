import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceSelectionPage } from './ServiceSelectionPage';

describe('ServiceSelectionPage', () => {
  const defaultProps = {
    onSelectService: vi.fn(),
    onSignIn: vi.fn(),
    onBack: vi.fn(),
  };

  it('renders headers and cards', () => {
    render(<ServiceSelectionPage {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Choose your service' })).toBeInTheDocument();
    expect(screen.getByText('B2B Matchmaking Platform')).toBeInTheDocument();
    expect(screen.getByText('Broker Management System')).toBeInTheDocument();
  });

  it('renders setup mode headers when setupMode is true', () => {
    render(<ServiceSelectionPage {...defaultProps} setupMode={true} />);
    expect(screen.getByRole('heading', { name: 'Complete your account setup' })).toBeInTheDocument();
  });

  it('calls onSelectService with matching when Matchmaking CTA is clicked', () => {
    render(<ServiceSelectionPage {...defaultProps} />);
    const matchBtn = screen.getByRole('button', { name: 'Get started with Matchmaking' });
    fireEvent.click(matchBtn);
    expect(defaultProps.onSelectService).toHaveBeenCalledWith('matching');
  });

  it('calls onSelectService with governance when Governance CTA is clicked', () => {
    render(<ServiceSelectionPage {...defaultProps} />);
    const govBtn = screen.getByRole('button', { name: 'Get started with Governance' });
    fireEvent.click(govBtn);
    expect(defaultProps.onSelectService).toHaveBeenCalledWith('governance');
  });

  it('calls onBack when Back to home is clicked', () => {
    render(<ServiceSelectionPage {...defaultProps} />);
    const backBtn = screen.getByRole('button', { name: /Back to home/i });
    fireEvent.click(backBtn);
    expect(defaultProps.onBack).toHaveBeenCalledOnce();
  });

  it('calls onSignIn when Sign in instead is clicked', () => {
    render(<ServiceSelectionPage {...defaultProps} />);
    const signinBtn = screen.getByRole('button', { name: 'Sign in instead' });
    fireEvent.click(signinBtn);
    expect(defaultProps.onSignIn).toHaveBeenCalledOnce();
  });
});
