import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const DEFAULT_CAR_IMAGE = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80";

const CAR_IMAGES = [
  { make: "Tesla", modelMatch: /model\s*3/i, img: "https://images.unsplash.com/photo-1667677600772-3cf7f2dd58a7?w=800&q=80" },
  { make: "Chevrolet", modelMatch: /bolt\s*ev/i, img: "https://images.unsplash.com/photo-1560958089-b8a1929cea0e?w=800&q=80" },
  { make: "Lexus", modelMatch: /rz\s*300e/i, img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80" },
  { make: "Nissan", modelMatch: /leaf/i, img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80" },
  { make: "Toyota", modelMatch: /prius/i, img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80" },
  { make: "Volkswagen", modelMatch: /id\.?4/i, img: "https://images.unsplash.com/photo-1767949374145-b450829c5abb?w=800&q=80" },
  { make: "Ford", modelMatch: /mustang\s*mach-e/i, img: "https://images.unsplash.com/photo-1619384557832-e67eb7ffa4d0?w=800&q=80" },
  { make: "Kia", modelMatch: /ev\s*6|ev6/i, img: "https://images.unsplash.com/photo-1743740390083-e8a07cb48284?w=800&q=80" },
  { make: "Mini", modelMatch: /cooper\s*se|electric/i, img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80" },
  { make: "Hyundai", modelMatch: /ioniq|kona\s*electric/i, img: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80" },
  { make: "Rivian", modelMatch: /r1/i, img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80" },
  { make: "BMW", modelMatch: /i4|i3|ix/i, img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80" },
  { make: "Audi", modelMatch: /e-tron|etron/i, img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80" },
  { make: "Polestar", modelMatch: /2/i, img: "https://images.unsplash.com/photo-1629896428370-d0a6a46a6c1f?w=800&q=80" },
];

const TOP_RECOMMENDATIONS_GRID = [
  { name: "Volvo S60 FWD", make: "Volvo", model: "S60", img: "https://www.motortrend.com/uploads/2023/05/011-2023-Volvo-S60-Recharge-AWD-Black-Edition-front-three-quarters-in-action.jpg", desc: "Efficient luxury sedan with strong fuel economy." },
  { name: "BMW M340i", make: "BMW", model: "M340i", img: "https://vehicle-images.dealerinspire.com/7cc2-110005802/3MW5U9J00M8B50633/d29201d82d88e5f6bb737b378e000653.jpg", desc: "Sporty performance with refined efficiency." },
  { name: "BMW 440i Coupe", make: "BMW", model: "440i", img: "https://wallpaperaccess.com/full/7068414.jpg", desc: "Coupe style with balanced power and economy." },
  { name: "Subaru WRX", make: "Subaru", model: "WRX", img: "https://www.motorisumotori.it/wp-content/uploads/2024/01/Subaru-WRX-S4-STI-Sport-4.jpg", desc: "Rally-bred performance and all-weather capability." },
  { name: "Toyota Corolla", make: "Toyota", model: "Corolla", img: "https://i.ytimg.com/vi/P9zAB5_Y8as/maxresdefault.jpg", desc: "Reliable hybrid with low lifecycle impact." },
  { name: "Tesla Model 3", make: "Tesla", model: "Model 3", img: "https://ymimg1.b8cdn.com/uploads/article/8831/pictures/10704690/2024-Tesla-Model-3-Facelift-2.jpg", desc: "Zero tailpipe emissions and strong efficiency." },
  { name: "Volkswagen ID.4", make: "Volkswagen", model: "ID.4", img: "https://uploads.vw-mms.de/system/production/images/vwn/074/687/images/88d94bf562b7fa86c054ae480249e93b69235964/DB2022AU00705_web_1600.jpg?1661959594", desc: "Zero tailpipe emissions and strong efficiency." },
  { name: "Ford Mustang Mach-E", make: "Ford", model: "Mustang Mach-E", img: "https://cdn.motor1.com/images/mgl/Vz81kz/s1/2022-ford-mustang-mach-e-gt-exterior.jpg", desc: "Sporty electric SUV with good performance." },
  { name: "Kia EV6", make: "Kia", model: "EV6", img: "https://images.carexpert.com.au/resize/3000/-/app/uploads/2021/10/2022-Kia-EV6-AZ3I6693.jpg", desc: "Premium electric crossover with long range." },
];

function getCarImage(make, model) {
  if (!make || !model) return DEFAULT_CAR_IMAGE;
  const m = String(make).trim();
  const mod = String(model).trim();
  const found = CAR_IMAGES.find(
    (entry) => entry.make.toLowerCase() === m.toLowerCase() && entry.modelMatch.test(mod)
  );
  return found ? found.img : DEFAULT_CAR_IMAGE;
}

=======
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

>>>>>>> da49d1c79b21fc64ff2946c5ba397b364011ed34
const Home = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
<<<<<<< HEAD

  const CARDS_PER_VIEW = 3;
  const totalFrames = Math.ceil(TOP_RECOMMENDATIONS_GRID.length / CARDS_PER_VIEW);
  const [activeFrame, setActiveFrame] = useState(0);

  const handlePrevFrame = () => {
    setActiveFrame((prev) => (prev === 0 ? totalFrames - 1 : prev - 1));
  };

  const handleNextFrame = () => {
    setActiveFrame((prev) => (prev + 1) % totalFrames);
  };

  const getCarsForFrame = (frameIndex) => {
    const start = frameIndex * CARDS_PER_VIEW;
    return TOP_RECOMMENDATIONS_GRID.slice(start, start + CARDS_PER_VIEW);
  };
=======
  const [mileage, setMileage] = useState("");
  const [error, setError] = useState("");

  const heroImages = [
    "/photo-1583267746897-2cf415887172.jpeg",
    "/rolls-royce-black-badge-spectre_173994273530.jpg",
    "/20260306_102507_f8e97fec.webp",
    "/Most Expensive Porsche Cars of All Time-jpg-1.webp"
  ];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
>>>>>>> da49d1c79b21fc64ff2946c5ba397b364011ed34

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
<<<<<<< HEAD
          <img
            className="relative z-10 rounded-2xl border border-white/10 shadow-2xl"
            src="https://images.unsplash.com/photo-1583267746897-2cf415887172"
            alt="EV Charging"
          />
=======
          <div className="relative z-10 rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#1a231b]">
            {heroImages.map((img, idx) => (
              <img
                key={idx}
                className={`w-full object-cover transition-opacity duration-1000 ease-in-out ${idx === 0 ? "relative h-auto block" : "absolute inset-0 h-full"
                  } ${idx === currentHeroIndex ? "opacity-100" : "opacity-0"}`}
                src={img}
                alt="EV Hero Slideshow"
              />
            ))}
          </div>
>>>>>>> da49d1c79b21fc64ff2946c5ba397b364011ed34
        </div>
      </section>

      {/* Config Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-[#1a231b] p-8 rounded-xl border border-white/5 shadow-xl">
<<<<<<< HEAD
          <div className="grid md:grid-cols-4 gap-6 items-end">
=======
          <div className="grid md:grid-cols-5 gap-6 items-end">
>>>>>>> da49d1c79b21fc64ff2946c5ba397b364011ed34
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

<<<<<<< HEAD
            <button
              onClick={() => {
=======
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Daily distance (miles)</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Avg daily miles"
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md focus:border-[#13ec5b] outline-none transition-all"
              />
            </div>

            <button
              onClick={() => {
                if (!selectedMake || !selectedModel || !selectedYear) {
                  setError("Please select a Make, Model, and Year to calculate impact.");
                  return;
                }
                setError("");

>>>>>>> da49d1c79b21fc64ff2946c5ba397b364011ed34
                const params = new URLSearchParams();
                if (selectedMake) params.append("make", selectedMake);
                if (selectedModel) params.append("model", selectedModel);
                if (selectedYear) params.append("year", selectedYear);
<<<<<<< HEAD
                navigate(`/vehicle?${params.toString()}`);
              }}
              className="bg-[#13ec5b] text-black h-[46px] font-bold rounded-md hover:bg-[#11d652] transition-colors"
            >
              Compare Impact
            </button>
          </div>
=======
                if (mileage) params.append("mileage", mileage);
                navigate(`/vehicle?${params.toString()}`);
              }}
              className="bg-[#13ec5b] text-black h-[46px] font-bold rounded-md hover:bg-[#11d652] transition-colors text-sm"
            >
              Calculate Impact
            </button>
          </div>
          {error && <p className="mt-4 text-amber-500 text-sm text-center">{error}</p>}
>>>>>>> da49d1c79b21fc64ff2946c5ba397b364011ed34
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
<<<<<<< HEAD
        <p className="text-[#13ec5b] text-sm mb-6">Lowest lifecycle carbon emissions from our dataset—best for the planet.</p>
        <div className="relative flex items-center gap-4">
          <button
            type="button"
            onClick={handlePrevFrame}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-[#13ec5b] flex items-center justify-center hover:bg-[#11d652] transition-colors shadow-lg z-10 text-black"
            aria-label="Previous recommendations"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 overflow-hidden rounded-md">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeFrame * 100}%)` }}
            >
              {Array.from({ length: totalFrames }).map((_, frameIndex) => (
                <div key={frameIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {getCarsForFrame(frameIndex).map((car, index) => (
                      <div
                        key={`${frameIndex}-${index}`}
                        className="bg-[#111812] border border-white/10 rounded-md overflow-hidden hover:border-[#13ec5b]/30 transition-all"
                      >
                        <img className="h-48 w-full object-cover" src={car.img} alt={car.name} />
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white mb-2">{car.name}</h3>
                          <p className="text-gray-400 text-sm mb-4">{car.desc}</p>
                          <button
                            type="button"
                            onClick={() => navigate(`/vehicle?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(car.model)}`)}
                            className="w-full bg-[#13ec5b] text-black text-xs px-4 py-2 rounded-md font-bold hover:bg-[#11d652] transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextFrame}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-[#13ec5b] flex items-center justify-center hover:bg-[#11d652] transition-colors shadow-lg z-10 text-black"
            aria-label="Next recommendations"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
=======
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
>>>>>>> da49d1c79b21fc64ff2946c5ba397b364011ed34
        </div>
      </section>
    </div>
  );
};

export default Home;