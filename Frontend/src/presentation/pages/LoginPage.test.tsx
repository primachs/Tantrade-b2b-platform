import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders hero content', () => {
    render(<LandingPage onGetStarted={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Find verified buyers and sellers, faster.' })).toBeInTheDocument();
    expect(screen.getByText('Register your business')).toBeInTheDocument();
  });

  it('calls onGetStarted when Get started free is clicked', () => {
    const onGetStarted = vi.fn();
    render(<LandingPage onGetStarted={onGetStarted} />);
    const btn = screen.getByRole('button', { name: 'Get started free' });
    fireEvent.click(btn);
    expect(onGetStarted).toHaveBeenCalledOnce();
  });
});