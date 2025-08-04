import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-x-hidden overflow-y-auto">
      {/* Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400 via-blue-200 to-blue-100 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-tr from-blue-300 via-blue-200 to-blue-100 opacity-20 rounded-full blur-2xl animate-pulse -z-10" />
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage; 