from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "car_data_enriched.json")

with open(DATA_PATH, "r") as f:
    cars_db = json.load(f)


@app.get("/cars")
def get_cars(
    make: str = None,
    model: str = None,
    year: int = None,
    risk: str = None,
    fuel: str = None,
    limit: int = 20
):
    results = cars_db

    if make:
        results = [c for c in results if c["make"].lower() == make.lower()]

    if model:
        results = [c for c in results if c["model"].lower() == model.lower()]

    if year:
        results = [c for c in results if c["model_year"] == year]

    if risk:
        results = [c for c in results if c["greenwash_risk"].lower() == risk.lower()]

    if fuel:
        results = [c for c in results if fuel.lower() in c["fuelType"].lower()]

    # Add id for frontend (JSON may not have id)
    out = []
    for i, c in enumerate(results[:limit]):
        row = dict(c)
        row.setdefault("id", f"{c.get('make','')}-{c.get('model','')}-{c.get('model_year','')}-{i}")
        out.append(row)
    return out


@app.get("/cars/match")
def get_car_match(make: str = None, model: str = None, year: int = None):
    """Return first car matching make, model, year (any combination)."""
    results = cars_db
    if make:
        results = [c for c in results if c["make"].lower() == make.lower()]
    if model:
        results = [c for c in results if c["model"].lower() == model.lower()]
    if year:
        results = [c for c in results if c["model_year"] == year]
    if not results:
        raise HTTPException(status_code=404, detail="No matching car found")
    car = dict(results[0])
    car.setdefault("id", f"{car.get('make','')}-{car.get('model','')}-{car.get('model_year','')}")
    return car


@app.get("/car/{car_id}")
def get_car_details(car_id: int):
    car = next((c for c in cars_db if c.get("id") == car_id), None)

    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    return car


@app.get("/makes")
def get_makes():
    makes = list(set(c["make"] for c in cars_db))
    return sorted(makes)


@app.get("/models/{make}")
def get_models(make: str):
    models = list(
        set(c["model"] for c in cars_db if c["make"].lower() == make.lower())
    )
    return sorted(models)


@app.get("/cars/lowest-emissions")
def get_lowest_emission_cars(limit: int = 5):
    """Return cars with lowest total_lifecycle_tons, sorted ascending."""
    sorted_cars = sorted(
        cars_db,
        key=lambda c: c.get("total_lifecycle_tons", float("inf"))
    )
    out = []
    for i, c in enumerate(sorted_cars[:limit]):
        row = dict(c)
        row.setdefault("id", f"{c.get('make','')}-{c.get('model','')}-{c.get('model_year','')}-{i}")
        out.append(row)
    return out


@app.get("/years")
def get_years(make: str = None, model: str = None):
    """Return unique years, optionally filtered by make and model."""
    results = cars_db
    if make:
        results = [c for c in results if c["make"].lower() == make.lower()]
    if model:
        results = [c for c in results if c["model"].lower() == model.lower()]
    years = sorted(set(c["model_year"] for c in results))
    return years