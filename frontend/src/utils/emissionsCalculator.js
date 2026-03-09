const DEFAULT_DAILY_MILES = 25;
const LIFESPAN_YEARS = 10;
const TREE_ABSORPTION_RATE = 0.022;

// Load raw car data JSON once at module init.
// NOTE: This module is the only place where we do numeric
// lifecycle calculations; other files should call calculateEmissions.
let baseline_mfg = 0;
let baseline_op_per_mile = 0;

try {
  // Importing JSON at build time; path is relative to this file.
  // Adjusted to point at the backend JSON as requested.
  // eslint-disable-next-line global-require, import/no-webpack-loader-syntax
  const carData = require("../../../backend/car_data_enriched.json");

  if (Array.isArray(carData) && carData.length) {
    const BASELINE_FUELS = new Set(["Regular", "Premium", "Diesel"]);

    const baselineCars = carData.filter((car) => {
      const fuel = (car.fuel_type || "").trim();
      return BASELINE_FUELS.has(fuel);
    });

    if (baselineCars.length > 0) {
      let mfgSum = 0;
      let opPerMileSum = 0;
      let count = 0;

      baselineCars.forEach((car) => {
        const mfg = Number(car.manufacturing_emission);
        const tailpipe = Number(car.tailpipe_co2);

        if (Number.isFinite(mfg) && Number.isFinite(tailpipe)) {
          mfgSum += mfg;
          opPerMileSum += tailpipe / 1_000_000;
          count += 1;
        }
      });

      if (count > 0) {
        baseline_mfg = mfgSum / count;
        baseline_op_per_mile = opPerMileSum / count;
      }
    }
  }
} catch (err) {
  // If anything goes wrong, keep baselines at 0 so the code still runs.
  // Consumers can still call calculateEmissions; breakeven logic
  // will effectively compare against a zero baseline.
  // eslint-disable-next-line no-console
  console.error("Failed to initialize emissions baselines:", err);
}

// Main calculation function.
// dailyMiles comes directly from user input — already in miles.
export const calculateEmissions = (vehicle, dailyMiles = DEFAULT_DAILY_MILES) => {
  if (!vehicle) {
    throw new Error("calculateEmissions: vehicle is required");
  }

  const annual_miles = dailyMiles * 365;
  const lifetime_miles = annual_miles * LIFESPAN_YEARS;

  const tailpipeCo2 = Number(vehicle.tailpipe_co2) || 0;
  const gridPer100 = Number(vehicle.grid_100mi) || 0;
  const mfgEmission = Number(vehicle.manufacturing_emission) || 0;
  const disposalEmission = Number(vehicle.disposal_emission) || 0;

  const op_per_mile = tailpipeCo2 / 1_000_000 + gridPer100 / 100;
  const ten_year_op_tons = op_per_mile * lifetime_miles;
  const total_lifecycle = mfgEmission + ten_year_op_tons + disposalEmission;
  const annual_avg = total_lifecycle / LIFESPAN_YEARS;
  const trees_needed = Math.round(annual_avg / TREE_ABSORPTION_RATE);

  // ── Breakeven calculation ────────────────────────────────────────────
  const mfg_debt = mfgEmission - baseline_mfg;
  const annual_saving =
    baseline_op_per_mile * annual_miles - op_per_mile * annual_miles;
  const breakeven_raw =
    annual_saving > 0 ? mfg_debt / annual_saving : null;

  let breakeven;
  let breakeven_label;

  if (mfg_debt <= 0) {
    // Car has lower or equal manufacturing emissions than baseline
    // already cleaner than average gas car from day one
    breakeven = 0;
    breakeven_label = "Immediate";
  } else if (!breakeven_raw || breakeven_raw <= 0) {
    // Car is dirtier than baseline in operation — never breaks even
    breakeven = 0;
    breakeven_label = "Never";
  } else {
    // Normal case — breaks even after N years
    breakeven = parseFloat(breakeven_raw.toFixed(1));
    breakeven_label = `${breakeven} yrs`;
  }

  return {
    annual_miles_used: parseFloat(annual_miles.toFixed(1)),
    ten_year_op_tons: parseFloat(ten_year_op_tons.toFixed(2)),
    total_lifecycle_tons: parseFloat(total_lifecycle.toFixed(2)),
    annual_avg_tons: parseFloat(annual_avg.toFixed(2)),
    trees_needed,
    breakeven_year: breakeven,
    breakeven_label,
  };
};

export {
  DEFAULT_DAILY_MILES,
  LIFESPAN_YEARS,
  TREE_ABSORPTION_RATE,
  baseline_mfg,
  baseline_op_per_mile,
};

