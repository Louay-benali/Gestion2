import React from 'react';
import Navbar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import SolutionSection from '../components/SolutionSection';
import ProduitSection from '../components/ProduitSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';


const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default HomePage;
