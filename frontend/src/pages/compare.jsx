import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const MetricRow = ({ label, a, b, highlight = false }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-white/10 text-sm">
    <div className="text-gray-400">{label}</div>
    <div className={`font-semibold ${highlight ? "text-[#13ec5b]" : "text-white"}`}>{a ?? "—"}</div>
    <div className={`font-semibold ${highlight ? "text-[#13ec5b]" : "text-white"}`}>{b ?? "—"}</div>
  </div>
);

const Compare = () => {
  const [searchParams] = useSearchParams();
  const toolRef = useRef(null);
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);

  const [aMake, setAMake] = useState(searchParams.get("make") || "");
  const [aModel, setAModel] = useState(searchParams.get("model") || "");
  const [aYear, setAYear] = useState(searchParams.get("year") || "");
  const [bMake, setBMake] = useState("");
  const [bModel, setBModel] = useState("");
  const [bYear, setBYear] = useState("");

  const [aModels, setAModels] = useState([]);
  const [bModels, setBModels] = useState([]);
  const [aYears, setAYears] = useState([]);
  const [bYears, setBYears] = useState([]);

  const [mileage, setMileage] = useState("");

  const [carA, setCarA] = useState(null);
  const [carB, setCarB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all cars once and derive makes/models/years in the frontend
  useEffect(() => {
    fetch(`${API_BASE}/cars?limit=10000`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCars(data);
          const uniqueMakes = Array.from(new Set(data.map((c) => c.make))).sort();
          setMakes(uniqueMakes);
        }
      })
      .catch((err) => {
        console.error("Cars fetch error on Compare page:", err);
      });
  }, []);

  // Derive models and years for Vehicle A
  useEffect(() => {
    if (!cars.length) return;
    let filtered = cars;
    if (aMake) filtered = filtered.filter((c) => c.make === aMake);

    const nextModels = Array.from(new Set(filtered.map((c) => c.model))).sort();
    setAModels(nextModels);
    if (!nextModels.includes(aModel)) {
      setAModel("");
    }
  }, [cars, aMake]);

  useEffect(() => {
    if (!cars.length) return;
    let filtered = cars;
    if (aMake) filtered = filtered.filter((c) => c.make === aMake);
    if (aModel) filtered = filtered.filter((c) => c.model === aModel);

    const nextYears = Array.from(new Set(filtered.map((c) => c.model_year))).sort();
    setAYears(nextYears);
    if (!nextYears.includes(Number(aYear))) {
      setAYear("");
    }
  }, [cars, aMake, aModel]);

  // Derive models and years for Vehicle B
  useEffect(() => {
    if (!cars.length) return;
    let filtered = cars;
    if (bMake) filtered = filtered.filter((c) => c.make === bMake);

    const nextModels = Array.from(new Set(filtered.map((c) => c.model))).sort();
    setBModels(nextModels);
    if (!nextModels.includes(bModel)) {
      setBModel("");
    }
  }, [cars, bMake]);

  useEffect(() => {
    if (!cars.length) return;
    let filtered = cars;
    if (bMake) filtered = filtered.filter((c) => c.make === bMake);
    if (bModel) filtered = filtered.filter((c) => c.model === bModel);

    const nextYears = Array.from(new Set(filtered.map((c) => c.model_year))).sort();
    setBYears(nextYears);
    if (!nextYears.includes(Number(bYear))) {
      setBYear("");
    }
  }, [cars, bMake, bModel]);

  const aLabel = useMemo(() => {
    const y = aYear ? ` (${aYear})` : "";
    return `${aMake || "Vehicle A"} ${aModel || ""}${y}`.trim();
  }, [aMake, aModel, aYear]);

  const bLabel = useMemo(() => {
    const y = bYear ? ` (${bYear})` : "";
    return `${bMake || "Vehicle B"} ${bModel || ""}${y}`.trim();
  }, [bMake, bModel, bYear]);

  const fetchMatch = async ({ make, model, year }) => {
    const params = new URLSearchParams();
    if (make) params.append("make", make);
    if (model) params.append("model", model);
    if (year) params.append("year", year);
    const res = await fetch(`${API_BASE}/cars/match?${params.toString()}`);
    if (!res.ok) throw new Error("No match");
    return await res.json();
  };

  const handleCompare = async () => {
    setError(null);
    const hasA = aMake || aModel || aYear;
    const hasB = bMake || bModel || bYear;
    if (!hasA || !hasB) {
      setError("Select details for both Vehicle A and Vehicle B, then click Compare Now.");
      return;
    }

    // verify both vehicles exist before navigating
    try {
      setLoadingA(true);
      setLoadingB(true);
      await Promise.all([
        fetchMatch({ make: aMake, model: aModel, year: aYear }),
        fetchMatch({ make: bMake, model: bModel, year: bYear }),
      ]);

      const params = new URLSearchParams();
      if (aMake) params.append("aMake", aMake);
      if (aModel) params.append("aModel", aModel);
      if (aYear) params.append("aYear", aYear);
      if (bMake) params.append("bMake", bMake);
      if (bModel) params.append("bModel", bModel);
      if (bYear) params.append("bYear", bYear);
      if (mileage) params.append("mileage", mileage);

      navigate(`/comparison-result?${params.toString()}`);
    } catch {
      setError("Could not find one of the vehicles in the database. Try different selections.");
    } finally {
      setLoadingA(false);
      setLoadingB(false);
    }
  };

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-10">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#1a231b]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
          <div className="relative z-10 p-8 md:p-12 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">Vehicle Comparison</h2>
            <p className="text-gray-300 text-lg mt-4">
              Compare vehicles side-by-side to find a more sustainable choice for your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Tool */}
      <section ref={toolRef} className="max-w-7xl mx-auto px-6 lg:px-20 pb-20">
        <h3 className="text-2xl font-bold mb-6">Comparison Tool</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Vehicle A */}
          <div className="bg-[#1a231b]/80 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec5b]">directions_car</span>
                <span className="bg-[#13ec5b]/10 text-[#13ec5b] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  Vehicle A
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Select Make</label>
                <select
                  value={aMake}
                  onChange={(e) => setAMake(e.target.value)}
                  className="w-full bg-[#0a0d0b] border border-white/10 rounded-lg text-sm text-white focus:border-[#13ec5b] focus:ring-0"
                >
                  <option value="">Choose Brand</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Model</label>
                <select
                  value={aModel}
                  onChange={(e) => setAModel(e.target.value)}
                  className="w-full bg-[#0a0d0b] border border-white/10 rounded-lg text-sm text-white focus:border-[#13ec5b] focus:ring-0"
                >
                  <option value="">Select Model</option>
                  {aModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Year</label>
                <select
                  value={aYear}
                  onChange={(e) => setAYear(e.target.value)}
                  className="w-full bg-[#0a0d0b] border border-white/10 rounded-lg text-sm text-white focus:border-[#13ec5b] focus:ring-0"
                >
                  <option value="">Select Year</option>
                  {aYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(aMake || aModel || aYear) && (
              <div className="mt-4 text-xs text-gray-400">
                Selected: <span className="text-white font-semibold">{aLabel}</span>
              </div>
            )}
          </div>

          {/* Vehicle B */}
          <div className="bg-[#1a231b]/80 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec5b]">directions_car</span>
                <span className="bg-[#13ec5b]/10 text-[#13ec5b] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  Vehicle B
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Select Make</label>
                <select
                  value={bMake}
                  onChange={(e) => setBMake(e.target.value)}
                  className="w-full bg-[#0a0d0b] border border-white/10 rounded-lg text-sm text-white focus:border-[#13ec5b] focus:ring-0"
                >
                  <option value="">Choose Brand</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Model</label>
                <select
                  value={bModel}
                  onChange={(e) => setBModel(e.target.value)}
                  className="w-full bg-[#0a0d0b] border border-white/10 rounded-lg text-sm text-white focus:border-[#13ec5b] focus:ring-0"
                >
                  <option value="">Select Model</option>
                  {bModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Year</label>
                <select
                  value={bYear}
                  onChange={(e) => setBYear(e.target.value)}
                  className="w-full bg-[#0a0d0b] border border-white/10 rounded-lg text-sm text-white focus:border-[#13ec5b] focus:ring-0"
                >
                  <option value="">Select Year</option>
                  {bYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(bMake || bModel || bYear) && (
              <div className="mt-4 text-xs text-gray-400">
                Selected: <span className="text-white font-semibold">{bLabel}</span>
              </div>
            )}
          </div>
        </div>

        {error && <p className="mt-6 text-amber-500 text-sm">{error}</p>}

        {/* Mileage input */}
        <div className="mt-6 max-w-md mx-auto">
          <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
            Daily distance (km)
          </label>
          <input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="Enter your average daily km"
            className="w-full bg-[#0a0d0b] border border-white/10 rounded-lg text-sm text-white px-3 py-2 focus:border-[#13ec5b] focus:ring-0"
          />
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleCompare}
            className="flex items-center gap-2 px-12 py-4 bg-[#13ec5b] text-black font-black rounded-full shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[#13ec5b]/50 transition-all uppercase tracking-widest text-sm"
          >
            {loadingA || loadingB ? "Comparing..." : "Compare Now"}
            <span className="material-symbols-outlined">analytics</span>
          </button>
        </div>

        {/* Results are shown on the next page */}

        {/* Recommended Comparisons */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold mb-6">Recommended Comparisons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Tesla Model 3 vs BMW i4",
                range: "358 vs 301 mi",
                accel: "3.1s vs 3.7s",
                savings: "+12% vs +9%",
              },
              {
                title: "Rivian R1T vs Ford Lightning",
                range: "314 vs 320 mi",
                accel: "3.0s vs 4.0s",
                savings: "+8% vs +7%",
              },
              {
                title: "Lucid Air vs Tesla Model S",
                range: "520 vs 405 mi",
                accel: "2.5s vs 1.9s",
                savings: "+15% vs +14%",
              },
            ].map((rec) => (
              <div
                key={rec.title}
                className="bg-[#1a231b] border border-white/10 rounded-xl p-5 hover:border-[#13ec5b]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span className="material-symbols-outlined text-[#13ec5b]">electric_car</span>
                    Suggested Match
                  </div>
                  <span className="bg-[#13ec5b]/10 text-[#13ec5b] text-[10px] font-bold px-3 py-1 rounded-full border border-[#13ec5b]/30">
                    VS
                  </span>
                </div>
                <h4 className="text-lg font-bold mb-3">{rec.title}</h4>
                <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Range (est.)</span>
                    <span className="font-medium text-[#13ec5b]">{rec.range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">0–60 mph</span>
                    <span className="font-medium">{rec.accel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CO₂ Savings</span>
                    <span className="font-medium text-[#13ec5b]">{rec.savings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};

export default Compare;
