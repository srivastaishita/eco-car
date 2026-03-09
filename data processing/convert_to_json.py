import pandas as pd

# ── Load CSV ──────────────────────────────────────────────────────────────────
df = pd.read_csv('C:\\Users\\mahil\\Downloads\\eco-car-main\\eco-car-main\\data processing\\vehicle_emissions_report.csv')

# ── Greenwash Risk from GHG Score ─────────────────────────────────────────────
def get_greenwash_risk(ghg_score):
    if ghg_score >= 8:
        return "Low"
    elif ghg_score >= 5:
        return "Medium"
    else:
        return "High"

# ── Core mapping ──────────────────────────────────────────────────────────────
def enrich_car_row(row):
    ghg_score = int(row['ghgScore'])

    fuel_efficiency = (
        f"{row['combE']} kWh/100mi"
        if row['fuelType'] == 'Electricity'
        else f"{row['comb08']} MPG"
    )

    return {
        'make'                  : row['make'],
        'model'                 : row['model'],
        'model_year'            : int(row['year']),
        'fuel_type'             : row['fuelType'],
        'fuel_efficiency'       : fuel_efficiency,
        'tailpipe_co2'          : float(row['co2TailpipeGpm']),
        'manufacturing_emission': float(row['mfg_emissions (MTCO_2e)']),
        'disposal_emission'     : float(row['disposal_emissions (MTCO_2e)']),
        'grid_100mi'            : float(row['grid_impact_(MTCO_2e / 100miles)']),
        'ghg_score'             : ghg_score,
        'greenwash_risk'        : get_greenwash_risk(ghg_score),
    }

# ── Process all rows ──────────────────────────────────────────────────────────
results = [enrich_car_row(row) for _, row in df.iterrows()]

# ── Save to JSON ──────────────────────────────────────────────────────────────
import json
with open('C:\\Users\\mahil\\Downloads\\eco-car-main\\eco-car-main\\backend\\car_data_enriched.json', 'w') as f:
    json.dump(results, f, indent=4)

print(f"✅ Done! {len(results)} cars saved to car_data_enriched.json")
