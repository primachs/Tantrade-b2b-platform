import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test error from child');
};

describe('ErrorBoundary', () => {
  it('renders children if no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Happy Child</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws error', () => {
    // Suppress console.error output during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getAllByText(/Test error from child/i).length).toBeGreaterThan(0);
    
    consoleSpy.mockRestore();
  });
});
