import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecipeContext } from '../context/RecipeContext';
import { 
  ArrowLeft, Heart, Bookmark, Clock, ChefHat, Utensils, 
  Search, Info 
} from 'lucide-react';

const Collections = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipes, savedRecipes, favoriteRecipes, toggleSaved, toggleFavorite, addRecent, dietFilter, setDietFilter } = useRecipeContext();
  
  // Determine if we are viewing Saved or Favorites based on the URL
  const isFavorites = location.pathname === '/favorites';
  const collectionTitle = isFavorites ? 'My Favorites' : 'Saved Recipes';
  const collectionType = isFavorites ? favoriteRecipes : savedRecipes;

  const baseCollectionItems = useMemo(() => {
    if (!recipes || !collectionType) return [];
    return recipes.filter(r => collectionType.includes(r._id || r.id));
  }, [recipes, collectionType]);

  const dietCounts = useMemo(() => {
    return {
      All: baseCollectionItems.length,
      Veg: baseCollectionItems.filter(r => r.category?.toLowerCase() === 'veg').length,
      'Non-Veg': baseCollectionItems.filter(r => r.category?.toLowerCase() === 'non-veg').length
    };
  }, [baseCollectionItems]);

  const collectionItems = useMemo(() => {
    return baseCollectionItems.filter(recipe => {
      return dietFilter === 'All' || (recipe.category && recipe.category.toLowerCase() === dietFilter.toLowerCase());
    });
  }, [baseCollectionItems, dietFilter]);

  return (
    <div className="min-h-screen pt-32 md:pt-44 pb-20 bg-bg-primary px-6">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 px-5 py-2.5 bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-full font-medium text-sm text-text-secondary transition-all duration-300 hover:text-white hover:border-accent hover:shadow-[0_0_20px_rgba(37,116,120,0.3)] hover:-translate-x-1 mb-4"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 group-hover:bg-accent transition-colors duration-300">
                <ArrowLeft size={16} className="text-text-secondary group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-4">
              {isFavorites ? (
                <Heart size={40} className="text-red-500" fill="currentColor" />
              ) : (
                <Bookmark size={40} className="text-accent" fill="currentColor" />
              )}
              {collectionTitle}
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              {baseCollectionItems.length} {baseCollectionItems.length === 1 ? 'recipe' : 'recipes'} in your collection
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex bg-[#171717] p-1 rounded-2xl border border-white/5 shadow-md self-start md:self-end">
              <button
                onClick={() => navigate('/saved')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  !isFavorites ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:text-white'
                }`}
              >
                <Bookmark size={16} fill={!isFavorites ? "currentColor" : "none"} />
                Saved
              </button>
              <button
                onClick={() => navigate('/favorites')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  isFavorites ? 'bg-red-500 text-white shadow-lg' : 'text-text-secondary hover:text-white'
                }`}
              >
                <Heart size={16} fill={isFavorites ? "currentColor" : "none"} />
                Favorites
              </button>
            </div>

            {/* Diet Filter with Counts */}
            <div className="flex bg-[#171717] p-1 rounded-xl border border-white/5 shadow-md w-full md:w-auto">
              {['All', 'Veg', 'Non-Veg'].map(type => (
                <button
                  key={type}
                  onClick={() => setDietFilter(type)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-center flex items-center justify-center gap-2 min-w-[80px] ${dietFilter === type
                      ? type === 'Veg' ? 'bg-[#10b981]/20 text-[#10b981]' : type === 'Non-Veg' ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-white/10 text-white'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                >
                  {type}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${dietFilter === type ? 'bg-white/10' : 'bg-white/5 border border-white/5'}`}>
                    {dietCounts[type]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Section */}
        {collectionItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {collectionItems.map((recipe) => (
              <div 
                key={recipe._id || recipe.id}
                className="flex flex-col bg-[#171717]/40 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-white/10 group relative"
              >
                {/* Image Area */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={recipe.image_url || 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png'} 
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { 
                      e.target.src = 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png';
                      e.target.classList.add('p-10', 'object-contain', 'bg-[#1a1a1a]'); 
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60"></div>
                  
                  {/* Diet Badge (Top Right) */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`p-1.5 rounded-lg backdrop-blur-md border ${
                      recipe.category?.toLowerCase() === 'veg' 
                        ? 'bg-[#10b981]/10 border-[#10b981]/30' 
                        : 'bg-[#ef4444]/10 border-[#ef4444]/30'
                    }`}>
                      <div className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${
                        recipe.category?.toLowerCase() === 'veg' ? 'border-[#10b981]' : 'border-[#ef4444]'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          recipe.category?.toLowerCase() === 'veg' ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Toggle Hidden by default, shown on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => {
                        addRecent(recipe);
                        navigate(`/recipe/${recipe._id || recipe.id}`);
                      }}
                      className="px-6 py-3 bg-white text-black font-bold rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-accent hover:text-white"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                      {recipe.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-text-secondary text-xs mb-6">
                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                      <Clock size={14} /> {recipe.prep_time || '15m'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                      <ChefHat size={14} /> {recipe.cuisine || 'Global'}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleFavorite(recipe._id || recipe.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          favoriteRecipes.includes(recipe._id || recipe.id) 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : 'bg-white/5 text-text-secondary border border-white/5 hover:bg-red-500/10 hover:text-red-500'
                        }`}
                        title="Favorite"
                      >
                        <Heart size={16} fill={favoriteRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => toggleSaved(recipe._id || recipe.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          savedRecipes.includes(recipe._id || recipe.id) 
                            ? 'bg-accent/10 text-accent border border-accent/20' 
                            : 'bg-white/5 text-text-secondary border border-white/5 hover:bg-accent/10 hover:text-accent'
                        }`}
                        title="Save"
                      >
                        <Bookmark size={16} fill={savedRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <button 
                      onClick={() => navigate(`/recipe/${recipe._id || recipe.id}`)}
                      className="text-accent text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                      Recipe &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-32 flex flex-col items-center justify-center bg-[#171717]/20 border border-dashed border-white/10 rounded-[4rem] text-center px-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
              {isFavorites ? (
                <Heart size={48} className="text-text-secondary opacity-20" />
              ) : (
                <Bookmark size={48} className="text-text-secondary opacity-20" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-4">No {isFavorites ? 'favorites' : 'saved recipes'} yet</h2>
            <p className="text-text-secondary text-lg max-w-md mb-10 leading-relaxed">
              Start exploring our collection and save the recipes you love. They'll show up here for quick access later.
            </p>
            <button
              onClick={() => navigate('/cook-now')}
              className="px-10 py-4 bg-accent text-white rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(37,116,120,0.3)] transition-all transform hover:-translate-y-1"
            >
              Explore Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
