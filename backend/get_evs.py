import json
with open("car_data_enriched.json", "r") as f:
    data = json.load(f)

# Find pairs for recommendations
# Just print distinct makes and models
evs = [c for c in data if c.get("tailpipe_co2", 1) == 0]
ices = [c for c in data if c.get("tailpipe_co2", 0) > 0]

print("EVs:")
for c in evs[:5]:
    print(f"Make: {c['make']}, Model: {c['model']}")

print("\nICEs:")
for c in ices[:5]:
    print(f"Make: {c['make']}, Model: {c['model']}")
