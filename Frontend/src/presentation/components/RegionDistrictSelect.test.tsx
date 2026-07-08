import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegionDistrictSelect } from './RegionDistrictSelect';

describe('RegionDistrictSelect', () => {
  const defaultProps = {
    region: '',
    district: '',
    onRegionChange: vi.fn(),
    onDistrictChange: vi.fn(),
  };

  it('renders both selects and initial options', () => {
    render(<RegionDistrictSelect {...defaultProps} />);
    expect(screen.getByText('Select region')).toBeInTheDocument();
    expect(screen.getByText('Select region first')).toBeInTheDocument();
    // district should be disabled
    const selects = screen.getAllByRole('combobox');
    expect(selects[1]).toBeDisabled();
  });

  it('calls onRegionChange when region is selected', () => {
    render(<RegionDistrictSelect {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Dar es Salaam' } });
    expect(defaultProps.onRegionChange).toHaveBeenCalledWith('Dar es Salaam');
  });

  it('enables district select and populates options when region is set', () => {
    render(<RegionDistrictSelect {...defaultProps} region="Dar es Salaam" />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[1]).not.toBeDisabled();
    expect(screen.getByText('Select district')).toBeInTheDocument();
    expect(screen.getByText('Ilala')).toBeInTheDocument(); // Ilala is a district in Dar es Salaam
  });

  it('calls onDistrictChange when district is selected', () => {
    render(<RegionDistrictSelect {...defaultProps} region="Dar es Salaam" />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'Ilala' } });
    expect(defaultProps.onDistrictChange).toHaveBeenCalledWith('Ilala');
  });

  it('renders errors if provided', () => {
    render(<RegionDistrictSelect {...defaultProps} regionError="Region is invalid" districtError="District is invalid" />);
    expect(screen.getByText('Region is invalid')).toBeInTheDocument();
    expect(screen.getByText('District is invalid')).toBeInTheDocument();
  });
});
