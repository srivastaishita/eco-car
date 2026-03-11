import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  calculateEmissions,
  DEFAULT_DAILY_MILES,
} from "../utils/emissionsCalculator";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const InfoButton = ({ text }) => (
  <div className="relative group flex-shrink-0">
    <button
      type="button"
      className="w-5 h-5 rounded-full bg-white/10 hover:bg-[#13ec5b]/20 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-[#13ec5b] transition-colors cursor-help"
    >
      i
    </button>
    <div className="absolute left-0 top-full mt-1 z-50 w-52 p-3 rounded-lg bg-[#0a0d0b] border border-white/20 text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-xl">
      {text}
    </div>
  </div>
);

const RECOMMENDATION_MAP = {
  "Volkswagen ID.4": { make: "Volkswagen", model: "ID.4" },
  "Mustang Mach-E": { make: "Ford", model: "Mustang Mach-E" },
  "Rivian R1S": { make: "Rivian", model: "R1S" },
};

const viewdetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const makeParam = searchParams.get("make");
  const modelParam = searchParams.get("model");
  const yearParam = searchParams.get("year");
  const nameParam = searchParams.get("name");

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      setError(null);

      let params = new URLSearchParams();
      if (nameParam && RECOMMENDATION_MAP[nameParam]) {
        params.append("make", RECOMMENDATION_MAP[nameParam].make);
        params.append("model", RECOMMENDATION_MAP[nameParam].model);
      } else {
        if (makeParam) params.append("make", makeParam);
        if (modelParam) params.append("model", modelParam);
        if (yearParam) params.append("year", yearParam);
      }

      try {
        const res = await fetch(`${API_BASE}/cars/match?${params}`);
        if (res.ok) {
          const data = await res.json();
          const derived = calculateEmissions(data, DEFAULT_DAILY_MILES);
          setCar({ ...data, ...derived });
        } else {
          setError("No matching vehicle found. Please try different filters.");
          setCar(null); // Ensure car is null so boxes show empty
        }
      } catch (e) {
        setError("Unable to connect to the database.");
        setCar(null);
      }
      setLoading(false);
    };

    fetchCar();
  }, [makeParam, modelParam, yearParam, nameParam]);

  const formatNum = (n) => (n != null && !isNaN(n) ? Number(n).toFixed(1) : "—");
  
  const seriesLabel = car 
    ? `${car.make} ${car.model} ${car.model_year ? `(${car.model_year})` : ""}`
    : (makeParam ? `${makeParam} ${modelParam}` : "Unknown Vehicle");

  const statCards = [
    { label: "Total Lifecycle", icon: "dataset", value: formatNum(car?.total_lifecycle_tons), unit: "tons", sub: "Cradle-to-grave CO2e", tip: "Total CO2 emissions from raw material extraction through end-of-life disposal." },
    { label: "Annual Avg", icon: "calendar_today", value: formatNum(car?.annual_avg_tons), unit: "tons/yr", sub: "Based on 15k miles", tip: "Average yearly carbon emissions assuming 15,000 miles driven." },
    { label: "10-Year Operational", icon: "ev_station", value: formatNum(car?.ten_year_op_tons), unit: "tons", sub: "Projected usage", tip: "Projected operational emissions over 10 years." },
    { label: "Fuel Efficiency", icon: "bolt", value: car?.fuel_efficiency || "—", unit: "MPGe", sub: "Combined city/hwy", tip: "Miles per gallon equivalent for EVs." },
    { label: "Breakeven Year", icon: "balance", value: formatNum(car?.breakeven_year), unit: "years", sub: "Vs. ICE equivalent", tip: "Years until EV carbon footprint equals a gas vehicle." },
    { label: "Trees Needed", icon: "park", value: car?.trees_needed || "—", unit: "units", sub: "To offset lifetime", tip: "Trees needed to absorb lifetime emissions." },
    { label: "Tailpipe CO2", icon: "smoke_free", value: formatNum(car?.tailpipe_co2), unit: "g/km", sub: "Direct emissions", tip: "Direct exhaust emissions." },
    { label: "Manufacturing", icon: "factory", value: formatNum(car?.manufacturing_emission), unit: "tons", sub: "Production impact", tip: "Footprint from production and assembly." },
    { label: "Disposal Emission", icon: "recycling", value: formatNum(car?.disposal_emission), unit: "tons", sub: "End of life impact", tip: "End-of-life recycling impact." },
    { label: "Grid 100 MI", icon: "electric_meter", value: formatNum(car?.grid_100mi), unit: "kg", sub: "Regional avg energy", tip: "Energy consumed per 100 miles based on grid." },
  ];

  if (loading) return (
    <div className="bg-[#0a0d0b] min-h-screen flex items-center justify-center">
      <p className="text-[#13ec5b] animate-pulse">Analyzing Lifecycle Data...</p>
    </div>
  );

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Block */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#13ec5b] text-sm font-bold">directions_car</span>
            <span className="text-[#13ec5b] text-xs font-bold uppercase tracking-widest">{seriesLabel}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl font-bold mb-4">Complete Vehicle Lifecycle Analysis</h2>
              <p className="text-[#13ec5b]/70 text-lg">Lifecycle carbon impact for {seriesLabel}.</p>
            </div>
            <button className={`px-6 py-2.5 rounded-lg bg-[#13ec5b] text-black font-bold flex items-center gap-2 ${!car && 'opacity-30 cursor-not-allowed'}`}>
              <span className="material-symbols-outlined">download</span> Export Data
            </button>
          </div>

          {/* Large Warning Message */}
          {error && (
            <div className="mt-8 p-6 bg-orange-600/10 border-2 border-orange-500 rounded-2xl flex items-center gap-4 animate-pulse">
              <span className="material-symbols-outlined text-orange-500 text-4xl">warning</span>
              <div>
                <h3 className="text-orange-500 font-bold text-xl uppercase tracking-wider">No matching vehicle found</h3>
                <p className="text-orange-500/80 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {statCards.map((s) => (
            <div key={s.label} className={`bg-[#131614] border border-white/5 rounded-2xl p-6 transition-all ${!car ? 'opacity-40' : 'hover:border-[#13ec5b]/30'}`}>
              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</span>
                <div className="flex items-center gap-2">
                  <InfoButton text={s.tip} />
                  <span className="material-symbols-outlined text-[#13ec5b] text-xl">{s.icon}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-bold">{s.value}</h3>
                <span className="text-[#13ec5b] text-xs font-bold uppercase">{s.unit}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button onClick={() => navigate("/")} className="px-10 py-3 rounded-xl border border-[#13ec5b]/30 text-[#13ec5b] font-bold hover:bg-[#13ec5b]/5 transition-all">
            Back to Search
          </button>
        </div>
      </main>
    </div>
  );
};

export default viewdetails;