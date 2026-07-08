import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';

// Mock sub-components
vi.mock('../components/BusinessView', () => ({
  BusinessView: () => <div data-testid="business-view">Business View</div>
}));

vi.mock('../components/GovernanceView', () => ({
  GovernanceView: () => <div data-testid="governance-view">Governance View</div>
}));

describe('DashboardPage', () => {
  const token = 'fake-token';
  const baseUser = { id: '1', name: 'Test', email: 'test@example.com' };

  it('shows no roles warning when user has no roles', () => {
    render(<DashboardPage token={token} user={{ ...baseUser, roles: [] }} />);
    expect(screen.getByText('Role assignment required')).toBeInTheDocument();
  });

  it('shows only governance view for GOVERNANCE role', () => {
    render(<DashboardPage token={token} user={{ ...baseUser, roles: ['GOVERNANCE'] }} />);
    expect(screen.getByTestId('governance-view')).toBeInTheDocument();
    expect(screen.queryByTestId('business-view')).not.toBeInTheDocument();
    // No tabs when only one role
    expect(screen.queryByRole('navigation', { name: /switcher/i })).not.toBeInTheDocument();
  });

  it('shows only business view for BUYER role', () => {
    render(<DashboardPage token={token} user={{ ...baseUser, roles: ['BUYER'] }} />);
    expect(screen.getByTestId('business-view')).toBeInTheDocument();
    expect(screen.queryByTestId('governance-view')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /switcher/i })).not.toBeInTheDocument();
  });

  it('shows only business view for SELLER role', () => {
    render(<DashboardPage token={token} user={{ ...baseUser, roles: ['SELLER'] }} />);
    expect(screen.getByTestId('business-view')).toBeInTheDocument();
    expect(screen.queryByTestId('governance-view')).not.toBeInTheDocument();
  });

  it('shows tabs and allows switching when user has both roles', () => {
    render(<DashboardPage token={token} user={{ ...baseUser, roles: ['BUYER', 'GOVERNANCE'] }} />);
    
    // By default, governance might be selected first depending on logic (it's first in the list)
    const tabs = screen.getByRole('navigation', { name: /switcher/i });
    expect(tabs).toBeInTheDocument();

    const govTab = screen.getByRole('button', { name: /Governance/i });
    const busTab = screen.getByRole('button', { name: /Matchmaking/i });

    // Assuming Governance is first in the list
    expect(screen.getByTestId('governance-view')).toBeInTheDocument();
    expect(screen.queryByTestId('business-view')).not.toBeInTheDocument();

    // Click business tab
    fireEvent.click(busTab);
    expect(screen.getByTestId('business-view')).toBeInTheDocument();
    expect(screen.queryByTestId('governance-view')).not.toBeInTheDocument();
    
    // Click gov tab back
    fireEvent.click(govTab);
    expect(screen.getByTestId('governance-view')).toBeInTheDocument();
    expect(screen.queryByTestId('business-view')).not.toBeInTheDocument();
  });
});
