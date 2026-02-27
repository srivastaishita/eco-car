const About = () => (
  <div className="bg-[#0a0d0b] text-white min-h-screen bg-grid-pattern">
    {/* Hero Section */}
    <section className="relative py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <span className="text-[#13ec5b] font-bold tracking-widest text-xs uppercase bg-[#13ec5b]/10 px-3 py-1 rounded-full">
            Our Story
          </span>
          <h2 className="text-5xl md:text-6xl font-black leading-tight text-white mt-6">
            About <span className="text-[#13ec5b]">Carbon Wise</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mt-6 leading-relaxed">
            Rethinking Vehicle Comparison Through a Climate Lens. We provide the intelligence needed to navigate the transition to sustainable mobility.
          </p>
        </div>
      </div>
    </section>

    {/* Mission & Problem Section */}
    <section className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-10">
      <div className="bg-[#1a231b] border border-white/10 p-10 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-8xl text-[#13ec5b]">target</span>
        </div>
        <div className="relative z-10">
          <div className="bg-[#13ec5b]/20 p-3 rounded-xl inline-block mb-6">
            <span className="material-symbols-outlined text-[#13ec5b] text-3xl">target</span>
          </div>
          <h3 className="text-3xl font-black text-white mb-6">Our Mission</h3>
          <p className="text-lg text-gray-300 leading-relaxed">
            To democratize lifecycle carbon data for the automotive industry, empowering consumers and organizations to make vehicle choices that genuinely align with planetary boundaries.
          </p>
        </div>
      </div>
      <div className="space-y-8">
        <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#13ec5b]">warning</span>
          The Problem We Address
        </h3>
        <div className="space-y-6">
          {[
            { strong: "Fragmented Data:", text: "Current carbon metrics are scattered across manufacturer reports and academic papers." },
            { strong: "Tailpipe Tunnel Vision:", text: "Traditional ratings ignore the massive impact of raw material extraction and battery production." },
            { strong: "Greenwashing Risk:", text: "Without standardized lifecycle analysis, \"eco-friendly\" labels lack verifiable substance." },
            { strong: "Complexity Barrier:", text: "Understanding true environmental impact shouldn't require an environmental science degree." }
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined text-sm">close</span>
              </div>
              <p className="text-gray-400">
                <strong className="text-white">{item.strong}</strong> {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Holistic Approach */}
    <section className="bg-[#1a231b]/50 border-y border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h3 className="text-4xl font-black text-white mb-4">Our Holistic Approach</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">We analyze every stage of a vehicle's life to provide a comprehensive carbon score.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "factory", title: "Manufacturing", desc: "Resource extraction, materials processing, and assembly plant energy consumption." },
            { icon: "electric_car", title: "Operational", desc: "Real-world energy consumption and regional grid carbon intensity for EVs." },
            { icon: "recycling", title: "End-of-Life", desc: "Battery recycling efficiency and component repurposing impact." }
          ].map((step) => (
            <div key={step.icon} className="p-8 bg-[#0a0d0b] rounded-2xl border border-white/10 text-center space-y-4">
              <div className="w-16 h-16 bg-[#13ec5b]/10 rounded-full flex items-center justify-center mx-auto text-[#13ec5b]">
                <span className="material-symbols-outlined text-3xl">{step.icon}</span>
              </div>
              <h4 className="text-xl font-bold text-white uppercase tracking-wider">{step.title}</h4>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* What Makes Us Different */}
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="space-y-8">
          <h3 className="text-4xl font-black text-white">What Makes Carbon Wise Different</h3>
          <ul className="space-y-6">
            {[
              { title: "Hyper-Regional Analysis", desc: "We calculate EV impact based on specific local power grids, not national averages." },
              { title: "Dynamic Data Sourcing", desc: "Our engine continuously updates based on the latest LCA research and battery tech breakthroughs." },
              { title: "Vendor Neutrality", desc: "We don't accept manufacturer sponsorships, ensuring our ratings remain objective and honest." },
              { title: "Comprehensive Visualizations", desc: "Complex datasets are transformed into actionable insights through intuitive dashboards." },
              { title: "Standardized Benchmarking", desc: "Our proprietary Carbon Score provides a universal metric for comparing ICE, Hybrid, and EV." }
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#13ec5b] mt-1">check_circle</span>
                <div>
                  <h5 className="text-lg font-bold text-white">{item.title}</h5>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </section>

    {/* Who It's Built For */}
    <section className="bg-[#0a0d0b] py-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h3 className="text-4xl font-black text-white mb-10">Who Carbon Wise Is Built For</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "person", title: "Car Buyers", desc: "Individual consumers looking to reduce their personal carbon footprint through their next purchase." },
            { icon: "network_manage", title: "Fleet Managers", desc: "Professionals managing corporate vehicle fleets aiming for sustainable procurement targets." },
            { icon: "local_shipping", title: "Logistics", desc: "Supply chain experts optimizing transport emissions across the entire delivery ecosystem." },
            { icon: "bar_chart_4_bars", title: "ESG Teams", desc: "Sustainability officers requiring rigorous data for Scope 3 emissions reporting and compliance." }
          ].map((audience) => (
            <div key={audience.icon} className="bg-[#1a231b] border border-white/10 p-8 rounded-2xl hover:border-[#13ec5b]/50 transition-all text-left group">
              <span className="material-symbols-outlined text-[#13ec5b] text-4xl mb-6 block group-hover:scale-110 transition-transform">{audience.icon}</span>
              <h5 className="text-xl font-bold text-white mb-3">{audience.title}</h5>
              <p className="text-gray-500 text-sm">{audience.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Vision & Transparency */}
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-3xl font-black text-white">Our Vision</h3>
          <p className="text-lg text-gray-400 leading-relaxed">
            We envision a world where carbon impact is as fundamental to vehicle purchasing as safety ratings or price. Our goal is to accelerate the transition to net-zero mobility by making the invisible costs of carbon visible to everyone.
          </p>
        </div>
        <div className="bg-[#13ec5b]/5 border border-[#13ec5b]/20 p-10 rounded-3xl space-y-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-[#13ec5b]">visibility</span>
            Transparency & Responsibility
          </h3>
          <p className="text-gray-400">
            Integrity is our core value. We believe in "Radical Transparency"—meaning we show our work. All our data models are based on peer-reviewed methodologies, and we provide detailed breakdowns of our sources to ensure our platform remains the most trusted source of lifecycle intelligence.
          </p>
        </div>
      </div>
    </section>
  </div>
);

export default About;
