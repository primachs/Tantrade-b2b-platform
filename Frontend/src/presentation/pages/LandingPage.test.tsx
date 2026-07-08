import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders hero content', () => {
    render(<LandingPage onGetStarted={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'TanTrade B2B Platform' })).toBeInTheDocument();
    expect(screen.getByText('Primary Entity Management')).toBeInTheDocument();
  });

  it('calls onGetStarted when Get Started is clicked', () => {
    const onGetStarted = vi.fn();
    render(<LandingPage onGetStarted={onGetStarted} />);
    const btn = screen.getByRole('button', { name: 'Get Started' });
    fireEvent.click(btn);
    expect(onGetStarted).toHaveBeenCalledOnce();
  });
});
