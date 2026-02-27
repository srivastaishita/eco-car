import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const Home = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // 1. Fetch all cars once and derive makes/models/years on the frontend
  useEffect(() => {
    fetch(`${API_BASE}/cars?limit=10000`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCars(data);
          const uniqueMakes = Array.from(new Set(data.map((c) => c.make))).sort();
          const uniqueModels = Array.from(new Set(data.map((c) => c.model))).sort();
          const uniqueYears = Array.from(new Set(data.map((c) => c.model_year))).sort();
          setMakes(uniqueMakes);
          setModels(uniqueModels);
          setYears(uniqueYears);
        }
      })
      .catch((err) => {
        console.error("Cars fetch error:", err);
      });
  }, []);

  // 2. When Make / Model changes, filter models/years from the local cars list
  useEffect(() => {
    if (!cars.length) return;

    let filtered = cars;
    if (selectedMake) filtered = filtered.filter((c) => c.make === selectedMake);

    const nextModels = Array.from(new Set(filtered.map((c) => c.model))).sort();
    setModels(nextModels);
    if (!nextModels.includes(selectedModel)) {
      setSelectedModel("");
    }
  }, [cars, selectedMake]);

  useEffect(() => {
    if (!cars.length) return;

    let filtered = cars;
    if (selectedMake) filtered = filtered.filter((c) => c.make === selectedMake);
    if (selectedModel) filtered = filtered.filter((c) => c.model === selectedModel);

    const nextYears = Array.from(new Set(filtered.map((c) => c.model_year))).sort();
    setYears(nextYears);
    if (!nextYears.includes(Number(selectedYear))) {
      setSelectedYear("");
    }
  }, [cars, selectedMake, selectedModel]);

  return (
    <div className="bg-[#0a0d0b] text-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="bg-[#13ec5b]/10 text-[#13ec5b] text-[10px] tracking-widest font-bold px-3 py-1 rounded-md uppercase">
            Lifecycle Intelligence
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mt-6 leading-tight">
            Measure the True <span className="text-[#13ec5b]">Impact</span>
          </h1>
          <p className="text-gray-400 mt-6 text-lg max-w-md leading-relaxed">
            Go beyond the tailpipe. Evaluate carbon impact from the factory floor to the recycling center.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-[#13ec5b]/20 blur-[80px] rounded-full"></div>
          <img
            className="relative z-10 rounded-2xl border border-white/10 shadow-2xl"
            src="https://images.unsplash.com/photo-1583267746897-2cf415887172"
            alt="EV Charging"
          />
        </div>
      </section>

      {/* Config Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-[#1a231b] p-8 rounded-xl border border-white/5 shadow-xl">
          <div className="grid md:grid-cols-4 gap-6 items-end">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Make</label>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md focus:border-[#13ec5b] outline-none transition-all"
              >
                <option value="">All Makes</option>
                {makes.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md focus:border-[#13ec5b] outline-none transition-all"
              >
                <option value="">All Models</option>
                {models.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md focus:border-[#13ec5b] outline-none transition-all"
              >
                <option value="">All Years</option>
                {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
              </select>
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (selectedMake) params.append("make", selectedMake);
                if (selectedModel) params.append("model", selectedModel);
                if (selectedYear) params.append("year", selectedYear);
                navigate(`/vehicle?${params.toString()}`);
              }}
              className="bg-[#13ec5b] text-black h-[46px] font-bold rounded-md hover:bg-[#11d652] transition-colors"
            >
              Compare Impact
            </button>
          </div>
        </div>
      </section>

      {/* Top 5 Lowest Carbon Emission Cars Chart */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-[#1a231b] p-8 rounded-xl border border-white/5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Top 5 Lowest Carbon Emission Cars
              </h2>
              <p className="text-[#13ec5b] text-sm mt-1">
                Industry leaders in sustainable lifecycle manufacturing and operations.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#13ec5b] text-sm font-semibold">
              <span>Total Lifetime Emission</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { name: "Tesla Model 3", tons: 14.5 },
              { name: "Mini Cooper SE", tons: 15.7 },
              { name: "Nissan Leaf", tons: 16.2 },
              { name: "Lexus RZ 300e", tons: 17.8 },
              { name: "Toyota Prius Prime", tons: 18.9 }
            ].map((car, idx) => {
              const maxTons = 18.9;
              const pct = (car.tons / maxTons) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-medium">{car.name}</span>
                    <span className="text-[#13ec5b] font-bold">{car.tons} tons</span>
                  </div>
                  <div className="h-3 bg-[#0a0d0b] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#13ec5b] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 15)}%` }}
                    />
                  </div>
                  {idx === 0 && <p className="text-[10px] text-gray-500 uppercase font-medium">Lowest emission</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid Section - Top Recommendations */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-10">Top Recommendations</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Volkswagen ID.4", img: "https://imgd.aeplcdn.com/664x374/n/cw/ec/138087/id4-exterior-right-front-three-quarter.jpeg?isig=0&q=80", desc: "Zero tailpipe emissions and strong efficiency." },
            { name: "Mustang Mach-E", img: "https://d2v1gjawtegg5z.cloudfront.net/posts/preview_images/000/015/446/original/2024_Ford_Mustang_Mach-E_Bronze_02.jpeg?1724260399", desc: "Sporty electric SUV with good performance." },
            { name: "Rivian R1S", img: "https://upload.wikimedia.org/wikipedia/commons/8/89/2023_Rivian_R1S_Adventure%2C_front_1.29.23.jpg", desc: "Premium electric SUV with large capacity." }
          ].map((car, index) => (
            <div key={index} className="bg-[#111812] border border-white/10 rounded-md overflow-hidden hover:border-[#13ec5b]/30 transition-all">
              <img className="h-48 w-full object-cover" src={car.img} alt={car.name} />
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{car.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{car.desc}</p>
                <Link
                  to={`/vehicle?name=${encodeURIComponent(car.name)}`}
                  className="block w-full text-center bg-[#13ec5b] text-black text-xs px-4 py-2 rounded-md font-bold hover:bg-[#11d652] transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;