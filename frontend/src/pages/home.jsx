import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../context/FormContext";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const TOP_RECOMMENDATIONS_GRID = [
  { name: "Volvo S60 FWD", make: "Volvo", model: "S60", img: "https://www.motortrend.com/uploads/2023/05/011-2023-Volvo-S60-Recharge-AWD-Black-Edition-front-three-quarters-in-action.jpg", desc: "Efficient luxury sedan with strong fuel economy." },
  { name: "BMW M340i", make: "BMW", model: "M340i", img: "https://vehicle-images.dealerinspire.com/7cc2-110005802/3MW5U9J00M8B50633/d29201d82d88e5f6bb737b378e000653.jpg", desc: "Sporty performance with refined efficiency." },
  { name: "BMW 440i Coupe", make: "BMW", model: "440i", img: "https://wallpaperaccess.com/full/7068414.jpg", desc: "Coupe style with balanced power and economy." },
  { name: "Subaru WRX", make: "Subaru", model: "WRX", img: "https://www.motorisumotori.it/wp-content/uploads/2024/01/Subaru-WRX-S4-STI-Sport-4.jpg", desc: "Rally-bred performance and all-weather capability." },
  { name: "Toyota Corolla", make: "Toyota", model: "Corolla", img: "https://i.ytimg.com/vi/P9zAB5_Y8as/maxresdefault.jpg", desc: "Reliable hybrid with low lifecycle impact." },
  { name: "Tesla Model 3", make: "Tesla", model: "Model 3", img: "https://ymimg1.b8cdn.com/uploads/article/8831/pictures/10704690/2024-Tesla-Model-3-Facelift-2.jpg", desc: "Zero tailpipe emissions and strong efficiency." },
];

const LOOP_DATA = [...TOP_RECOMMENDATIONS_GRID, ...TOP_RECOMMENDATIONS_GRID.slice(0, 3)];

