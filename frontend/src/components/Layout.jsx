import React from 'react';
import Footer from './Footer'; // Import the footer we made

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* You can add your Navbar here too! */}
      
      {/* The main content of your current page */}
      <main className="flex-grow">
        {children}
      </main>

      {/* The Footer will now stay at the bottom of every page */}
      <Footer />
    </div>
  );
};

export default Layout;