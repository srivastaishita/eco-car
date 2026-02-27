import pandas as pd
import json

# 1. Load your raw data
df = pd.read_csv('D:\\Python1\\eco car\\data processing\\vehicle_emissions_report.csv')

# --- CONFIGURATION ---
ANNUAL_MILES = 12000
LIFESPAN_YEARS = 10
LIFETIME_MILES = ANNUAL_MILES * LIFESPAN_YEARS
TREE_ABSORPTION_RATE = 0.022 # tons of CO2 absorbed by 1 tree per year

# 2. Establish a "Baseline" (The average gas car)
# This allows us to calculate how much "better" an EV is than a standard car
ice_mask = df['fuelType'].isin(['Regular', 'Premium', 'Diesel'])
baseline_mfg = df.loc[ice_mask, 'mfg_emissions (MTCO_2e)'].mean()
baseline_op_per_mile = (df.loc[ice_mask, 'co2TailpipeGpm'] / 1000000).mean()

def enrich_car_row(row):
    # Raw Data Mapping
    mfg = float(row['mfg_emissions (MTCO_2e)'])
    disposal = float(row['disposal_emissions (MTCO_2e)'])
    tailpipe_gpm = float(row['co2TailpipeGpm'])
    grid_100mi = float(row['grid_impact_(MTCO_2e / 100miles)'])
    
    # Calculate Operational Impact (Direct Tailpipe + Indirect Grid)
    op_per_mile = (tailpipe_gpm / 1000000) + (grid_100mi / 100)
    ten_year_op_tons = op_per_mile * LIFETIME_MILES
    
    # Calculate Lifecycle & Annual Metrics
    total_lifecycle = mfg + disposal + ten_year_op_tons
    annual_avg = total_lifecycle / LIFESPAN_YEARS
    trees_needed = annual_avg / TREE_ABSORPTION_RATE
    
    # Fuel Efficiency Label
    eff_label = f"{row['combE']} kWh/100mi" if row['fuelType'] == 'Electricity' else f"{row['comb08']} MPG"
    
    # Breakeven Logic (Years until EV is cleaner than Baseline Gas car)
    mfg_debt = mfg - baseline_mfg
    annual_saving = (baseline_op_per_mile * ANNUAL_MILES) - (op_per_mile * ANNUAL_MILES)
    breakeven = (mfg_debt / annual_saving) if annual_saving > 0 else 0
    
    # Greenwash Risk Logic
    # High risk for EVs with massive batteries and low efficiency (Long breakeven)
    # High risk for Gas cars with very low MPG
    if row['fuelType'] == 'Electricity':
        risk = "High" if breakeven > 6 else ("Medium" if breakeven > 3 else "Low")
    else:
        risk = "High" if row['comb08'] < 18 else ("Medium" if row['comb08'] < 25 else "Low")

    return pd.Series({
        'make': row['make'],
        'model': row['model'],
        'model_year': row['year'],
        'total_lifecycle_tons': round(total_lifecycle, 2),
        'annual_avg_tons': round(annual_avg, 2),
        'ten_year_op_tons': round(ten_year_op_tons, 2),
        'fuel_efficiency': eff_label,
        'breakeven_year': round(max(0, breakeven), 1),
        'trees_needed': int(round(trees_needed)),
        'tailpipe_co2': tailpipe_gpm,
        'manufacturing_emission': mfg,
        'disposal_emission': disposal,
        'greenwash_risk': risk,
        'grid_100mi': grid_100mi
    })

# 3. Process every car and export
print("Enriching data with 14 environmental metrics...")
final_df = df.apply(enrich_car_row, axis=1)
final_df.to_json('D:\\Python1\\eco car\\backend\\car_data_enriched.json', orient='records', indent=4)

print("Success! File saved as: car_data_enriched.json")