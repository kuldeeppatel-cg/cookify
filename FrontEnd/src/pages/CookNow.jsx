import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeContext } from '../context/RecipeContext';
import { Loader2, ChefHat, Search, ArrowRight, ArrowLeft } from 'lucide-react';

const CookNow = () => {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipeContext();
  
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');

  // Extract all unique ingredients from recipes to display as tags
  const allIngredients = useMemo(() => {
    if (!recipes) return [];
    
    // Helper to strip quantities, measurements, and prep words to just get the base ingredient
    const cleanIngredientName = (ing) => {
      let text = ing.split(',')[0].toLowerCase();
      // Remove numbers, fractions, and special symbols
      text = text.replace(/[\d\/\½\⅓\¼\¾\⅛\⅜\⅝\⅞\-.]+/g, ' ');
      // Remove units and common modifiers
      const wordsToRemove = [
        'cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons', 'oz', 'ounce', 'ounces', 
        'lb', 'lbs', 'pound', 'pounds', 'g', 'gram', 'grams', 'kg', 'ml', 'liter', 'liters', 'pinch', 'dash', 
        'clove', 'cloves', 'piece', 'pieces', 'slice', 'slices', 'can', 'cans', 'package', 'packages', 'jar', 'jars', 
        'bunch', 'bunches', 'stalk', 'stalks', 'head', 'heads', 'diced', 'chopped', 'minced', 'sliced', 'crushed', 
        'grated', 'peeled', 'fresh', 'dried', 'ground', 'roasted', 'toasted', 'mashed', 'melted', 'softened', 'large', 
        'medium', 'small', 'whole', 'half', 'quarter', 'taste', 'for', 'to', 'of', 'and'
      ];
      const regex = new RegExp(`\\b(${wordsToRemove.join('|')})\\b`, 'gi');
      text = text.replace(regex, ' ');
      // Remove special characters besides alphabets
      text = text.replace(/[^a-z\s]/g, ' ');
      text = text.replace(/\s+/g, ' ').trim();
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const ingredientsSet = new Set();
    recipes.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          if (typeof ing === 'string') {
            let cleanIng = cleanIngredientName(ing);
            // Ensure the cleaned string isn't empty and acts as a solid tag
            if (cleanIng && cleanIng.length > 2) {
              ingredientsSet.add(cleanIng);
            }
          }
        });
      }
    });
    return Array.from(ingredientsSet).sort();
  }, [recipes]);

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const filteredIngredientList = useMemo(() => {
    if (!ingredientSearchQuery) return allIngredients.slice(0, 60); // Show top 60 if no search
    return allIngredients.filter(ing => ing.includes(ingredientSearchQuery.toLowerCase())).slice(0, 60);
  }, [allIngredients, ingredientSearchQuery]);

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter(recipe => {
      // Filter by ingredients first
      const hasIngredients = selectedIngredients.length === 0 || selectedIngredients.every(selected => {
        if (!recipe.ingredients) return false;
        return recipe.ingredients.some(ri => 
          typeof ri === 'string' && ri.toLowerCase().includes(selected)
        );
      });

      // Filter by search query second
      const matchesSearch = !recipeSearchQuery || (recipe.title && recipe.title.toLowerCase().includes(recipeSearchQuery.toLowerCase()));

      return hasIngredients && matchesSearch;
    });
  }, [recipes, selectedIngredients, recipeSearchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex flex-col items-center justify-center">
        <div className="w-28 h-28 md:w-36 md:h-36 mb-6 relative">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain mix-blend-screen">
            <source src="https://res.cloudinary.com/dw4j19xmz/video/upload/v1773475402/Remove_background_project_4_aia7d1.mp4" type="video/mp4" />
          </video>
        </div>
        <h2 className="text-xl md:text-2xl text-text-secondary font-medium animate-pulse mt-2">Fetching fresh ingredients...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex flex-col items-center justify-center">
        <div className="p-6 bg-red-500/10 border border-error rounded-2xl max-w-lg text-center">
          <h2 className="text-2xl font-bold text-error mb-2">Oops! Something went wrong</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 max-w-[1200px] mx-auto">
      
      {!hasSearched ? (
        /* STEP 1: Ingredient Selection */
        <div className="max-w-3xl mx-auto flex flex-col items-center relative">
          <div className="w-full flex justify-start mb-8 -ml-4 lg:-ml-12">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 px-5 py-2.5 bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-full font-medium text-sm text-text-secondary transition-all duration-300 hover:text-white hover:border-accent hover:shadow-[0_0_20px_rgba(37,116,120,0.3)] hover:-translate-x-1"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-accent transition-colors duration-300">
                <ArrowLeft size={16} className="text-text-secondary group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="tracking-wide">Dashboard</span>
            </button>
          </div>
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#f8fafc] to-[#94a3b8] bg-clip-text text-transparent">
              What's in your kitchen?
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Select the ingredients you have on hand, and we'll find the perfect recipes you can cook right now.
            </p>
          </div>

          <div className="w-full bg-bg-secondary border border-border-primary rounded-3xl p-8 shadow-xl">
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={22} className="text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search ingredients (e.g., chicken, garlic, tomatoes)..."
                value={ingredientSearchQuery}
                onChange={(e) => setIngredientSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-bg-primary/50 border border-border-primary rounded-2xl text-text-primary text-lg transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,116,120,0.2)]"
              />
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                {selectedIngredients.length > 0 ? `${selectedIngredients.length} Ingredients Selected` : 'Popular Ingredients'}
              </h3>
              
              <div className="flex flex-wrap gap-3 max-h-[350px] overflow-y-auto px-1 py-1 custom-scrollbar">
                {filteredIngredientList.length === 0 ? (
                  <p className="text-text-secondary italic">No ingredients found.</p>
                ) : (
                  filteredIngredientList.map((ingredient, idx) => {
                    const isSelected = selectedIngredients.includes(ingredient);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleIngredient(ingredient)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                          isSelected 
                            ? 'bg-accent border-accent text-white shadow-[0_4px_12px_rgba(37,116,120,0.4)] md:-translate-y-0.5' 
                            : 'bg-bg-primary/50 border-border-primary text-text-secondary hover:border-text-primary hover:text-text-primary hover:bg-bg-primary'
                        }`}
                      >
                        {ingredient}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-primary">
              <button 
                onClick={() => setSelectedIngredients([])}
                className={`py-3 px-6 rounded-xl font-medium transition-colors ${
                  selectedIngredients.length > 0 
                  ? 'text-error hover:bg-error/10' 
                  : 'text-text-secondary opacity-50 cursor-not-allowed'
                }`}
                disabled={selectedIngredients.length === 0}
              >
                Clear Selection
              </button>

              <button 
                onClick={() => setHasSearched(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all duration-200 bg-accent text-white hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(37,116,120,0.4)]"
              >
                Find Recipes
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Recipe Results */
        <div>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button 
                  onClick={() => navigate('/')}
                  className="group flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-primary rounded-full font-medium text-xs md:text-sm text-text-secondary transition-all duration-300 hover:text-white hover:border-accent hover:shadow-[0_0_15px_rgba(37,116,120,0.2)] hover:-translate-x-0.5"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Dashboard
                </button>
                <span className="text-border-primary text-sm">/</span>
                <button 
                  onClick={() => setHasSearched(false)}
                  className="group flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full font-medium text-xs md:text-sm text-accent transition-all duration-300 hover:bg-accent hover:border-accent hover:shadow-[0_0_15px_rgba(37,116,120,0.4)] hover:text-white"
                >
                  <ChefHat size={14} className="group-hover:rotate-12 transition-transform" />
                  Edit Ingredients
                </button>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Your Recipe Matches
              </h1>
              <p className="text-text-secondary text-lg">
                Based on: <span className="text-white font-medium">{selectedIngredients.length > 0 ? selectedIngredients.join(', ') : 'All recipes'}</span>
              </p>
            </div>

            <div className="w-full md:w-72">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Filter results..."
                  value={recipeSearchQuery}
                  onChange={(e) => setRecipeSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary transition-all duration-200 focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="text-center py-20 bg-bg-secondary border border-border-primary rounded-3xl">
              <ChefHat size={64} className="mx-auto text-text-secondary mb-6 opacity-30" />
              <h3 className="text-2xl font-semibold mb-3 text-text-primary">No recipes found</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-8">
                We couldn't find any recipes that use all of those ingredients together. Try removing a few ingredients to get more matches.
              </p>
              <button 
                onClick={() => setHasSearched(false)}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-border-primary hover:bg-white/5 hover:text-white"
              >
                Change Ingredients
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe, index) => (
                <div key={recipe.id || index} className="flex flex-col bg-bg-secondary border border-border-primary rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] hover:border-white/10 group">
                  <div className="relative h-48 overflow-hidden bg-[#222]">
                    <img 
                      src={recipe.image_url || 'https://via.placeholder.com/400x300?text=Recipe'} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Recipe' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-80"></div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{recipe.title}</h3>
                    <p className="text-sm text-text-secondary mb-5 line-clamp-3 my-auto">
                      <span className="font-semibold text-[#f8fafc] mb-1 block">Key Ingredients:</span>
                      {recipe.ingredients && recipe.ingredients.slice(0, 4).map(i => typeof i === 'string' ? i : '').join(', ')}...
                    </p>
                    <button className="w-full mt-auto py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-white/5 border border-white/10 text-white group-hover:bg-accent group-hover:border-accent">
                      View Recipe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CookNow;
