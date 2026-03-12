import React, { useState } from "react";

const Footer = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How is the Break-even Point calculated?",
      a: "It is the mileage where the EV's manufacturing 'Carbon Debt' is neutralized by its operational savings compared to an ICE vehicle.",
    },
    {
      q: "How is my location used?",
      a: "We fetch real-time Grid Intensity (e.g., Pune's Coal mix) from the CEA API to calculate your specific charging footprint.",
    },
    {
      q: "What is the Anti-Greenwash filter?",
      a: "We flag vehicles whose marketing claims ignore the 7–15 ton 'Battery Debt' incurred during manufacturing.",
    },
  ];

  return (
    <footer className="bg-[#0a0c0b] text-slate-400 py-16 px-8 font-sans border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Column 1: Identity */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Carbon-Wise</h2>
          <p className="text-sm leading-relaxed">
            Deciphering the true environmental cost of mobility through
            data-driven Lifecycle Analysis.
          </p>
          <p className="text-xs font-mono text-emerald-400">
            Prototype | Technex'26
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold mb-4">Platform</h3>
          <ul className="text-sm space-y-2">
            <li>
              <a href="/compare" className="hover:text-emerald-400 transition">
                Truth Engine (Comparison)
              </a>
            </li>
            <li>
              <a href="/labels" className="hover:text-emerald-400 transition">
                Nutritional Labels
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Logic FAQ (Accordion) */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold mb-4">Core Logic FAQs</h3>
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-slate-800 pb-2">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="text-xs font-medium text-left w-full flex justify-between hover:text-white"
              >
                {faq.q} <span>{openFaq === index ? "-" : "+"}</span>
              </button>
              {openFaq === index && (
                <p className="text-[10px] mt-2 text-slate-400 italic">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Column 4: Technical */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold mb-4">Transparency</h3>
          <ul className="text-sm space-y-2">
            <li>
              <a
                href="https://cea.nic.in"
                target="_blank"
                className="hover:text-emerald-400"
              >
                CEA Grid API Source
              </a>
            </li>
            <li className="text-[10px] mt-4 opacity-50">
              Estimates for educational use. Results vary by grid & driving
              style.
            </li>
          </ul>
        </div>
      </div>

      {/* Compliance Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest">
        <p>© 2026 Carbon-Wise Team | Developed for Technex'26</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
