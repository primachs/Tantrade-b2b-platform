import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders hero content', () => {
    render(<LandingPage onGetStarted={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'TanTrade National B2B Platform' })).toBeInTheDocument();
    expect(screen.getByText('Register your business')).toBeInTheDocument();
  });

  it('calls onGetStarted when Get started is clicked', () => {
    const onGetStarted = vi.fn();
    render(<LandingPage onGetStarted={onGetStarted} />);
    const btn = screen.getByRole('button', { name: 'Get started' });
    fireEvent.click(btn);
    expect(onGetStarted).toHaveBeenCalledOnce();
  });
});