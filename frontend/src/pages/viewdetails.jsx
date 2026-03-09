import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

const API_BASE = "http://127.0.0.1:8000";

const FALLBACK_CAR = {
  make: "",
  model: "",
  model_year: "",
  total_lifecycle_tons: 28.4,
  annual_avg_tons: 2.84,
  ten_year_op_tons: 14.2,
  fuel_efficiency: "124 MPGe",
  breakeven_year: 1.4,
  trees_needed: 210,
  tailpipe_co2: 0,
  manufacturing_emission: 12.8,
  disposal_emission: 1.4,
  grid_100mi: 16.8,
  greenwash_risk: "Low",
};

const InfoButton = ({ text }) => (
  <div className="relative group flex-shrink-0">
    <button
      type="button"
      className="w-5 h-5 rounded-full bg-white/10 hover:bg-[#13ec5b]/20 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-[#13ec5b] transition-colors cursor-help"
      aria-label="More info"
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

const ViewDetails = () => {
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

      // From recommendation cards (View Details) - try name first
      if (nameParam) {
        const mapped = RECOMMENDATION_MAP[nameParam];
        if (mapped) {
          try {
            const params = new URLSearchParams({ make: mapped.make, model: mapped.model });
            const res = await fetch(`${API_BASE}/cars/match?${params}`);
            if (res.ok) {
              const data = await res.json();
              setCar(data);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("API fetch failed, using fallback for", nameParam);
          }
        }
        setCar({ ...FALLBACK_CAR, make: nameParam.split(" ")[0] || "", model: nameParam.split(" ").slice(1).join(" ") || nameParam, model_year: 2024 });
        setLoading(false);
        return;
      }

      // From Compare Impact (dropdowns)
      if (makeParam || modelParam || yearParam) {
        try {
          const params = new URLSearchParams();
          if (makeParam) params.append("make", makeParam);
          if (modelParam) params.append("model", modelParam);
          if (yearParam) params.append("year", yearParam);
          const res = await fetch(`${API_BASE}/cars/match?${params}`);
          if (res.ok) {
            const data = await res.json();
            setCar(data);
          } else {
            setError("No matching vehicle found. Try different filters.");
            setCar({ ...FALLBACK_CAR, make: makeParam || "", model: modelParam || "", model_year: yearParam ? parseInt(yearParam) : "" });
          }
        } catch (e) {
          setError("Failed to load vehicle data.");
          setCar({ ...FALLBACK_CAR, make: makeParam || "", model: modelParam || "", model_year: yearParam ? parseInt(yearParam) : "" });
        }
      } else {
        setError("No vehicle selected. Go back and select make, model, or year.");
        setCar(FALLBACK_CAR);
      }
      setLoading(false);
    };

    fetchCar();
  }, [makeParam, modelParam, yearParam, nameParam]);

  const formatNum = (n) => (n != null && !isNaN(n) ? Number(n).toFixed(1) : "—");
  const fuelEff = (c) => (typeof c?.fuel_efficiency === "string" ? c.fuel_efficiency.replace(/.*?(\d+).*/, "$1") : c?.fuel_efficiency ?? "124");
  const seriesLabel = car
    ? [car.make || "", car.model || "", car.model_year ? `(${car.model_year})` : ""].join(" ").trim() || "Vehicle"
    : "Vehicle";

  const statCards = car
    ? [
        { label: "Total Lifecycle", icon: "dataset", value: formatNum(car.total_lifecycle_tons), unit: "tons", sub: "Cradle-to-grave CO2e", tip: "Total CO2 emissions from raw material extraction through end-of-life disposal." },
        { label: "Annual Avg", icon: "calendar_today", value: formatNum(car.annual_avg_tons), unit: "tons/yr", sub: "Based on 15k miles", tip: "Average yearly carbon emissions assuming 15,000 miles driven." },
        { label: "10-Year Operational", icon: "ev_station", value: formatNum(car.ten_year_op_tons), unit: "tons", sub: "Projected usage", tip: "Projected operational emissions over 10 years of typical use." },
        { label: "Fuel Efficiency", icon: "bolt", value: fuelEff(car), unit: "MPGe", sub: "Combined city/hwy", tip: "Miles per gallon equivalent for EVs; combined city and highway rating." },
        { label: "Breakeven Year", icon: "balance", value: formatNum(car.breakeven_year), unit: "years", sub: "Vs. ICE equivalent", tip: "Years until EV carbon footprint equals an equivalent gas vehicle." },
        { label: "Trees Needed", icon: "park", value: car.trees_needed ?? "—", unit: "units", sub: "To offset lifetime", tip: "Number of trees needed to absorb this vehicle's lifetime emissions." },
        { label: "Tailpipe CO2", icon: "smoke_free", value: formatNum(car.tailpipe_co2), unit: "g/km", sub: "Direct emissions", tip: "Direct exhaust emissions; zero for fully electric vehicles." },
        { label: "Manufacturing", icon: "factory", value: formatNum(car.manufacturing_emission), unit: "tons", sub: "Production impact", tip: "Carbon footprint from production, including materials and assembly." },
        { label: "Disposal Emission", icon: "recycling", value: formatNum(car.disposal_emission), unit: "tons", sub: "End of life impact", tip: "End-of-life impact including recycling and waste processing." },
        { label: "Grid 100 MI", icon: "electric_meter", value: formatNum(car.grid_100mi), unit: "kg", sub: "Regional avg energy", tip: "Energy consumed per 100 miles based on regional grid carbon intensity." },
      ]
    : [];

  if (loading) {
    return (
      <div className="bg-[#0a0d0b] text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen overflow-x-hidden">
      <main className="flex-1 px-6 md:px-10 lg:px-20 py-10 max-w-[1440px] mx-auto w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#13ec5b] text-sm">directions_car</span>
            <span className="text-[#13ec5b] text-xs font-bold uppercase tracking-widest">{seriesLabel}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h2 className="text-5xl font-bold mb-4">Complete Vehicle Lifecycle Analysis</h2>
              <p className="text-[#13ec5b]/70 text-lg">
                {car?.make && car?.model
                  ? `Lifecycle carbon impact for ${car.make} ${car.model}${car.model_year ? ` (${car.model_year})` : ""}.`
                  : "Select a vehicle from the home page to see its full lifecycle carbon analysis."}
              </p>
            </div>
            <div className="flex gap-3 pb-2">
              <button
                onClick={() => {
                  const doc = new jsPDF();
                  const vehicleName = `${car?.make || ""} ${car?.model || ""} ${car?.model_year ? `(${car.model_year})` : ""}`.trim();
                  const formatNum = (n) => (n != null && !isNaN(n) ? Number(n).toFixed(1) : "—");

                  doc.setFontSize(22);
                  doc.setTextColor(19, 236, 91);
                  doc.text("Carbon Wise", 20, 25);
                  doc.setTextColor(0, 0, 0);
                  doc.setFontSize(14);
                  doc.text("Vehicle Lifecycle Report", 20, 35);

                  doc.setFontSize(10);
                  doc.setTextColor(100, 100, 100);
                  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);
                  doc.text(`Vehicle: ${vehicleName || "N/A"}`, 20, 48);
                  doc.setTextColor(0, 0, 0);

                  doc.setFontSize(12);
                  doc.text("Key Metrics", 20, 60);

                  const metrics = [
                    ["Total Lifecycle (tons)", formatNum(car?.total_lifecycle_tons)],
                    ["Annual Avg (tons/yr)", formatNum(car?.annual_avg_tons)],
                    ["10-Year Operational (tons)", formatNum(car?.ten_year_op_tons)],
                    ["Fuel Efficiency", (typeof car?.fuel_efficiency === "string" ? car.fuel_efficiency : formatNum(car?.fuel_efficiency)) || "—"],
                    ["Breakeven Year", formatNum(car?.breakeven_year)],
                    ["Trees Needed", String(car?.trees_needed ?? "—")],
                    ["Tailpipe CO2 (g/km)", formatNum(car?.tailpipe_co2)],
                    ["Manufacturing (tons)", formatNum(car?.manufacturing_emission)],
                    ["Disposal Emission (tons)", formatNum(car?.disposal_emission)],
                    ["Grid 100 MI (kg)", formatNum(car?.grid_100mi)],
                    ["Greenwash Risk", car?.greenwash_risk || "—"],
                  ];

                  doc.setFontSize(10);
                  let y = 70;
                  metrics.forEach(([label, value]) => {
                    doc.text(label, 20, y);
                    doc.text(String(value), 120, y);
                    y += 8;
                  });

                  doc.setFontSize(9);
                  doc.setTextColor(100, 100, 100);
                  doc.text("Carbon Wise - Empowering consumers to make environmentally conscious vehicle choices.", 20, doc.internal.pageSize.height - 15);

                  const filename = `carbon-wise-report-${(car?.make || "vehicle").toLowerCase().replace(/\s+/g, "-")}-${car?.model_year || "report"}.pdf`;
                  doc.save(filename);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#13ec5b] text-black hover:brightness-110 transition-all font-bold"
              >
                <span className="material-symbols-outlined">download</span> Export Data
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-amber-500 text-sm">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className="bg-[#1a231b] border border-white/10 rounded-xl p-5 hover:border-[#13ec5b]/30 transition-all relative">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</span>
                <div className="flex items-center gap-1">
                  <InfoButton text={s.tip} />
                  <span className="material-symbols-outlined text-[#13ec5b] text-xl">{s.icon}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-white">{s.value}</h3>
                <span className="text-[#13ec5b] text-xs font-bold uppercase">{s.unit}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic font-medium">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#1a231b] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#13ec5b]">verified_user</span>
                <h3 className="text-xl font-bold">Greenwash Risk Assessment</h3>
              </div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Integrity Report v4.2</span>
            </div>
            <div className="p-8 flex-1">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 bg-[#13ec5b] rounded-2xl flex items-center justify-center">
                    <span className="text-6xl font-black text-[#0a0d0b]">
                      {(car?.greenwash_risk || "Low")[0]}
                    </span>
                  </div>
                  <span className="text-[#13ec5b] font-bold uppercase tracking-widest text-sm">{car?.greenwash_risk || "Low"} Risk</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Our analysis confirms that the manufacturer's environmental claims are <span className="text-white font-bold">highly transparent</span>. Third-party supply chain audits align with reported carbon intensity for mineral extraction and cell manufacturing.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0d0b]/50 border border-white/10 p-4 rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Data Integrity</p>
                      <p className="text-xl font-bold text-white">98.4% Verified</p>
                    </div>
                    <div className="bg-[#0a0d0b]/50 border border-white/10 p-4 rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Supply Chain Trace</p>
                      <p className="text-xl font-bold text-white">Deep Audit</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-start gap-3 text-sm text-gray-400">
                    <span className="material-symbols-outlined text-[#13ec5b] text-lg">info</span>
                    <p>Marketing statements are supported by ISO 14040/44 lifecycle assessment standards. No significant discrepancies found.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a231b] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold">Lifecycle Breakdown (%)</h3>
            </div>
            <div className="p-8 flex flex-col md:flex-row items-center justify-center gap-12">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-white/10" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="12" />
                  <circle className="text-[#13ec5b]/70" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.32" strokeDashoffset="125.66" strokeWidth="12" />
                  <circle className="text-[#13ec5b]" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.32" strokeDashoffset="0" strokeWidth="12" />
                  <circle className="text-gray-600" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.32" strokeDashoffset="238.75" strokeWidth="12" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold">100%</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500">Lifecycle</span>
                </div>
              </div>
              <div className="flex-1 space-y-6 w-full">
                {[
                  { label: "Manufacturing", sub: "Battery & Assembly", pct: 45, color: "bg-[#13ec5b]" },
                  { label: "Operational", sub: "Energy Consumption", pct: 50, color: "bg-[#13ec5b]/70" },
                  { label: "Disposal", sub: "Recycling & Waste", pct: 5, color: "bg-gray-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                        <div>
                          <span className="text-sm font-bold text-white">{item.label}</span>
                          <span className="block text-[10px] text-gray-500">{item.sub}</span>
                        </div>
                      </div>
                      <span className={`text-3xl font-bold ${item.pct === 5 ? "text-gray-400" : "text-[#13ec5b]"}`}>{item.pct}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
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
            className="flex items-center justify-center gap-3 px-8 py-3 rounded-lg border border-[#13ec5b]/40 hover:bg-[#13ec5b]/5 text-[#13ec5b] font-bold transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default ViewDetails;
