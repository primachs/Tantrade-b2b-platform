import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GovernanceView } from './GovernanceView';
import { apiRequest } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiRequest: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(msg: string) { super(msg); }
    firstFieldError() { return null; }
  }
}));

describe('GovernanceView', () => {
  const completeUser = {
    id: '1',
    name: 'Jane Doe',
    first_name: 'Jane',
    surname: 'Doe',
    email: 'jane@example.com',
    nida_number: '12345678901234567890',
    mobile: '0712345678',
    gender: 'FEMALE'
  };

  const incompleteUser = {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const defaultProps = {
    token: 'test-token',
    user: completeUser,
    setNotice: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiRequest).mockResolvedValue([]);
  });

  it('renders dashboard by default for complete profile', async () => {
    render(<GovernanceView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Governance Dashboard')).toBeInTheDocument();
    });
  });

  it('forces my-profile view if profile is incomplete', async () => {
    render(<GovernanceView {...defaultProps} user={incompleteUser} />);
    await waitFor(() => {
      expect(screen.getByText('Chairperson Profile Details')).toBeInTheDocument();
    });
  });

  it('navigates between panes', async () => {
    render(<GovernanceView {...defaultProps} />);
    
    const createMarketBtn = screen.getByRole('button', { name: /create market/i });
    fireEvent.click(createMarketBtn);

    await waitFor(() => {
      expect(screen.getByText('New Market Details')).toBeInTheDocument();
    });
  });

  it('submits create market form', async () => {
    render(<GovernanceView {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /create market/i }));

    await waitFor(() => {
      expect(screen.getByText('New Market Details')).toBeInTheDocument();
    });

    // The labels aren't associated with the inputs via htmlFor, so we find them differently
    const textboxes = screen.getAllByRole('textbox');
    const nameInput = textboxes[0]; // Market Name
    const addressInput = textboxes[2]; // Physical Address
    
    fireEvent.change(nameInput, { target: { value: 'Test Market' } });
    fireEvent.change(addressInput, { target: { value: '123 Test St' } });
    
    // We need to set region and district via the select, which is mocked or rendered
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Dar es Salaam' } });
    fireEvent.change(selects[1], { target: { value: 'Ilala' } });

    const submitBtn = screen.getAllByRole('button', { name: 'Create Market' }).find(b => b.getAttribute('type') === 'submit');
    fireEvent.click(submitBtn!);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/market-governance/markets', expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          market_name: 'Test Market',
          region: 'Dar es Salaam',
          district: 'Ilala',
        })
      }));
    });
  });
});
