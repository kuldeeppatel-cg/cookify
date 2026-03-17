import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, BookOpen, Heart, Clock, Bookmark, Utensils, ArrowRight, Plus } from 'lucide-react';
import { useRecipeContext } from '../context/RecipeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('currentUser') || 'Chef';
  const { savedRecipes, favoriteRecipes, recentRecipes, recipes, loading, isUserLoading, error } = useRecipeContext();

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex flex-col items-center justify-center bg-bg-primary">
        <div className="w-28 h-28 md:w-36 md:h-36 mb-6 relative">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain mix-blend-screen">
            <source src="https://res.cloudinary.com/dw4j19xmz/video/upload/v1773475402/Remove_background_project_4_aia7d1.mp4" type="video/mp4" />
          </video>
        </div>
        <h2 className="text-xl md:text-2xl text-text-secondary font-medium animate-pulse mt-2">Waking up the chef...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <div className="bg-bg-secondary p-10 rounded-3xl border border-red-500/20 max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Dashboard Error</h2>
          <p className="text-text-secondary mb-8">We couldn't load your dashboard data. Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all"
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

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

      {/* Quick Actions - Specifically for Add Recipe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div 
          onClick={() => navigate('/add-recipe')}
          className="md:col-span-2 p-8 bg-accent/10 border border-accent/20 rounded-[2rem] flex items-center justify-between cursor-pointer group hover:bg-accent/20 transition-all shadow-lg hover:shadow-accent/5"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Share Your Recipe</h3>
              <p className="text-text-secondary text-sm">Add your own culinary masterpiece to your collection.</p>
            </div>
          </div>
          <ArrowRight className="text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
        </div>
        
        <div 
          onClick={() => navigate('/cook-now')}
          className="p-8 bg-[#171717] border border-white/5 rounded-[2rem] flex flex-col justify-center cursor-pointer group hover:border-white/10 transition-all"
        >
          <div className="mb-4 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-accent/20 group-hover:text-accent transition-colors">
            <Utensils size={24} />
          </div>
          <h3 className="font-bold mb-1">Cook Now</h3>
          <p className="text-text-secondary text-xs">Find recipes by ingredients.</p>
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Clock size={24} className="text-accent" />
            Recently Viewed
          </h2>
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
                  
                  {/* Diet Badge (Top Right) */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className={`p-1 rounded-lg backdrop-blur-md border ${
                      recipe.category?.toLowerCase() === 'veg' 
                        ? 'bg-[#10b981]/10 border-[#10b981]/30' 
                        : 'bg-[#ef4444]/10 border-[#ef4444]/30'
                    }`}>
                      <div className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${
                        recipe.category?.toLowerCase() === 'veg' ? 'border-[#10b981]' : 'border-[#ef4444]'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          recipe.category?.toLowerCase() === 'veg' ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">{recipe.title}</h3>
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
