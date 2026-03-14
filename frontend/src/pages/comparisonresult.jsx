import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { calculateEmissions } from "../utils/emissionsCalculator";
import { useForm } from "../context/FormContext";
import vehicleAImg from "../assets/vehicleA.jpg";
import vehicleBImg from "../assets/vehicleB.jpg";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const toFiniteNumber = (v, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const formatNum = (n, digits = 1) =>
  Number.isFinite(toFiniteNumber(n, NaN)) ? toFiniteNumber(n).toFixed(digits) : "0.0";

const formatGrid = (n) =>
  Number.isFinite(toFiniteNumber(n, NaN)) ? toFiniteNumber(n).toFixed(4) : "0.0000";

const getFuelTypeLabel = (car) => {
  if (!car) return "—";
  const tailpipe = toFiniteNumber(car.tailpipe_co2);
  if (tailpipe === 0) return "EV";
  const ft = (car.fuel_type || "").toLowerCase();
  const modelStr = `${car.make || ""} ${car.model || ""}`.toLowerCase();
  const isHybrid = /hybrid|plug-in|phev/.test(ft) || /hybrid|plug-in/.test(modelStr);
  return isHybrid ? "ICE/Hybrid" : "ICE";
};

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
      if (!make || !model) throw new Error("Missing make/model");
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
        const dailyMiles = toFiniteNumber(mileageParam, 15) * 0.621371;
        setCarA({ ...a, ...calculateEmissions(a, dailyMiles) });
        setCarB({ ...b, ...calculateEmissions(b, dailyMiles) });
      } catch (err) {
        setError("Comparison data fetch failed. Please re-select both vehicles.");
        setCarA(null);
        setCarB(null);
      } finally {
        setLoading(false);
      }
    };
    if (aMake && aModel && bMake && bModel) run();
    else {
      setLoading(false);
      setError("Missing comparison parameters. Return home and select two vehicles.");
    }
  }, [aMake, aModel, aYear, bMake, bModel, bYear, mileageParam]);

  const totalA = useMemo(
    () =>
      carA
        ? toFiniteNumber(carA.manufacturing_emission) +
          toFiniteNumber(carA.ten_year_op_tons) +
          toFiniteNumber(carA.disposal_emission)
        : 0,
    [carA]
  );
  const totalB = useMemo(
    () =>
      carB
        ? toFiniteNumber(carB.manufacturing_emission) +
          toFiniteNumber(carB.ten_year_op_tons) +
          toFiniteNumber(carB.disposal_emission)
        : 0,
    [carB]
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

  const annualTreesSaved = useMemo(() => {
    const aTrees = Number(carA?.trees_needed || 0);
    const bTrees = Number(carB?.trees_needed || 0);
    const diff = isAWinner ? bTrees - aTrees : aTrees - bTrees;
    return Math.max(0, Math.round(diff / 10));
  }, [carA, carB, isAWinner]);

  // Performance Trajectory Data Logic
  const trajectoryData = useMemo(() => {
    if (!carA || !carB) return null;

    const getPoints = (car) => {
      const mfg = toFiniteNumber(car.manufacturing_emission);
      const annual = toFiniteNumber(car.annual_avg_tons);
      const disposal = toFiniteNumber(car.disposal_emission);
      // Calculate cumulative values for Year 0 to Year 10
      return Array.from({ length: 11 }, (_, i) => mfg + (annual * i) + (i === 10 ? disposal : 0));
    };

    const pointsA = getPoints(carA);
    const pointsB = getPoints(carB);
    const rawMax = Math.max(...pointsA, ...pointsB);
    const maxVal = rawMax > 0 ? rawMax * 1.1 : 1;
    const mapY = (val) => 100 - (toFiniteNumber(val) / maxVal * 100);

    return {
      pathA: pointsA.map((v, i) => `${i * 10},${mapY(v)}`).join(" L "),
      pathB: pointsB.map((v, i) => `${i * 10},${mapY(v)}`).join(" L "),
      maxVal
    };
  }, [carA, carB]);

  if (loading)
    return (
      <div className="bg-[#0a0d0b] min-h-screen flex items-center justify-center text-[#13ec5b] animate-pulse font-black uppercase">
        Auditing Performance Data...
      </div>
    );

  if (error)
    return (
      <div className="bg-[#0a0d0b] min-h-screen flex flex-col items-center justify-center text-white px-6 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-red-400 mb-3">Comparison Error</p>
        <p className="text-gray-300 max-w-lg">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-8 py-3 rounded-xl border border-[#13ec5b]/30 text-[#13ec5b] font-bold hover:bg-[#13ec5b]/5 transition-all"
        >
          Back to Home
        </button>
      </div>
    );

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-[#13ec5b] font-black text-xs uppercase tracking-widest hover:opacity-70"
        >
          <span className="material-symbols-outlined">arrow_back</span> Back to Compare
        </button>

        {/* Hero + comparison table in one 3-column grid so table aligns with images */}
        {(() => {
          const comparisonRows = [
            ["Model", `${carA?.make} ${carA?.model}`, `${carB?.make} ${carB?.model}`],
            ["Total Lifecycle", `${formatNum(totalA)}t CO₂`, `${formatNum(totalB)}t CO₂`],
            ["Annual Average", `${formatNum(carA?.annual_avg_tons)}t`, `${formatNum(carB?.annual_avg_tons)}t`],
            ["Manufacturing Cost", `${formatNum(carA?.manufacturing_emission)}t`, `${formatNum(carB?.manufacturing_emission)}t`],
            ["Tailpipe CO₂", `${formatNum(carA?.tailpipe_co2)} g/km`, `${formatNum(carB?.tailpipe_co2)} g/km`],
            ["Grid 100 MI", `${formatGrid(carA?.grid_100mi)} kg`, `${formatGrid(carB?.grid_100mi)} kg`],
            ["Trees Needed", `${carA?.trees_needed ?? "—"}`, `${carB?.trees_needed ?? "—"}`],
            ["Breakeven Year", carA?.breakeven_label ?? "—", carB?.breakeven_label ?? "—"],
            ["Fuel Type", getFuelTypeLabel(carA), getFuelTypeLabel(carB)],
          ];
          return (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* Column 1: Vehicle A image + params */}
              <div className="flex flex-col gap-4">
                <div className="w-full relative rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl">
                  <img src={vehicleAImg} className="w-full h-full object-cover" alt="Vehicle A" />
                  <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-2 rounded-xl border border-[#13ec5b]/50">
                    <span className="text-[10px] font-black text-[#13ec5b]">VEHICLE A</span>
                  </div>
                </div>
                <div className="bg-[#1a231b] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                  <div className="p-4 border-b border-white/10 bg-black/20 font-black text-[9px] uppercase tracking-widest text-center text-[#13ec5b]">Vehicle A</div>
                  <div className="divide-y divide-white/5">
                    {comparisonRows.map(([lbl, a]) => (
                      <div key={lbl} className="px-4 py-3 flex justify-between items-baseline gap-2">
                        <span className="text-gray-500 font-bold text-xs shrink-0">{lbl}</span>
                        <span className="text-[#13ec5b] font-black italic text-sm text-right truncate">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Column 2: Savings + Audit conclusion */}
              <div className="flex flex-col gap-4 md:order-2">
                <div className="flex flex-col items-center justify-center text-center min-h-[180px] md:min-h-0">
                  <h2 className="text-3xl md:text-4xl font-black italic uppercase leading-none">
                    Vehicle {isAWinner ? "A" : "B"} <br />
                    <span className="text-[#13ec5b]">Saves {formatNum(Math.abs(tenYearDiff))}t CO₂</span>
                  </h2>
                  <p className="text-gray-500 text-[9px] mt-3 font-black uppercase tracking-[0.3em]">Full Lifecycle Impact</p>
                </div>
                <div className="p-6 bg-[#1a231b] border border-white/10 rounded-3xl border-t border-white/10 text-center flex flex-col justify-center">
                  <p className="text-[10px] uppercase font-black text-gray-500 mb-2">Audit Conclusion</p>
                  <h4 className={`text-xl font-black italic ${recommendation?.color} mb-1`}>{recommendation?.name}</h4>
                  <p className="text-xs text-gray-400 italic leading-relaxed">{recommendation?.reason}</p>
                </div>
              </div>
              {/* Column 3: Vehicle B image + params */}
              <div className="flex flex-col gap-4 md:order-3">
                <div className="w-full relative rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl">
                  <img src={vehicleBImg} className="w-full h-full object-cover opacity-90" alt="Vehicle B" />
                  <div className="absolute bottom-4 right-4 bg-black/80 px-4 py-2 rounded-xl border border-blue-400/50">
                    <span className="text-[10px] font-black text-blue-400">VEHICLE B</span>
                  </div>
                </div>
                <div className="bg-[#1a231b] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                  <div className="p-4 border-b border-white/10 bg-black/20 font-black text-[9px] uppercase tracking-widest text-center text-blue-400">Vehicle B</div>
                  <div className="divide-y divide-white/5">
                    {comparisonRows.map(([lbl, , b]) => (
                      <div key={lbl} className="px-4 py-3 flex justify-between items-baseline gap-2">
                        <span className="text-gray-500 font-bold text-xs shrink-0">{lbl}</span>
                        <span className="text-blue-400 font-black italic text-sm text-right truncate">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        <section className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Lifecycle Breakdown Section */}
          <div className="bg-[#1a231b] border border-white/10 rounded-3xl p-8">
            <h3 className="font-black text-white flex items-center gap-2 mb-8 uppercase text-[10px] tracking-widest">
              <span className="material-symbols-outlined text-[#13ec5b]">bar_chart</span> Lifecycle Breakdown
            </h3>
            <div className="space-y-6">
              {[
                { lbl: "Manufacturing", a: carA?.manufacturing_emission, b: carB?.manufacturing_emission },
                { lbl: "Operational (10Y)", a: carA?.ten_year_op_tons, b: carB?.ten_year_op_tons },
                { lbl: "Disposal Impact", a: carA?.disposal_emission, b: carB?.disposal_emission },
              ].map((s) => {
                const valA = parseFloat(s.a) || 0;
                const valB = parseFloat(s.b) || 0;
                const total = valA + valB;
                const aP = total > 0 ? (valA / total) * 100 : 50;
                return (
                  <div key={s.lbl}>
                    <div className="flex justify-between text-[9px] font-black mb-2 uppercase italic tracking-wider">
                      <span className="text-gray-400">{s.lbl}</span>
                      <span>
                        <span className="text-[#13ec5b]">{formatNum(s.a)}t</span>
                        <span className="text-gray-600 mx-2">VS</span>
                        <span className="text-blue-400">{formatNum(s.b)}t</span>
                      </span>
                    </div>
                    <div className="h-2 flex gap-1 rounded-full overflow-hidden bg-white/5 border border-white/5">
                      <div className="h-full bg-[#13ec5b] rounded-full" style={{ width: `${aP}%` }} />
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${100 - aP}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Trajectory Graph Section */}
          <div className="bg-[#1a231b] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <h3 className="font-black text-white flex items-center gap-2 mb-6 uppercase text-[10px] tracking-widest">
              <span className="material-symbols-outlined text-[#13ec5b]">timeline</span> Performance Trajectory
            </h3>
            
            <div className="flex gap-4">
              {/* Y-Axis: CO₂ emission (t) */}
              <div className="flex flex-col justify-between text-[8px] text-gray-500 font-black pb-8 h-48 border-r border-white/10 pr-2">
                <span className="text-[7px] uppercase tracking-wider text-gray-400">CO₂ emission (t)</span>
                <span>{Math.round(trajectoryData?.maxVal)}t</span>
                <span>{Math.round(trajectoryData?.maxVal / 2)}t</span>
                <span>0t</span>
              </div>

              <div className="flex-1">
                <div className="h-48 relative border-b border-white/10">
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    {/* Vehicle B - Dashed Blue */}
                    <path d={`M ${trajectoryData?.pathB}`} fill="none" stroke="#60a5fa" strokeDasharray="3" strokeWidth="1.5" />
                    {/* Vehicle A - Solid Green */}
                    <path d={`M ${trajectoryData?.pathA}`} fill="none" stroke="#13ec5b" strokeWidth="2" />
                  </svg>
                  
                </div>

                {/* X-Axis Marks 1 to 10 */}
                <div className="flex justify-between mt-2 px-0">
                  {[...Array(11).keys()].map(year => (
                    <span key={year} className="text-[8px] text-gray-600 font-black">{year}</span>
                  ))}
                </div>
                <p className="text-center text-[7px] text-gray-500 uppercase font-black tracking-widest mt-2">Years of Ownership (Cumulative Debt)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1a231b] border border-white/10 rounded-3xl p-8 shadow-lg">
            <h3 className="font-black text-white mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
              <span className="material-symbols-outlined text-[#13ec5b]">lightbulb</span> Carbon Performance Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-xs font-black text-[#13ec5b] mb-1">Impact Offset</p>
                <p className="text-[10px] text-gray-400 italic">
                  {parseFloat(carA?.breakeven_year) > 0
                    ? `Vehicle A recovers its higher initial manufacturing carbon debt within ${formatNum(parseFloat(carA?.breakeven_year) * 12, 0)} months of usage.`
                    : carA?.breakeven_label === "Immediate"
                      ? "Vehicle A has lower or equal manufacturing emissions than the average gas baseline from day one."
                      : "Compared to the average gas baseline, Vehicle A does not reach carbon parity from operational savings alone."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-xs font-black text-blue-400 mb-1">Efficiency Leverage</p>
                <p className="text-[10px] text-gray-400 italic">
                  The high efficiency rating results in significantly lower annual emissions compared to typical fuel peers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a231b] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <h3 className="font-black text-white mb-2 uppercase text-[10px] tracking-widest">Environmental Equivalence</h3>
            <p className="text-[9px] text-gray-500 mb-3 max-w-[200px]">Trees needed per year to absorb the difference between the two vehicles—choosing the greener one saves this many trees’ worth of offset.</p>
            <div className="text-7xl mb-4">🌲</div>
            <p className="text-5xl font-black text-[#13ec5b]">{annualTreesSaved}</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Trees saved annually</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ComparisonResult;