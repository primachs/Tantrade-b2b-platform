import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as authHook from './modules/auth/useAuth';

// Mock presentation pages to simplify testing App logic
vi.mock('./presentation/components/BrandHeader', () => ({
  BrandHeader: ({ onLogoClick, onLoginClick }: any) => (
    <div data-testid="brand-header">
      BrandHeader
      <button onClick={onLogoClick}>Logo</button>
      <button onClick={onLoginClick}>Sign In</button>
    </div>
  )
}));
vi.mock('./presentation/pages/LandingPage', () => ({
  LandingPage: ({ onGetStarted }: any) => (
    <div data-testid="landing-page">
      <button onClick={onGetStarted}>Get Started</button>
    </div>
  )
}));
vi.mock('./presentation/pages/ServiceSelectionPage', () => ({
  ServiceSelectionPage: ({ onSelectService }: any) => (
    <div data-testid="service-selection-page">
      <button onClick={() => onSelectService('matching')}>Select Matching</button>
    </div>
  )
}));
vi.mock('./presentation/pages/LoginPage', () => ({
  LoginPage: ({ onContinueToDashboard }: any) => (
    <div data-testid="login-page">
      <button onClick={onContinueToDashboard}>Continue</button>
    </div>
  )
}));
vi.mock('./presentation/pages/DashboardPage', () => ({
  DashboardPage: () => <div data-testid="dashboard-page">DashboardPage</div>
}));

describe('App', () => {
  const mockUseAuth = {
    token: null as string | null,
    user: null as any,
    loading: false,
    error: null,
    ready: true,
    setError: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    selectService: vi.fn().mockResolvedValue(true),
    needsServiceSelection: vi.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue(mockUseAuth as any);
  });

  it('renders landing page by default when not logged in', () => {
    render(<App />);
    expect(screen.getByTestId('brand-header')).toBeInTheDocument();
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('navigates to service select when Get Started is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Get Started'));
    expect(screen.getByTestId('service-selection-page')).toBeInTheDocument();
  });

  it('navigates to auth when a service is selected', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Get Started'));
    fireEvent.click(screen.getByText('Select Matching'));
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('navigates to auth when Sign In is clicked in header', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign In'));
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders dashboard when logged in and no service selection needed', () => {
    mockUseAuth.user = { id: '1', name: 'Test', roles: ['BUYER'] };
    mockUseAuth.token = 'test-token';
    render(<App />);
    
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('forces service setup when logged in but needs service selection', async () => {
    mockUseAuth.user = { id: '1', name: 'Test', roles: [] };
    mockUseAuth.needsServiceSelection.mockReturnValue(true);
    render(<App />);
    
    expect(screen.getByTestId('service-selection-page')).toBeInTheDocument();
    
    // Test selecting a service in setup mode
    fireEvent.click(screen.getByText('Select Matching'));
    
    await waitFor(() => {
      expect(mockUseAuth.selectService).toHaveBeenCalledWith('matching');
      // In the app it would change state and navigate to dashboard if successful
      // However the mock `selectService` won't automatically update `user.roles` or `needsServiceSelection`
      // But we can assert selectService was called.
    });
  });
});
