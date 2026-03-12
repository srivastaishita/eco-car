import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  calculateEmissions,
  DEFAULT_DAILY_MILES,
} from "../utils/emissionsCalculator";
import { useForm } from "../context/FormContext";

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

// --- Dynamic Audit Logic Engine ---
const getAuditFindings = (car) => {
  if (!car) return [];
  const findings = [];

  const totalImpact = parseFloat(car.total_lifecycle_tons);
  const mfgValue = parseFloat(
    car.manufacturing_emission || car.mfg_emissions || 0,
  );

  if (totalImpact > 30) {
    findings.push({
      label: "Excessive Lifetime Impact",
      text: `Total footprint of ${totalImpact.toFixed(1)} tons exceeds the sustainability ceiling. The production does not offset long-term debt.`,
      icon: "priority_high",
      color: "text-red-500",
    });
  } else {
    findings.push({
      label: "Optimized Production",
      text: `Manufacturing footprint (${mfgValue.toFixed(1)} tons) is within sustainable limits for this vehicle class.`,
      icon: "check_circle",
      color: "text-[#13ec5b]",
    });
  }

  const tailpipe = parseFloat(car.tailpipe_co2 || car.co2TailpipeGpm);
  const claimScore = parseInt(car.ghg_score || car.ghgScore, 10);

  if (claimScore >= 5 && tailpipe > 400) {
    findings.push({
      label: "Transparency Gap",
      text: `Vehicle holds a GHG Score of ${claimScore} despite high tailpipe emissions (${tailpipe.toFixed(0)}g/mi).`,
      icon: "warning",
      color: "text-amber-500",
    });
  } else if (tailpipe === 0) {
    findings.push({
      label: "Zero-Emission Verified",
      text: "Operational phase emissions are non-existent, supporting manufacturer eco-claims.",
      icon: "verified",
      color: "text-[#13ec5b]",
    });
  } else {
    findings.push({
      label: "Operational Impact",
      text: `Emissions of ${tailpipe.toFixed(0)}g/mi align with standard ${car.fuel_type || car.fuelType || "fuel"} performance data.`,
      icon: "info",
      color: "text-blue-400",
    });
  }

  return findings;
};

