import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { calculateEmissions } from "../utils/emissionsCalculator";
import { useForm } from "../context/FormContext";
import vehicleAImg from "../assets/vehicleA.jpg";
import vehicleBImg from "../assets/vehicleB.jpg";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const formatNum = (n, digits = 1) =>
  n != null && !isNaN(parseFloat(n)) ? Number(n).toFixed(digits) : "0.0";

const ComparisonResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formData } = useForm();

  const [carA, setCarA] = useState(null);
  const [carB, setCarB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const aMake = searchParams.get("aMake");
  const aModel = searchParams.get("aModel");
  const aYear = searchParams.get("aYear");
  const bMake = searchParams.get("bMake");
  const bModel = searchParams.get("bModel");
  const bYear = searchParams.get("bYear");
  const mileageParam = searchParams.get("mileage") || formData.distance || 15;

  useEffect(() => {
    const fetchMatch = async ({ make, model, year }) => {
      const p = new URLSearchParams({ make, model });
      if (year) p.append("year", year);
      const res = await fetch(`${API_BASE}/cars/match?${p.toString()}`);
      if (!res.ok) throw new Error(`No match for ${make}`);
      return await res.json();
    };

    const run = async () => {
      setLoading(true);
      setError(null);
      window.scrollTo(0, 0);
      try {
        const [a, b] = await Promise.all([
          fetchMatch({ make: aMake, model: aModel, year: aYear }),
          fetchMatch({ make: bMake, model: bModel, year: bYear }),
        ]);
        const dailyMiles = Number(mileageParam) * 0.621371;
        setCarA({ ...a, ...calculateEmissions(a, dailyMiles) });
        setCarB({ ...b, ...calculateEmissions(b, dailyMiles) });
      } catch (err) {
        setError("Comparison data fetch failed.");
      } finally {
        setLoading(false);
      }
    };
    if (aMake && bMake) run();
    else setLoading(false);
  }, [aMake, aModel, aYear, bMake, bModel, bYear, mileageParam]);

  // Logic Engine
  const totalA = useMemo(
    () =>
      carA
        ? Number(carA.manufacturing_emission) +
          Number(carA.ten_year_op_tons) +
          Number(carA.disposal_emission)
        : 0,
    [carA],
  );
  const totalB = useMemo(
    () =>
      carB
        ? Number(carB.manufacturing_emission) +
          Number(carB.ten_year_op_tons) +
          Number(carB.disposal_emission)
        : 0,
    [carB],
  );

  const tenYearDiff = useMemo(() => totalB - totalA, [totalA, totalB]);
  const isAWinner = tenYearDiff >= 0;

  const recommendation = useMemo(() => {
    if (!carA || !carB) return null;
    const winner = isAWinner ? carA : carB;
    return {
      name: `${winner.make} ${winner.model}`,
      color: isAWinner ? "text-[#13ec5b]" : "text-blue-400",
      reason: `Vehicle ${isAWinner ? "A" : "B"} is recommended because it saves approximately ${formatNum(Math.abs(tenYearDiff))} tons of CO₂ over a 10-year lifecycle.`,
    };
  }, [carA, carB, isAWinner, tenYearDiff]);

  const riskInfo = useMemo(() => {
    const risk = (carA?.greenwash_risk || "Low").toUpperCase();
    const config = {
      HIGH: {
        icon: "report",
        color: "text-red-500",
        border: "border-red-500/50",
        bg: "bg-red-500/10",
        label: "HIGH",
      },
      MEDIUM: {
        icon: "warning",
        color: "text-amber-500",
        border: "border-amber-500/50",
        bg: "bg-amber-500/10",
        label: "MEDIUM",
      },
      LOW: {
        icon: "check_circle",
        color: "text-[#13ec5b]",
        border: "border-[#13ec5b]/50",
        bg: "bg-[#13ec5b]/10",
        label: "LOW",
      },
    };
    return config[risk] || config.LOW;
  }, [carA]);

  const annualTreesSaved = useMemo(() => {
    const aTrees = Number(carA?.trees_needed || 0);
    const bTrees = Number(carB?.trees_needed || 0);
    const diff = isAWinner ? bTrees - aTrees : aTrees - bTrees;
    return Math.max(0, Math.round(diff / 10));
  }, [carA, carB, isAWinner]);

  if (loading)
    return (
      <div className="bg-[#0a0d0b] min-h-screen flex items-center justify-center text-[#13ec5b] animate-pulse font-black">
        AUDITING DATA...
      </div>
    );

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-[#13ec5b] font-black text-xs uppercase tracking-widest hover:opacity-70"
        >
          <span className="material-symbols-outlined">arrow_back</span> Back to
          Compare
        </button>

        {/* Hero Section */}
        <section className="mb-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="flex-1 w-full relative rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl">
            <img
              src={vehicleAImg}
              className="w-full h-full object-cover"
              alt="Vehicle A"
            />
            <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-2 rounded-xl border border-[#13ec5b]/50">
              <span className="text-[10px] font-black text-[#13ec5b]">
                VEHICLE A
              </span>
            </div>
          </div>
          <div className="max-w-xs mx-auto text-center">
            <h2 className="text-4xl font-black italic uppercase leading-none">
              Vehicle {isAWinner ? "A" : "B"} <br />
              <span className="text-[#13ec5b]">
                Saves {formatNum(Math.abs(tenYearDiff))}t CO₂
              </span>
            </h2>
            <p className="text-gray-500 text-[9px] mt-3 font-black uppercase tracking-[0.3em]">
              Full Lifecycle Impact
            </p>
          </div>
          <div className="flex-1 w-full relative rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl">
            <img
              src={vehicleBImg}
              className="w-full h-full object-cover opacity-80"
              alt="Vehicle B"
            />
            <div className="absolute bottom-4 right-4 bg-black/80 px-4 py-2 rounded-xl border border-blue-400/50">
              <span className="text-[10px] font-black text-blue-400">
                VEHICLE B
              </span>
            </div>
          </div>
        </section>

        {/* Comparison Table + Risk Indicator */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-[#1a231b] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/10 bg-black/20 grid grid-cols-3 font-black text-[9px] uppercase tracking-widest">
              <span className="text-gray-400">Parameters</span>
              <span className="text-center text-[#13ec5b]">Vehicle A</span>
              <span className="text-center text-blue-400">Vehicle B</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  [
                    "Model",
                    `${carA?.make} ${carA?.model}`,
                    `${carB?.make} ${carB?.model}`,
                  ],
                  [
                    "Total Lifecycle",
                    `${formatNum(totalA)}t CO₂`,
                    `${formatNum(totalB)}t CO₂`,
                  ],
                  [
                    "Annual Average",
                    `${formatNum(carA?.annual_avg_tons)}t`,
                    `${formatNum(carB?.annual_avg_tons)}t`,
                  ],
                  [
                    "Manufacturing Cost",
                    `${formatNum(carA?.manufacturing_emission)}t`,
                    `${formatNum(carB?.manufacturing_emission)}t`,
                  ],
                  [
                    "Tailpipe CO₂",
                    `${formatNum(carA?.tailpipe_co2)} g/km`,
                    `${formatNum(carB?.tailpipe_co2)} g/km`,
                  ],
                  [
                    "Grid 100 MI",
                    `${formatNum(carA?.grid_100mi)} kg`,
                    `${formatNum(carB?.grid_100mi)} kg`,
                  ],
                  [
                    "Trees Needed",
                    `${carA?.trees_needed}`,
                    `${carB?.trees_needed}`,
                  ],
                  [
                    "Breakeven Year",
                    `${formatNum(carA?.breakeven_year)} Y`,
                    `${formatNum(carB?.breakeven_year)} Y`,
                  ],
                  [
                    "Fuel Type",
                    carA?.tailpipe_co2 === 0 ? "EV" : "ICE",
                    carB?.tailpipe_co2 === 0 ? "EV" : "ICE",
                  ],
                ].map(([lbl, a, b]) => (
                  <tr
                    key={lbl}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-gray-500 font-bold text-xs">
                      {lbl}
                    </td>
                    <td className="p-4 text-center text-[#13ec5b] font-black italic">
                      {a}
                    </td>
                    <td className="p-4 text-center text-blue-400 font-black italic">
                      {b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-8 bg-black/40 border-t border-white/10 text-center">
              <p className="text-[10px] uppercase font-black text-gray-500 mb-2">
                Recommendation
              </p>
              <h4
                className={`text-2xl font-black italic ${recommendation?.color} mb-1`}
              >
                {recommendation?.name}
              </h4>
              <p className="text-xs text-gray-400 italic leading-relaxed">
                {recommendation?.reason}
              </p>
            </div>
          </div>

          {/* <div className={`p-8 rounded-3xl border ${riskInfo.border} ${riskInfo.bg} h-fit space-y-6 relative overflow-hidden`}>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${riskInfo.color} text-3xl`}>{riskInfo.icon}</span>
                <span className="font-black text-white text-[10px] uppercase">Risk Indicator</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${riskInfo.border} ${riskInfo.color}`}>{riskInfo.label} RISK</span>
            </div>
            <p className="text-xs text-gray-300 italic">"Verified against global LCA standards. Analysis confirms data integrity for Vehicle A."</p>
            <div className="flex flex-wrap gap-2">
              {["Verified LCA", "No Offsets", "Grid Data"].map(tag => (
                <span key={tag} className="bg-black/40 text-[9px] px-2 py-1 rounded text-gray-400 font-black uppercase">{tag}</span>
              ))}
            </div>
          </div> */}
        </section>

        {/* Lifecycle Breakdown Section */}
        <section className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#1a231b] border border-white/10 rounded-3xl p-8">
            <h3 className="font-black text-white flex items-center gap-2 mb-8 uppercase text-[10px] tracking-widest">
              <span className="material-symbols-outlined text-[#13ec5b]">
                bar_chart
              </span>{" "}
              Lifecycle Breakdown
            </h3>
            <div className="space-y-6">
              {[
                {
                  lbl: "Manufacturing",
                  a: carA?.manufacturing_emission,
                  b: carB?.manufacturing_emission,
                },
                {
                  lbl: "Operational (10Y)",
                  a: carA?.ten_year_op_tons,
                  b: carB?.ten_year_op_tons,
                },
                {
                  lbl: "Disposal Impact",
                  a: carA?.disposal_emission,
                  b: carB?.disposal_emission,
                },
              ].map((s) => {
                const total = (parseFloat(s.a) || 0) + (parseFloat(s.b) || 0);
                const aP =
                  total > 0 ? ((parseFloat(s.a) || 0) / total) * 100 : 50;
                return (
                  <div key={s.lbl}>
                    <div className="flex justify-between text-[9px] text-gray-400 font-black mb-2 uppercase italic">
                      <span>{s.lbl}</span>
                      <span>
                        {formatNum(s.a)}t vs {formatNum(s.b)}t
                      </span>
                    </div>
                    <div className="h-2 flex gap-1 rounded-full overflow-hidden bg-white/5 border border-white/5">
                      <div
                        className="h-full bg-[#13ec5b] rounded-full"
                        style={{ width: `${aP}%` }}
                      />
                      <div
                        className="h-full bg-blue-400/30 rounded-full"
                        style={{ width: `${100 - aP}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cumulative Emission & Breakeven SVG */}
          <div className="bg-[#1a231b] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <h3 className="font-black text-white flex items-center gap-2 mb-6 uppercase text-[10px] tracking-widest">
              <span className="material-symbols-outlined text-[#13ec5b]">
                show_chart
              </span>{" "}
              Breakeven Analysis
            </h3>
            <div className="h-40 relative border-l border-b border-white/10 flex items-end px-4">
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  d="M 0 80 L 100 20"
                  fill="none"
                  stroke="#475569"
                  strokeDasharray="4"
                  strokeWidth="1"
                />
                <path
                  d="M 0 65 L 100 35"
                  fill="none"
                  stroke="#13ec5b"
                  strokeWidth="2"
                />
              </svg>
              <div
                className="absolute bottom-full mb-2 flex flex-col items-center"
                style={{ left: "40%" }}
              >
                <span className="text-[8px] bg-[#13ec5b] text-black px-2 py-0.5 font-black rounded-full uppercase">
                  Breakeven: {formatNum(carA?.breakeven_year)}Y
                </span>
                <div className="w-px h-10 border-l border-[#13ec5b]/30 mt-1" />
              </div>
            </div>
            <div className="flex justify-between mt-4 text-[9px] text-gray-500 font-black uppercase">
              <span>Year 0</span>
              <span>Year 5</span>
              <span>Year 10</span>
            </div>
          </div>
        </section>

        {/* Insights & Environmental Equivalence */}
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1a231b] border border-white/10 rounded-3xl p-8 shadow-lg">
            <h3 className="font-black text-white mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
              <span className="material-symbols-outlined text-[#13ec5b]">
                lightbulb
              </span>{" "}
              Carbon Impact Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-xs font-black text-[#13ec5b] mb-1">
                  Manufacturing Debt Recovery
                </p>
                <p className="text-[10px] text-gray-400 italic">
                  Vehicle A offsets its higher initial manufacturing carbon debt
                  within {formatNum(parseFloat(carA?.breakeven_year) * 12, 0)}{" "}
                  months of usage.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-xs font-black text-blue-400 mb-1">
                  Efficiency Leverage
                </p>
                <p className="text-[10px] text-gray-400 italic">
                  The high efficiency rating results in significantly lower
                  annual emissions compared to typical fuel peers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a231b] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <h3 className="font-black text-white mb-4 uppercase text-[10px] tracking-widest">
              Environmental Equivalence
            </h3>
            <div className="text-7xl mb-4">🌲</div>
            <p className="text-5xl font-black text-[#13ec5b]">
              {annualTreesSaved}
            </p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
              Saved Annually
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ComparisonResult;