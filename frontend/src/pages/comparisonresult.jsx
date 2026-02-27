import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const formatNum = (n, digits = 1) => (n != null && !isNaN(n) ? Number(n).toFixed(digits) : "—");

const ComparisonResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const aMake = searchParams.get("aMake") || "";
  const aModel = searchParams.get("aModel") || "";
  const aYear = searchParams.get("aYear") || "";
  const bMake = searchParams.get("bMake") || "";
  const bModel = searchParams.get("bModel") || "";
  const bYear = searchParams.get("bYear") || "";

  const [carA, setCarA] = useState(null);
  const [carB, setCarB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mileageParam = searchParams.get("mileage");

  useEffect(() => {
    const fetchMatch = async ({ make, model, year }) => {
      const params = new URLSearchParams();
      if (make) params.append("make", make);
      if (model) params.append("model", model);
      if (year) params.append("year", year);
      const res = await fetch(`${API_BASE}/cars/match?${params.toString()}`);
      if (!res.ok) throw new Error("No match");
      return await res.json();
    };

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [a, b] = await Promise.all([
          fetchMatch({ make: aMake, model: aModel, year: aYear }),
          fetchMatch({ make: bMake, model: bModel, year: bYear }),
        ]);
        setCarA(a);
        setCarB(b);
      } catch {
        setError("Could not load comparison data. Go back and try different selections.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [aMake, aModel, aYear, bMake, bModel, bYear]);

  const tenYearDiff = useMemo(() => {
    const a = Number(carA?.ten_year_op_tons);
    const b = Number(carB?.ten_year_op_tons);
    if (isNaN(a) || isNaN(b)) return null;
    return b - a; // positive means A is better (saves vs B)
  }, [carA, carB]);

  const headline = useMemo(() => {
    if (tenYearDiff == null) return { winner: "Vehicle A", savings: "—" };
    if (tenYearDiff >= 0) return { winner: "Vehicle A", savings: formatNum(tenYearDiff) };
    return { winner: "Vehicle B", savings: formatNum(Math.abs(tenYearDiff)) };
  }, [tenYearDiff]);

  const annualTreesSaved = useMemo(() => {
    const aTrees = Number(carA?.trees_needed);
    const bTrees = Number(carB?.trees_needed);
    if (isNaN(aTrees) || isNaN(bTrees)) return null;
    const aAnnual = aTrees / 10;
    const bAnnual = bTrees / 10;
    const saved = headline.winner === "Vehicle A" ? bAnnual - aAnnual : aAnnual - bAnnual;
    return Math.max(0, Math.round(saved));
  }, [carA, carB, headline.winner]);

  const stageBars = useMemo(() => {
    const stages = [
      {
        label: "Manufacturing",
        a: Number(carA?.manufacturing_emission),
        b: Number(carB?.manufacturing_emission),
      },
      {
        label: "Operational (10 Years)",
        a: Number(carA?.ten_year_op_tons),
        b: Number(carB?.ten_year_op_tons),
      },
      {
        label: "End of Life / Disposal",
        a: Number(carA?.disposal_emission),
        b: Number(carB?.disposal_emission),
      },
    ];

    return stages.map((s) => {
      const sum = (isNaN(s.a) ? 0 : s.a) + (isNaN(s.b) ? 0 : s.b);
      const aPct = sum > 0 ? Math.round(((isNaN(s.a) ? 0 : s.a) / sum) * 100) : 50;
      const bPct = 100 - aPct;
      return { ...s, aPct, bPct };
    });
  }, [carA, carB]);

  const breakevenPct = useMemo(() => {
    const y = Number(carA?.breakeven_year);
    if (isNaN(y)) return 28; // fallback look
    return Math.max(0, Math.min(100, Math.round((y / 10) * 100)));
  }, [carA]);

  const riskLabel = (carA?.greenwash_risk || "Low").toUpperCase();
  const riskStyle =
    riskLabel === "HIGH" ? "border-red-500/50 text-red-400 bg-red-500/20" : riskLabel === "MEDIUM" ? "border-amber-500/50 text-amber-400 bg-amber-500/20" : "border-emerald-500/50 text-emerald-300 bg-emerald-500/20";

  const aTitle = `${carA?.make || "Vehicle A"} ${carA?.model || ""}${carA?.model_year ? ` (${carA.model_year})` : ""}`.trim();
  const bTitle = `${carB?.make || "Vehicle B"} ${carB?.model || ""}${carB?.model_year ? ` (${carB.model_year})` : ""}`.trim();

  // recompute total lifecycle from components when available
  const totalA = useMemo(() => {
    if (!carA) return null;
    const m = Number(carA.manufacturing_emission);
    const o = Number(carA.ten_year_op_tons);
    const d = Number(carA.disposal_emission);
    if ([m, o, d].some((v) => isNaN(v))) return carA.total_lifecycle_tons;
    return m + o + d;
  }, [carA]);

  const totalB = useMemo(() => {
    if (!carB) return null;
    const m = Number(carB.manufacturing_emission);
    const o = Number(carB.ten_year_op_tons);
    const d = Number(carB.disposal_emission);
    if ([m, o, d].some((v) => isNaN(v))) return carB.total_lifecycle_tons;
    return m + o + d;
  }, [carB]);

  if (loading) {
    return (
      <div className="bg-[#0a0d0b] text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading comparison...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-6">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/compare");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-bold text-[#13ec5b] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Compare
          </button>
        </div>

        {/* Hero images + headline */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            {/* Vehicle A image */}
            <div className="flex-1 w-full">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/10 bg-[#1a231b]">
                <img
                  alt="Vehicle A"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80"
                />
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded-lg border border-white/20">
                  <span className="text-xs font-bold text-[#13ec5b] uppercase">Vehicle A</span>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="flex flex-col items-center text-center px-4 max-w-md">
              <div className="bg-[#13ec5b]/10 text-[#13ec5b] w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-[#13ec5b]/20">
                <span className="material-symbols-outlined font-bold">compare_arrows</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                {headline.winner} saves{" "}
                <span className="text-[#13ec5b]">{headline.savings} tons CO₂</span> over 10 years
              </h2>
              <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">
                Lifecycle Impact Comparison
              </p>
            </div>

            {/* Vehicle B image */}
            <div className="flex-1 w-full">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/10 bg-[#1a231b]">
                <img
                  alt="Vehicle B"
                  className="w-full h-full object-cover opacity-90"
                  src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80"
                />
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur px-3 py-1 rounded-lg border border-white/20">
                  <span className="text-xs font-bold text-gray-300 uppercase">Vehicle B</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full vehicle comparison + greenwash card */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Spec table */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a231b] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-black/20">
                  <div className="grid grid-cols-3 items-center">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#13ec5b]">analytics</span>
                      <h3 className="font-bold text-white text-lg">Full Vehicle Comparison</h3>
                    </div>
                    <div className="text-center text-[10px] font-black uppercase tracking-widest text-[#13ec5b]">
                      Vehicle A
                    </div>
                    <div className="text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Vehicle B
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <table className="w-full">
                    <tbody>
                      {[
                        ["Vehicle", aTitle, bTitle],
                        ["Total Lifecycle Emissions", `${formatNum(totalA)}t CO₂`, `${formatNum(totalB)}t CO₂`],
                        ["Annual Average Emissions", `${formatNum(carA?.annual_avg_tons)}t CO₂`, `${formatNum(carB?.annual_avg_tons)}t CO₂`],
                        ["Long-Term Carbon Impact (10 years)", `${formatNum(carA?.ten_year_op_tons)}t CO₂`, `${formatNum(carB?.ten_year_op_tons)}t CO₂`],
                        ["Front Carbon Cost (Manufacturing)", `${formatNum(carA?.manufacturing_emission)}t CO₂`, `${formatNum(carB?.manufacturing_emission)}t CO₂`],
                        ["Disposal Emissions", `${formatNum(carA?.disposal_emission)}t CO₂`, `${formatNum(carB?.disposal_emission)}t CO₂`],
                        ["Tailpipe CO₂", `${formatNum(carA?.tailpipe_co2)} g/km`, `${formatNum(carB?.tailpipe_co2)} g/km`],
                        ["Fuel Efficiency", carA?.fuel_efficiency ?? "—", carB?.fuel_efficiency ?? "—"],
                        ["Grid 100 MI", `${formatNum(carA?.grid_100mi)} kg`, `${formatNum(carB?.grid_100mi)} kg`],
                        ["Trees Needed (Lifetime Offset)", `${carA?.trees_needed ?? "—"} Trees`, `${carB?.trees_needed ?? "—"} Trees`],
                        ["Breakeven Year", carA?.breakeven_year != null ? `${formatNum(carA?.breakeven_year)} Years` : "—", carB?.breakeven_year != null ? `${formatNum(carB?.breakeven_year)} Years` : "—"],
                        ["Fuel Type", (Number(carA?.tailpipe_co2) === 0 ? "Electric / BEV" : "ICE") , (Number(carB?.tailpipe_co2) === 0 ? "Electric / BEV" : "ICE")],
                      ].map(([label, a, b]) => (
                        <tr key={label} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-b-0">
                          <td className="py-3 px-6 text-gray-400 font-medium w-1/3">{label}</td>
                          <td className="py-3 px-6 text-center font-bold text-white">{a}</td>
                          <td className="py-3 px-6 text-center font-bold text-gray-200">{b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Net savings highlight */}
                <div className="mt-4 bg-[#102216] p-4 rounded-lg border border-[#13ec5b]/30 text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                    Net Carbon Savings (Operational, 10 years)
                  </p>
                  <p className="text-2xl font-black text-[#13ec5b]">
                    {headline.savings} tons CO₂
                  </p>
                  {mileageParam && (
                    <p className="mt-1 text-[10px] text-gray-500">
                      Based on your input of {mileageParam} km driven per day.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Greenwash Risk card */}
            <div className="bg-[#1a231b] p-6 rounded-2xl border border-red-500/40 relative overflow-hidden h-fit lg:sticky lg:top-24">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400">warning</span>
                  <span className="text-sm font-black text-white uppercase tracking-tight">
                    Greenwash Risk Indicator
                  </span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-black border ${riskStyle}`}>
                  {riskLabel} RISK
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Claims for Vehicle A are supported by ISO-standard lifecycle assessment data and regional grid
                  emissions. No suspicious &quot;carbon neutral&quot; offsets were used in this calculation.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Verified LCA", "No Offset Reliance", "Real-world Grid Data"].map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#102216] text-[9px] px-2 py-1 rounded text-gray-200 uppercase font-bold tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lifecycle breakdown + breakeven chart */}
        <section className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Lifecycle breakdown */}
          <div className="bg-[#1a231b] border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec5b]">bar_chart</span>
                Lifecycle Breakdown
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#13ec5b] rounded-full" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold">A</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-500 rounded-full" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold">B</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {stageBars.map(({ label, a, b, aPct, bPct }) => (
                <div key={label}>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-widest">
                    <span>{label}</span>
                    <span>{`${formatNum(a)}t vs ${formatNum(b)}t`}</span>
                  </div>
                  <div className="h-2 flex gap-1">
                    <div className="h-full bg-[#13ec5b] rounded-full" style={{ width: `${aPct}%` }} />
                    <div className="h-full bg-gray-600 rounded-full" style={{ width: `${bPct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative emissions & breakeven */}
          <div className="bg-[#1a231b] border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec5b]">show_chart</span>
                Cumulative Emissions &amp; Breakeven
              </h3>
            </div>
            <div className="h-48 relative border-l border-b border-white/15 flex items-end">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 0 80 L 100 20" fill="none" stroke="#475569" strokeDasharray="4" strokeWidth="1.5" />
                <path d="M 0 60 L 100 35" fill="none" stroke="#13ec5b" strokeWidth="2.5" />
                <circle cx="28" cy="73" r="2" fill="#13ec5b" />
              </svg>
              <div className="absolute bottom-full mb-1 flex flex-col items-center" style={{ left: `${breakevenPct}%` }}>
                <span className="text-[9px] bg-[#13ec5b] text-black px-1.5 py-0.5 font-black rounded">
                  BREAKEVEN: {carA?.breakeven_year != null ? `${formatNum(carA?.breakeven_year)}Y` : "—"}
                </span>
                <div className="w-px h-4 border-l border-[#13ec5b]/50" />
              </div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold uppercase">
              <span>Year 0</span>
              <span>Year 5</span>
              <span>Year 10</span>
            </div>
          </div>
        </section>

        {/* Insights + environmental equivalence */}
        <section className="grid lg:grid-cols-3 gap-8 pb-8">
          {/* Insights */}
          <div className="lg:col-span-2 bg-[#1a231b] border border-white/10 rounded-2xl p-8">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13ec5b]">lightbulb</span>
              Carbon Impact Insights
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="material-symbols-outlined text-[#13ec5b] mt-1">check_circle</span>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Manufacturing Debt Recovery</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Despite a higher manufacturing footprint due to battery production, Vehicle A offsets this
                    &quot;carbon debt&quot; within the first 34 months of typical usage.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="material-symbols-outlined text-[#13ec5b] mt-1">check_circle</span>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Efficiency Leverage</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    The high MPGe of Vehicle A results in significantly lower annual emissions even when using the
                    current national average power grid mix.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="material-symbols-outlined text-red-400 mt-1">trending_down</span>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Disposal Considerations</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Vehicle A has a slightly higher disposal impact (1.1t) compared to Vehicle B (1.0t) due to
                    specialized battery recycling requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental equivalence */}
          <div className="bg-[#1a231b] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13ec5b]">nature</span>
              Environmental Equivalence
            </h3>
            <div className="space-y-4">
              <div className="text-7xl mb-4">🌲</div>
              <p className="text-5xl font-black text-white">{annualTreesSaved != null ? `${annualTreesSaved} Trees` : "—"}</p>
              <p className="text-sm text-gray-400 uppercase font-bold tracking-[0.2em]">Saved Annually</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ComparisonResult;

