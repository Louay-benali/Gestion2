import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg z-50 relative text-[#111C24] navbar" >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center font-medium">
        {/* Logo + App Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4297FF] rounded-full flex items-center justify-center font-bold text-lg">
            M
          </div>
          <span className="text-xl font-semibold">MainTech</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8 mx-auto">
          <div className="hover:bg-[#F5F5F5] rounded a-container  py-2 px-4">
            <a href="#" className="text-[16px] hover:text-[#003092] transition ">Accueil</a>
          </div>
          <div className="hover:bg-[#F5F5F5] rounded a-container  py-2 px-4">
            <a href="#solution" className="text-[16px] hover:text-[#003092] transition ">Solution</a>
          </div>
          <div className="hover:bg-[#F5F5F5] rounded a-container  py-2 px-4">
            <a href="#produit" className="text-[16px] hover:text-[#003092] transition ">Produit</a>
          </div>
          <div className="hover:bg-[#F5F5F5] rounded a-container  py-2 px-4">
            <a href="#contact" className="text-[16px] hover:text-[#003092] transition ">Contact</a>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button className="bg-transparent text-[#003092] border-2 border-[#003092] py-2 px-4 rounded hover:bg-[#003092] hover:text-white transition">Se connecter</button>
          <button className="bg-[#003092] text-white py-2 px-4 rounded hover:bg-[#003092] transition">Commencer</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
