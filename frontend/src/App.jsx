import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footernew";
import Home from "./pages/home";
import Compare from "./pages/compare";
import About from "./pages/About";
import ViewDetails from "./pages/viewdetails";
import ComparisonResult from "./pages/comparisonresult";
import ScrollToTop from "./components/ScrollToTop";


function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d0b]">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/comparison-result" element={<ComparisonResult />} />
          <Route path="/about" element={<About />} />
          <Route path="/vehicle" element={<ViewDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;