/**
 * Business size is derived from revenue range rather than chosen
 * independently, so the two fields can never disagree with each other
 * (e.g. "Small" size with "Above 500M" revenue).
 */
export const deriveBusinessSizeFromRevenue = (revenueRange: string): "SMALL" | "MEDIUM" | "LARGE" => {
  switch (revenueRange) {
    case "BELOW_50M":
      return "SMALL";
    case "ABOVE_500M":
      return "LARGE";
    case "BETWEEN_50M_500M":
    default:
      return "MEDIUM";
  }
};