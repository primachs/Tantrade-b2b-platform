import { REGION_NAMES, districtsForRegion } from "../../shared/geography/tanzaniaRegions";

type RegionDistrictSelectProps = {
  region: string;
  district: string;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
  regionError?: string;
  districtError?: string;
  className?: string;
  selectClassName?: string;
  required?: boolean;
};

export const RegionDistrictSelect = ({
  region,
  district,
  onRegionChange,
  onDistrictChange,
  regionError,
  districtError,
  className = "grid-2",
  selectClassName = "input",
  required = true,
}: RegionDistrictSelectProps) => {
  const districts = region ? districtsForRegion(region) : [];

  return (
    <div className={className}>
      <label className="field">
        <span>Region{required ? " *" : ""}</span>
        <select
          className={selectClassName}
          value={region}
          required={required}
          onChange={(e) => {
            onRegionChange(e.target.value);
          }}
        >
          <option value="">Select region</option>
          {REGION_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {regionError && <small className="field-error">{regionError}</small>}
      </label>
      <label className="field">
        <span>District{required ? " *" : ""}</span>
        <select
          className={selectClassName}
          value={district}
          required={required}
          disabled={!region}
          onChange={(e) => onDistrictChange(e.target.value)}
        >
          <option value="">{region ? "Select district" : "Select region first"}</option>
          {districts.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {districtError && <small className="field-error">{districtError}</small>}
      </label>
    </div>
  );
};