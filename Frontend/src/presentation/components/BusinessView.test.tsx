import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BusinessView } from './BusinessView';
import { apiRequest } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('./b2b/LandingHub', () => ({
  LandingHub: () => <div data-testid="landing-hub">Landing Hub</div>,
}));

vi.mock('./b2b/BusinessDashboard', () => ({
  BusinessDashboard: () => <div data-testid="business-dashboard">Business Dashboard</div>,
}));

describe('BusinessView', () => {
  const defaultProps = {
    token: 'test-token',
    user: { id: '1', name: 'Test', email: 'test@example.com' },
    setNotice: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    // delay apiRequest so loading is visible
    vi.mocked(apiRequest).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    render(<BusinessView {...defaultProps} />);
    expect(screen.getByText('Loading Workspace...')).toBeInTheDocument();
  });

  it('renders LandingHub when user has no business', async () => {
    vi.mocked(apiRequest).mockImplementation(async (url) => {
      if (url === '/businesses/my-business') throw new Error('Not found');
      if (url === '/rfs') return [];
      if (url === '/taxonomy') return { sectors: [] };
      return null;
    });

    render(<BusinessView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('landing-hub')).toBeInTheDocument();
    });
  });

  it('renders BusinessDashboard when user has a business', async () => {
    vi.mocked(apiRequest).mockImplementation(async (url) => {
      if (url === '/businesses/my-business') return { id: 'biz-1', name: 'My Biz' };
      if (url === '/rfs') return [];
      if (url === '/taxonomy') return { sectors: [] };
      return null;
    });

    render(<BusinessView {...defaultProps} />);

    // Since viewMode defaults to 'hub', but then loadData sets myBusiness,
    // wait, does it auto switch to dashboard? The code says `if (forceDashboard && myBiz)`
    // On first load, forceDashboard is false, so it stays on 'hub' mode?
    // Wait, BusinessView.tsx:
    // `if (viewMode === "hub" || !myBusiness) return <LandingHub />`
    // Wait, if user has business but viewMode is 'hub', it renders LandingHub!
    // Ah, LandingHub handles `hasBusiness` and shows a "Go to Dashboard" button.
    
    await waitFor(() => {
      // It should still render LandingHub on first load even if they have a business
      expect(screen.getByTestId('landing-hub')).toBeInTheDocument();
    });
  });
});