const Home = () => {
  const navigate = useNavigate();
  const { formData, updateForm } = useForm();

  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [error, setError] = useState("");

  const heroImages = [
    "https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200"
  ];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalOriginalItems = TOP_RECOMMENDATIONS_GRID.length;

  // --- Handlers ---

  const handleManualSlide = useCallback((direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const cards = container.children;
    if (cards.length === 0) return;

    // Calculate exact width of one card + the gap (24px for gap-6)
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24; 
    const scrollStep = cardWidth + gap;

    let newIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;

    container.scrollTo({
      left: newIndex * scrollStep,
      behavior: "smooth",
    });

    setCurrentIndex(newIndex);

    // Infinite Loop Reset Logic
    if (newIndex >= totalOriginalItems) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
          setCurrentIndex(0);
        }
      }, 500);
    } else if (newIndex < 0) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ 
            left: totalOriginalItems * scrollStep, 
            behavior: "auto" 
          });
          setCurrentIndex(totalOriginalItems);
        }
      }, 0);
    }
  }, [currentIndex, totalOriginalItems]);

  // --- Effects ---

  // 1. Hero Auto-Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // 2. Recommendations Auto-Slider
  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isPaused) {
        handleManualSlide("right");
      }
    }, 3000);
    return () => clearInterval(slideInterval);
  }, [isPaused, handleManualSlide]);

  // 3. Data Fetching
  useEffect(() => {
    fetch(`${API_BASE}/cars?limit=10000`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCars(data);
          setMakes(Array.from(new Set(data.map((c) => c.make))).sort());
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // 4. Filter Logic
  useEffect(() => {
    const filtered = formData.make && formData.make !== "All Makes"
      ? cars.filter((c) => c.make === formData.make)
      : cars;
    setModels(Array.from(new Set(filtered.map(c => c.model))).sort());
    setYears(Array.from(new Set(filtered.map(c => c.model_year))).sort());
  }, [formData.make, cars]);

  const handleCalculate = () => {
    const hasMake = formData.make && formData.make !== "All Makes";
    const hasModel = formData.model && formData.model !== "All Models";
    const hasYear = formData.year && formData.year !== "All Years";

    if (!hasMake || !hasModel || !hasYear) {
      setError("Please select a Make, Model, and Year.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      make: formData.make,
      model: formData.model,
      year: formData.year,
      ...(formData.distance && { mileage: formData.distance }),
    });
    navigate(`/vehicle?${params.toString()}`);
  };

  return (
    <div className="bg-[#0a0d0b] text-white min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="bg-[#13ec5b]/10 text-[#13ec5b] text-[10px] tracking-widest font-bold px-3 py-1 rounded-md uppercase">
            Lifecycle Intelligence
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Measure the True <span className="text-[#13ec5b]">Impact</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            Go beyond the tailpipe. Evaluate carbon impact from the factory floor to recycling.
          </p>
        </div>
        <div className="relative h-64 md:h-96">
          <div className="absolute -inset-4 bg-[#13ec5b]/20 blur-[80px] rounded-full"></div>
          <div className="relative z-10 h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#1a231b]">
            {heroImages.map((img, idx) => (
              <img
                key={idx}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentHeroIndex ? "opacity-100" : "opacity-0"}`}
                src={img}
                alt={`Hero ${idx}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Config Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-[#1a231b] p-8 rounded-xl border border-white/5 shadow-xl">
          <div className="grid md:grid-cols-5 gap-6 items-end">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Make</label>
              <select
                value={formData.make === "All Makes" ? "" : formData.make}
                onChange={(e) =>
                  updateForm({ make: e.target.value || "All Makes", model: "All Models", year: "All Years" })
                }
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md outline-none focus:border-[#13ec5b]"
              >
                <option value="">All Makes</option>
                {makes.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Model</label>
              <select
                value={formData.model === "All Models" ? "" : formData.model}
                onChange={(e) =>
                  updateForm({ model: e.target.value || "All Models", year: "All Years" })
                }
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md outline-none focus:border-[#13ec5b]"
              >
                <option value="">All Models</option>
                {models.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Year</label>
              <select
                value={formData.year === "All Years" ? "" : formData.year}
                onChange={(e) => updateForm({ year: e.target.value || "All Years" })}
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md outline-none focus:border-[#13ec5b]"
              >
                <option value="">All Years</option>
                {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Daily distance (km)</label>
              <input
                type="number"
                value={formData.distance}
                onChange={(e) => updateForm({ distance: e.target.value })}
                placeholder="Avg daily km"
                className="w-full bg-[#0a0d0b] border border-white/10 text-sm p-3 rounded-md outline-none focus:border-[#13ec5b]"
              />
            </div>
            <button onClick={handleCalculate} className="bg-[#13ec5b] text-black h-[46px] font-bold rounded-md hover:bg-[#11d652] transition-colors">
              Calculate Impact
            </button>
          </div>
          {error && <p className="mt-4 text-amber-500 text-sm text-center">{error}</p>}
        </div>
      </section>

      {/* Recommendations Carousel */}
      <section className="max-w-7xl mx-auto px-6 pb-24 relative group">
        <h2 className="text-2xl font-bold mb-10">Top Recommendations</h2>
        
        <div className="relative px-12 flex items-center">
          <button 
            onClick={() => handleManualSlide("left")} 
            className="absolute left-0 z-10 bg-black/50 p-3 rounded-full border border-white/20 hidden md:group-hover:block hover:bg-[#13ec5b] hover:text-black transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-hidden no-scrollbar w-full"
          >
            {LOOP_DATA.map((car, index) => (
              <div 
                key={index} 
                className="w-full md:w-[calc((100%-48px)/3)] flex-shrink-0 bg-[#1a231b] border border-white/10 rounded-xl overflow-hidden hover:border-[#13ec5b]/50 transition-all"
              >
                <img className="h-48 w-full object-cover" src={car.img} alt={car.name} />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">{car.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{car.desc}</p>
                  <Link 
                    to={`/vehicle?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(car.model)}`}
                    className="block w-full text-center border border-[#13ec5b] text-[#13ec5b] hover:bg-[#13ec5b] hover:text-black py-2 rounded-md font-bold transition-all text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => handleManualSlide("right")}
            className="absolute right-0 z-10 bg-black/50 p-3 rounded-full border border-white/20 hidden md:group-hover:block hover:bg-[#13ec5b] hover:text-black transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;