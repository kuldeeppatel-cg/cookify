import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeContext } from '../context/RecipeContext';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  Utensils, 
  CheckCircle2, 
  Timer,
  Carrot,
  Wheat,
  ShoppingBasket,
  Heart,
  Bookmark
} from 'lucide-react';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    recipes, loading, 
    savedRecipes, toggleSaved, 
    favoriteRecipes, toggleFavorite,
    addRecent 
  } = useRecipeContext();

  // Find recipe directly from context during render
  const recipe = recipes?.find(r => (r._id || r.id).toString() === id);

  // Sync with recent recipes once found
  useEffect(() => {
    if (recipe) {
      addRecent(recipe);
    }
  }, [recipe, addRecent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex flex-col items-center justify-center bg-bg-primary">
        <div className="w-28 h-28 md:w-36 md:h-36 mb-6 relative">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain mix-blend-screen">
            <source src="https://res.cloudinary.com/dw4j19xmz/video/upload/v1773475402/Remove_background_project_4_aia7d1.mp4" type="video/mp4" />
          </video>
        </div>
        <h2 className="text-xl md:text-2xl text-text-secondary font-medium animate-pulse mt-2">Loading recipe secrets...</h2>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <div className="bg-bg-secondary p-10 rounded-3xl border border-border-primary">
          <ChefHat size={64} className="mx-auto text-text-secondary mb-6 opacity-20" />
          <h2 className="text-3xl font-bold mb-4">Recipe not found</h2>
          <p className="text-text-secondary mb-8">It seems this recipe has vanished from our kitchen.</p>
          <button 
            onClick={() => navigate('/cook-now')}
            className="px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all"
          >
            Back to Cooking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-24 pb-20 bg-bg-primary">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden">
        <img 
          src={recipe.image_url || 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png'} 
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => { 
            e.target.src = 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png';
            e.target.classList.add('p-20', 'object-contain', 'bg-[#0a0a0a]');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent"></div>
        
        {/* Floating Actions */}
        <div className="absolute top-8 left-6 md:left-12 z-20 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-accent transition-all duration-300 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back</span>
          </button>
        </div>

        <div className="absolute top-8 right-6 md:right-12 z-20 flex items-center gap-3">
          <button 
            onClick={() => toggleFavorite(recipe._id || recipe.id)}
            className={`flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md border transition-all duration-300 ${
              favoriteRecipes.includes(recipe._id || recipe.id) 
                ? 'bg-red-500 border-red-500 text-white shadow-lg' 
                : 'bg-black/40 border-white/20 text-white hover:bg-red-500/40 hover:border-red-500'
            }`}
          >
            <Heart size={20} fill={favoriteRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => toggleSaved(recipe._id || recipe.id)}
            className={`flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md border transition-all duration-300 ${
              savedRecipes.includes(recipe._id || recipe.id) 
                ? 'bg-accent border-accent text-white shadow-lg' 
                : 'bg-black/40 border-white/20 text-white hover:bg-accent/40 hover:border-accent'
            }`}
          >
            <Bookmark size={20} fill={savedRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8 max-w-[1200px] mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              recipe.category?.toLowerCase() === 'veg' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-500'
            }`}>
              {recipe.category}
            </span>
            {recipe.cuisine && (
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                {recipe.cuisine}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            {recipe.title}
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Stats and Ingredients */}
          <div className="lg:col-span-5 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-bg-secondary p-4 rounded-2xl border border-border-primary text-center group hover:border-accent/30 transition-colors">
                <Clock className="mx-auto mb-2 text-text-secondary group-hover:text-accent transition-colors" size={20} />
                <p className="text-[10px] uppercase text-text-secondary font-bold tracking-widest mb-1">Prep</p>
                <p className="text-white font-bold">{recipe.prep_time || '15m'}</p>
              </div>
              <div className="bg-bg-secondary p-4 rounded-2xl border border-border-primary text-center group hover:border-accent/30 transition-colors">
                <Timer className="mx-auto mb-2 text-text-secondary group-hover:text-accent transition-colors" size={20} />
                <p className="text-[10px] uppercase text-text-secondary font-bold tracking-widest mb-1">Cook</p>
                <p className="text-white font-bold">{recipe.cook_time || '25m'}</p>
              </div>
              <div className="bg-bg-secondary p-4 rounded-2xl border border-border-primary text-center group hover:border-accent/30 transition-colors">
                <ChefHat className="mx-auto mb-2 text-text-secondary group-hover:text-accent transition-colors" size={20} />
                <p className="text-[10px] uppercase text-text-secondary font-bold tracking-widest mb-1">Level</p>
                <p className="text-white font-bold">Medium</p>
              </div>
            </div>

            {/* Ingredients Card */}
            <div className="bg-bg-secondary rounded-3xl border border-border-primary overflow-hidden shadow-xl">
              <div className="p-6 border-b border-border-primary bg-white/5 flex items-center gap-3">
                <Utensils className="text-accent" size={20} />
                <h2 className="text-xl font-bold">Ingredients</h2>
              </div>
              <div className="p-6 space-y-6">
                
                {recipe.vegetables && recipe.vegetables.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-3 flex items-center gap-2">
                       <Carrot size={14} /> Vegetables
                    </h3>
                    <ul className="space-y-3">
                      {recipe.vegetables.map((ing, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-md border border-border-primary flex items-center justify-center group-hover:bg-[#10b981]/20 group-hover:border-[#10b981]/40 transition-all">
                            <CheckCircle2 size={12} className="text-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-text-secondary text-sm group-hover:text-white transition-colors">{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.flour && recipe.flour.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3 flex items-center gap-2">
                       <Wheat size={14} /> Flour & Grains
                    </h3>
                    <ul className="space-y-3">
                      {recipe.flour.map((ing, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-md border border-border-primary flex items-center justify-center group-hover:bg-[#f59e0b]/20 group-hover:border-[#f59e0b]/40 transition-all">
                            <CheckCircle2 size={12} className="text-[#f59e0b] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-text-secondary text-sm group-hover:text-white transition-colors">{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                       <ShoppingBasket size={14} /> Other Ingredients
                    </h3>
                    <ul className="space-y-3">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                          <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-md border border-border-primary flex items-center justify-center group-hover:bg-accent/20 group-hover:border-accent/40 transition-all">
                            <CheckCircle2 size={12} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-text-secondary text-sm group-hover:text-white transition-colors">{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Instructions */}
          <div className="lg:col-span-7">
            <div className="bg-bg-secondary rounded-3xl border border-border-primary overflow-hidden shadow-xl h-full">
              <div className="p-6 border-b border-border-primary bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChefHat className="text-accent" size={20} />
                  <h2 className="text-xl font-bold">Step-by-Step Instructions</h2>
                </div>
                {recipe.instructions && (
                  <span className="text-xs text-text-secondary font-medium px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    {recipe.instructions.length} Steps
                  </span>
                )}
              </div>
              <div className="p-4 md:p-8 space-y-10">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((step, i) => (
                    <div key={i} className="relative pl-12 md:pl-16 group">
                      {/* Step Number Badge */}
                      <div className="absolute left-0 top-0 w-8 md:w-10 h-8 md:h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-sm md:text-base group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-lg shadow-accent/5">
                        {i + 1}
                      </div>
                      
                      {/* Timeline Line */}
                      {i < recipe.instructions.length - 1 && (
                        <div className="absolute left-4 md:left-5 top-10 w-[1px] h-[calc(100%+20px)] bg-gradient-to-b from-accent/30 to-transparent"></div>
                      )}

                      <div className="pt-0.5">
                        <p className="text-white text-base md:text-lg leading-relaxed antialiased">
                          {step}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <Utensils size={40} className="mx-auto text-text-secondary opacity-20 mb-4" />
                    <p className="text-text-secondary italic">Instructions are being gathered from the chef...</p>
                  </div>
                )}
              </div>
              
              {/* Encouragement Footer */}
              <div className="p-10 text-center border-t border-border-primary bg-gradient-to-b from-transparent to-accent/5">
                <Utensils className="mx-auto text-accent mb-4" size={32} />
                <h3 className="font-bold text-xl mb-2">You've got this!</h3>
                <p className="text-text-secondary text-sm">Follow these steps carefully for the best results. Happy cooking!</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
