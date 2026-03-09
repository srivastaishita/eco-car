import { Link } from "react-router-dom";

const Navbar = () => (
  <header className="border-b border-white/10 bg-[#0a0d0b] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

          <Link to="/" className="text-lg font-bold text-[#13ec5b] flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">eco</span>
            Carbon Wise
          </Link>

          <nav className="hidden md:flex space-x-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-[#13ec5b]">Home</Link>
            <Link to="/compare" className="hover:text-[#13ec5b]">Compare</Link>
            <Link to="/about" className="hover:text-[#13ec5b]">About</Link>
          </nav>

        </div>
      </header>
);
export default Navbar;