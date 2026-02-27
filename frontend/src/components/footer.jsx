const Footer = () => (
  <footer className="bg-[#0f1711] pt-16 pb-8 border-t border-white/10">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-3 gap-12 mb-12">

            <div>
              <h3 className="text-[#13ec5b] text-lg font-bold mb-4">
                Carbon Wise
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Empowering consumers to make environmentally conscious decisions
                through transparent lifecycle data analysis.
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold uppercase mb-4 tracking-wider">
                Resources
              </h4>

              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="hover:text-[#13ec5b] cursor-pointer">Data Transparency</li>
                <li className="hover:text-[#13ec5b] cursor-pointer">Lifecycle Calculator</li>
                <li className="hover:text-[#13ec5b] cursor-pointer">Carbon Offsetting</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold uppercase mb-4 tracking-wider">
                Support
              </h4>

              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="hover:text-[#13ec5b] cursor-pointer">Methodology Documentation</li>
                <li className="hover:text-[#13ec5b] cursor-pointer">Contact Expert</li>
                <li className="hover:text-[#13ec5b] cursor-pointer">API Access</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2024 Carbon Wise Vehicle Engine. Data based on current EPA and EEA standard reporting cycles.
            </p>
          </div>

        </div>
      </footer>
);
export default Footer;