// --- Dynamic Greenwash Risk Assessment Sub-component ---
const RiskAssessmentCard = ({ car }) => {
  const findings = getAuditFindings(car);

  const getRiskStatus = () => {
    if (!car)
      return {
        icon: "pending",
        color: "text-gray-500",
        bg: "bg-gray-500/10",
        label: "PENDING",
        desc: "Select a vehicle.",
      };
    const impact = car.total_lifecycle_tons || 0;
    if (impact > 30)
      return {
        icon: "report",
        color: "text-red-500",
        bg: "bg-red-500/10",
        label: "HIGH RISK",
        desc: "Significant discrepancy detected between reported and real-world LCA.",
      };
    if (impact > 20)
      return {
        icon: "warning",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        label: "MEDIUM RISK",
        desc: "Partial disclosure. Operational emissions may be higher than claimed.",
      };
    return {
      icon: "check_circle",
      color: "text-[#13ec5b]",
      bg: "bg-[#13ec5b]/10",
      label: "LOW RISK",
      desc: "Highly transparent data. Lifecycle claims align with scientific benchmarks.",
    };
  };

  const risk = getRiskStatus();

  return (
    <div className="bg-[#1a231b] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-500">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#13ec5b]">
            verified_user
          </span>
          <h3 className="text-xl font-bold">Greenwash Risk Assessment</h3>
        </div>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Integrity Report v4.2
        </span>
      </div>
      <div className="p-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-32 h-32 rounded-3xl flex items-center justify-center ${risk.bg} border border-white/5 transition-colors duration-500`}
            >
              <span
                className={`material-symbols-outlined text-6xl ${risk.color}`}
              >
                {risk.icon}
              </span>
            </div>
            <span
              className={`font-bold uppercase tracking-widest text-sm ${risk.color}`}
            >
              {risk.label}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-gray-300 leading-relaxed mb-6 italic text-sm">
              "{risk.desc}"
            </p>
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                Automated Audit Findings:
              </p>
              {findings.map((f, i) => (
                <div
                  key={i}
                  className="bg-[#0a0d0b]/40 border border-white/5 p-3 rounded-xl flex items-start gap-3"
                >
                  <span
                    className={`material-symbols-outlined text-lg ${f.color}`}
                  >
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{f.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                      {f.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RECOMMENDATION_MAP = {
  "Volkswagen ID.4": { make: "Volkswagen", model: "ID.4" },
  "Mustang Mach-E": { make: "Ford", model: "Mustang Mach-E" },
  "Rivian R1S": { make: "Rivian", model: "R1S" },
};

const ViewDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formData } = useForm();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const makeParam = searchParams.get("make");
  const modelParam = searchParams.get("model");
  const yearParam = searchParams.get("year");
  const nameParam = searchParams.get("name");
  const mileageParam = searchParams.get("mileage") || formData.distance || "";

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      setError(null);

      const hasName = nameParam && RECOMMENDATION_MAP[nameParam];
      const hasMakeModel = makeParam && modelParam;

      if (!hasName && !hasMakeModel) {
        setLoading(false);
        setError("No vehicle selected. Go back and select make, model, and year.");
        setCar(null);
        return;
      }

      const params = new URLSearchParams();
      if (hasName) {
        params.append("make", RECOMMENDATION_MAP[nameParam].make);
        params.append("model", RECOMMENDATION_MAP[nameParam].model);
      } else {
        params.append("make", makeParam);
        params.append("model", modelParam);
        if (yearParam) params.append("year", yearParam);
      }

      try {
        const res = await fetch(`${API_BASE}/cars/match?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const dailyMiles =
            mileageParam && !Number.isNaN(Number(mileageParam))
              ? Number(mileageParam) * 0.621371
              : DEFAULT_DAILY_MILES;
          const derived = calculateEmissions(data, dailyMiles);
          setCar({ ...data, ...derived });
        } else {
          setError("No matching vehicle found.");
          setCar(null);
        }
      } catch (e) {
        setError("Unable to connect to the database.");
        setCar(null);
      }
      setLoading(false);
    };
    fetchCar();
  }, [makeParam, modelParam, yearParam, nameParam, mileageParam, formData.distance]);

  // Logic: Breakeven Year Calculation
  const calculateBreakeven = (carData) => {
    if (!carData) return 0;
    const tailpipe = parseFloat(carData.tailpipe_co2 || carData.co2TailpipeGpm || 0);
    if (tailpipe > 0) return 0;

    const evMfg = parseFloat(carData.manufacturing_emission || 0);
    const evAnnualOp = parseFloat(carData.annual_avg_tons || 0);
    
    const iceMfgBaseline = 7.0; 
    const iceAnnualOpBaseline = 4.6; 

    const mfgDebtDiff = evMfg - iceMfgBaseline;
    const annualSaving = iceAnnualOpBaseline - evAnnualOp;

    return annualSaving > 0 ? mfgDebtDiff / annualSaving : 0;
  };

  const breakevenYear = calculateBreakeven(car);

  // Lifecycle Calculation Logic
  const mfgVal = parseFloat(
    car?.manufacturing_emission || car?.mfg_emissions || 0,
  );
  const dispVal = parseFloat(car?.disposal_emission || 0);
  const totalVal = parseFloat(car?.total_lifecycle_tons || 1);

  const mfgPct = Math.round((mfgVal / totalVal) * 100);
  const dispPct = Math.round((dispVal / totalVal) * 100);
  const operPct = Math.max(0, 100 - (mfgPct + dispPct));

  const strokeDasharray = 251.32; // 2 * pi * r (r=40)
  const mfgOffset = strokeDasharray - (strokeDasharray * mfgPct) / 100;
  const operOffset =
    strokeDasharray - (strokeDasharray * (mfgPct + operPct)) / 100;

  const formatNum = (n) =>
    n != null && !isNaN(n) ? Number(n).toFixed(1) : "—";

  const formatGrid = (n) =>
    n != null && !isNaN(n) ? Number(n).toFixed(4) : "0.0000";

  const seriesLabel = car
    ? `${car.make} ${car.model} ${car.model_year ? `(${car.model_year})` : ""}`
    : makeParam
      ? `${makeParam} ${modelParam}`
      : "Unknown Vehicle";

  const statCards = [
    {
      label: "Total Lifecycle",
      icon: "dataset",
      value: formatNum(car?.total_lifecycle_tons),
      unit: "tons",
      sub: "Cradle-to-grave CO2e",
      tip: "Total CO2 emissions from raw material extraction through disposal.",
    },
    {
      label: "Manufacturing",
      icon: "factory",
      value: formatNum(car?.manufacturing_emission),
      unit: "tons",
      sub: "Production impact",
      tip: "Footprint from production.",
    },
    {
      label: "10-Year Operational",
      icon: "ev_station",
      value: formatNum(car?.ten_year_op_tons),
      unit: "tons",
      sub: "Projected usage",
      tip: "Operational emissions over 10 years.",
    },
    {
      label: "Disposal Emission",
      icon: "recycling",
      value: formatNum(car?.disposal_emission),
      unit: "tons",
      sub: "End of life impact",
      tip: "End-of-life recycling footprint.",
    },
    {
      label: "Annual Avg",
      icon: "calendar_today",
      value: formatNum(car?.annual_avg_tons),
      unit: "tons/yr",
      sub: "Based on 15k miles",
      tip: "Average yearly carbon emissions.",
    },
    {
      label: "Fuel Efficiency",
      icon: "bolt",
      value: car?.fuel_efficiency || "—",
      unit: "MPGe",
      sub: "Combined city/hwy",
      tip: "Miles per gallon equivalent.",
    },
    {
      label: "Breakeven Year",
      icon: "balance",
      value: formatNum(breakevenYear),
      unit: "years",
      sub: "Vs. ICE baseline",
      tip: "Time until total EV emissions equal a standard gas vehicle.",
    },
    {
      label: "Trees Needed",
      icon: "park",
      value: car?.trees_needed || "—",
      unit: "units",
      sub: "To offset lifetime",
      tip: "Trees needed to absorb emissions.",
    },
    {
      label: "Tailpipe CO2",
      icon: "smoke_free",
      value: formatNum(car?.tailpipe_co2),
      unit: "g/km",
      sub: "Direct emissions",
      tip: "Direct exhaust emissions.",
    },
    {
      label: "Grid 100 MI",
      icon: "electric_meter",
      value: formatGrid(car?.grid_100mi),
      unit: "kg",
      sub: "Regional avg energy",
      tip: "Energy consumed based on local grid.",
    },
  ];

  if (loading)
    return (
      <div className="bg-[#0a0d0b] min-h-screen flex items-center justify-center">
        <p className="text-[#13ec5b] animate-pulse">
          Analyzing Lifecycle Data...
        </p>
      </div>
    );

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#13ec5b] text-sm font-bold">
              directions_car
            </span>
            <span className="text-[#13ec5b] text-xs font-bold uppercase tracking-widest">
              {seriesLabel}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl font-bold mb-2">
                Complete Vehicle Lifecycle Analysis
              </h2>
              
              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                  parseFloat(car?.tailpipe_co2) === 0 
                    ? 'border-[#13ec5b] text-[#13ec5b] bg-[#13ec5b]/5' 
                    : 'border-blue-400 text-blue-400 bg-blue-400/5'
                }`}>
                  <span className="material-symbols-outlined text-xs">
                    {parseFloat(car?.tailpipe_co2) === 0 ? 'bolt' : 'settings_input_component'}
                  </span>
                  {parseFloat(car?.tailpipe_co2) === 0 ? 'Electric Vehicle (EV)' : 'Internal Combustion (ICE)'}
                </div>
              </div>

              <p className="text-[#13ec5b]/70 text-lg">
                Lifecycle carbon impact for {seriesLabel}.
              </p>
            </div>

            <button
              className={`px-6 py-2.5 rounded-lg bg-[#13ec5b] text-black font-bold flex items-center gap-2 ${!car && "opacity-30 cursor-not-allowed"}`}
            >
              <span className="material-symbols-outlined">download</span> Export
              Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`bg-[#131614] border border-white/5 rounded-2xl p-6 transition-all ${!car ? "opacity-40" : "hover:border-[#13ec5b]/30"}`}
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {s.label}
                </span>
                <div className="flex items-center gap-2">
                  <InfoButton text={s.tip} />
                  <span className="material-symbols-outlined text-[#13ec5b] text-xl">
                    {s.icon}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-bold">{s.value}</h3>
                <span className="text-[#13ec5b] text-xs font-bold uppercase">
                  {s.unit}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic">{s.sub}</p>
            </div>
          ))}
        </div>

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 transition-opacity duration-700 ${!car ? "opacity-30 pointer-events-none" : ""}`}
        >
          <RiskAssessmentCard car={car} />

          <div className="bg-[#1a231b] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Lifecycle Breakdown (%)</h3>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Model Specific Analysis
              </span>
            </div>

            <div className="p-8 flex flex-col md:flex-row items-center justify-center gap-12">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-amber-500/20"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                  />
                  <circle
                    className="text-amber-500"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset="0"
                  />
                  <circle
                    className="text-blue-400"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={operOffset}
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                  <circle
                    className="text-[#13ec5b]"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={mfgOffset}
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-white">100%</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500">
                    Total Tons
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full">
                {[
                  {
                    label: "Manufacturing",
                    sub: "Production & Battery",
                    pct: mfgPct,
                    color: "bg-[#13ec5b]",
                    text: "text-[#13ec5b]",
                  },
                  {
                    label: "Operational",
                    sub: "Fuel & Energy Use",
                    pct: operPct,
                    color: "bg-blue-400",
                    text: "text-blue-400",
                  },
                  {
                    label: "Disposal",
                    sub: "Recycling & Waste",
                    pct: dispPct,
                    color: "bg-amber-500",
                    text: "text-amber-500",
                  },
                ].map((item) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                        />
                        <div>
                          <span className="text-sm font-bold text-white group-hover:text-gray-300 transition-colors">
                            {item.label}
                          </span>
                          <span className="block text-[10px] text-gray-500">
                            {item.sub}
                          </span>
                        </div>
                      </div>
                      <span className={`text-3xl font-black ${item.text}`}>
                        {item.pct}%
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={() => navigate("/")}
            className="px-10 py-3 rounded-xl border border-[#13ec5b]/30 text-[#13ec5b] font-bold hover:bg-[#13ec5b]/5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span> Back
            to Search
          </button>
        </div>
      </main>
    </div>
  );
};

export default ViewDetails;