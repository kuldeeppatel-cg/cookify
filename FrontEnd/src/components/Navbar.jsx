import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { useRecipeContext } from '../context/RecipeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { 
    setHasSearched, 
    setSelectedIngredients, 
    setSelectedVegetables, 
    setSelectedFlour, 
    setDietFilter 
  } = useRecipeContext();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const handleLogout = () => {
    // Clear Context State
    setHasSearched(false);
    setSelectedIngredients([]);
    setSelectedVegetables([]);
    setSelectedFlour([]);
    setDietFilter('All');
    
    // Clear Local Storage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-5 transition-all duration-300 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-bold text-2xl text-white tracking-tight py-1">
          <img 
            src="https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png" 
            alt="Cookify Logo" 
            className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-semibold text-base transition-all duration-200 w-auto bg-transparent border border-border-primary text-white hover:border-text-secondary hover:bg-white/5"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
