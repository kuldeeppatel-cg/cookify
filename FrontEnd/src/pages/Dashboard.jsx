import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, BookOpen, Heart, Clock, Bookmark, Utensils, ArrowRight } from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('currentUser') || 'Chef';
  const { savedRecipes, favoriteRecipes, recentRecipes, recipes } = useRecipeContext();

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="pt-24 min-h-screen flex flex-col max-w-[1200px] mx-auto px-6 pb-20">
      {/* Hero Welcome */}
      <div className="mb-10 py-12 px-8 bg-gradient-to-br from-[#171717] to-[#0a0a0a] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px] group-hover:bg-accent/10 transition-colors duration-700"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Welcome back, <span className="text-accent">{username}!</span></h1>
          <p className="text-text-secondary text-lg max-w-xl leading-relaxed">Your personal kitchen assistant is ready. What are we cooking today?</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Saved Count */}
        <div 
          onClick={() => navigate('/saved')}
          className="p-6 bg-[#171717]/40 backdrop-blur-md border border-white/5 rounded-[2rem] hover:border-accent/30 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bookmark size={26} fill={savedRecipes.length > 0 ? "currentColor" : "none"} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Saved Recipes</p>
              <p className="text-3xl font-black">{savedRecipes.length}</p>
            </div>
          </div>
        </div>

        {/* Favorites Count */}
        <div 
          onClick={() => navigate('/favorites')}
          className="p-6 bg-[#171717]/40 backdrop-blur-md border border-white/5 rounded-[2rem] hover:border-red-500/30 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart size={26} fill={favoriteRecipes.length > 0 ? "currentColor" : "none"} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Favorites</p>
              <p className="text-3xl font-black">{favoriteRecipes.length}</p>
            </div>
          </div>
        </div>

        {/* Total Explored/Creations (Placeholders for now) */}
        <div className="p-6 bg-[#171717]/40 backdrop-blur-md border border-white/5 rounded-[2rem] hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Utensils size={26} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Cooked Today</p>
              <p className="text-3xl font-black">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Clock size={24} className="text-accent" />
            Recently Viewed
          </h2>
          {recentRecipes.length > 0 && (
            <button 
              onClick={() => navigate('/cook-now')}
              className="text-sm font-semibold text-accent flex items-center gap-1 hover:gap-2 transition-all"
            >
              Explore More <ArrowRight size={16} />
            </button>
          )}
        </div>

        {recentRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentRecipes.map((recipe, index) => (
              <div 
                key={index}
                onClick={() => navigate(`/recipe/${recipe._id || recipe.id}`)}
                className="group cursor-pointer bg-[#171717]/40 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all"
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={recipe.image_url || 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png'} 
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { 
                      e.target.src = 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png';
                      e.target.classList.add('p-6', 'object-contain', 'bg-[#1a1a1a]'); 
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">{recipe.title}</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">{recipe.category || 'Recipe'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#171717]/20 border border-dashed border-white/10 rounded-[3rem]">
            <Utensils size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
            <h3 className="text-lg font-bold mb-2">No history yet</h3>
            <p className="text-text-secondary text-sm mb-8">Start your culinary journey by finding a recipe.</p>
            <button
              onClick={() => navigate('/cook-now')}
              className="px-8 py-3 bg-accent/10 border border-accent/20 text-accent rounded-xl font-bold hover:bg-accent hover:text-white transition-all"
            >
              Find a Recipe
            </button>
          </div>
        )}
      </div>

      {/* Suggested Action */}
      <div className="mt-auto py-12 px-8 bg-accent/5 border border-accent/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Feeling Hungry?</h2>
          <p className="text-text-secondary">Explore thousands of recipes tailored to your ingredients.</p>
        </div>
        <button
          onClick={() => navigate('/cook-now')}
          className="px-10 py-4 bg-accent text-white rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(37,116,120,0.4)] transition-all hover:-translate-y-1"
        >
          Start Cooking Now
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
