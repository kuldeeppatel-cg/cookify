import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeContext } from '../context/RecipeContext';
import { Loader2, ChefHat, Search, ArrowRight, ArrowLeft, Clock } from 'lucide-react';

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
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const str = timeStr.toLowerCase();
  let mins = 0;
  const hoursMatch = str.match(/(\d+)\s*(?:hr|hour|h)/);
  if (hoursMatch) mins += parseInt(hoursMatch[1]) * 60;
  const minsMatch = str.match(/(\d+)\s*(?:min|m)/);
  if (minsMatch) mins += parseInt(minsMatch[1]);
  return mins;
};

const CookNow = () => {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipeContext();

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('All');

  // Extract all unique ingredients from recipes to display as tags
  const allIngredients = useMemo(() => {
    if (!recipes) return [];

    const relevantRecipes = dietFilter === 'All' ? recipes : recipes.filter(r => r?.category === dietFilter);

    const ingredientsSet = new Set();
    relevantRecipes.forEach(recipe => {
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
  }, [recipes, dietFilter]);

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
    return recipes.map(recipe => {
      let matchedCount = 0;
      let missingIngredients = [];
      let totalCount = recipe.ingredients ? recipe.ingredients.length : 0;

      if (recipe.ingredients) {
        const cleanIngs = recipe.ingredients.map(ing => typeof ing === 'string' ? cleanIngredientName(ing) : '');

        if (selectedIngredients.length > 0) {
          cleanIngs.forEach((cleanIng, idx) => {
            if (cleanIng && selectedIngredients.includes(cleanIng)) {
              matchedCount++;
            } else if (cleanIng) {
              missingIngredients.push(cleanIng);
            }
          });
        }
      }

      let matchPercentage = totalCount === 0 ? 0 : (matchedCount / totalCount) * 100;

      let prepMins = parseTime(recipe.prep_time);
      let cookMins = parseTime(recipe.cook_time);
      let totalTimeMinutes = prepMins + cookMins;

      return {
        ...recipe,
        matchedCount,
        missingIngredients,
        matchPercentage,
        totalTimeMinutes
      };
    }).filter(recipe => {
      // Filter by search query second
      const matchesSearch = !recipeSearchQuery || (recipe.title && recipe.title.toLowerCase().includes(recipeSearchQuery.toLowerCase()));

      // Filter by Diet third
      const matchesDiet = dietFilter === 'All' || recipe.category === dietFilter;

      // Ensure 40% threshold is met if user has selected ingredients
      const matchesPercentage = selectedIngredients.length === 0 || recipe.matchPercentage >= 40;

      return matchesPercentage && matchesSearch && matchesDiet;
    }).sort((a, b) => {
      // 1. Sort by match percentage DESC (highest match first)
      if (selectedIngredients.length > 0 && b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }

      // 2. Sort by cooking time ASC (fastest to cook first)
      const aCook = parseTime(a.cook_time);
      const bCook = parseTime(b.cook_time);
      if (aCook !== bCook) {
        return aCook - bCook;
      }

      // 3. Sort by preparation time ASC (fastest to prep first)
      const aPrep = parseTime(a.prep_time);
      const bPrep = parseTime(b.prep_time);
      return aPrep - bPrep;
    });
  }, [recipes, selectedIngredients, recipeSearchQuery, dietFilter]);

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

          <div className="flex justify-center mb-10 w-full">
            <div className="flex bg-[#171717]/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
              {['All', 'Veg', 'Non-Veg'].map(type => (
                <button
                  key={type}
                  onClick={() => { setDietFilter(type); setSelectedIngredients([]); }}
                  className={`px-5 py-2 md:px-8 md:py-2.5 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${dietFilter === type
                      ? type === 'Veg'
                        ? 'bg-[#10b981]/20 text-[#10b981] shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                        : type === 'Non-Veg'
                          ? 'bg-[#ef4444]/20 text-[#ef4444] shadow-[0_4px_12px_rgba(239,68,68,0.2)]'
                          : 'bg-white/10 text-white shadow-[0_4px_12px_rgba(255,255,255,0.1)]'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                >
                  {type === 'Veg' && <div className={`w-2 h-2 rounded-full ${dietFilter === 'Veg' ? 'bg-[#10b981]' : 'bg-transparent border border-text-secondary'}`} />}
                  {type === 'Non-Veg' && <div className={`w-2 h-2 rounded-full ${dietFilter === 'Non-Veg' ? 'bg-[#ef4444]' : 'bg-transparent border border-text-secondary'}`} />}
                  {type === 'All' && <div className={`w-2 h-2 rounded-full ${dietFilter === 'All' ? 'bg-white' : 'bg-transparent border border-text-secondary'}`} />}
                  {type}
                </button>
              ))}
            </div>
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
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${isSelected
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
                className={`py-3 px-6 rounded-xl font-medium transition-colors ${selectedIngredients.length > 0
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
              <p className="text-text-secondary text-lg max-w-2xl" title={selectedIngredients.join(', ')}>
                Based on: <span className="text-white font-medium">
                  {selectedIngredients.length > 0 
                    ? (selectedIngredients.length > 6 
                        ? `${selectedIngredients.slice(0, 6).join(', ')}...` 
                        : selectedIngredients.join(', ')) 
                    : 'All recipes'}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[300px]">
              <div className="flex bg-[#171717] p-1 rounded-xl border border-white/5 shadow-md">
                {['All', 'Veg', 'Non-Veg'].map(type => (
                  <button
                    key={type}
                    onClick={() => { setDietFilter(type); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 text-center ${dietFilter === type
                        ? type === 'Veg'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : type === 'Non-Veg'
                            ? 'bg-[#ef4444]/20 text-[#ef4444]'
                            : 'bg-white/10 text-white'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
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
              <h3 className="text-2xl font-semibold mb-3 text-text-primary">No exact matches</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-8">
                We couldn't find any recipes that match at least 40% of your ingredients. Try adding more items or clearing your selection!
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

                    {selectedIngredients.length > 0 && recipe.matchPercentage > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-accent font-semibold">{Math.round(recipe.matchPercentage)}% Match</span>
                          <span className="text-text-secondary flex items-center gap-1"><Clock size={12} />{recipe.totalTimeMinutes} mins</span>
                        </div>
                        <div className="w-full bg-border-primary rounded-full h-1.5 overflow-hidden">
                          <div className="bg-accent h-full transition-all duration-500" style={{ width: `${recipe.matchPercentage}%` }}></div>
                        </div>
                      </div>
                    )}

                    {selectedIngredients.length === 0 && (
                      <p className="text-xs text-text-secondary mb-3 flex items-center gap-1.5">
                        <Clock size={14} className="text-accent" />
                        {recipe.totalTimeMinutes} mins total prep & cook
                      </p>
                    )}

                    <p className="text-sm text-text-secondary mb-4 my-auto">
                      <span className="font-semibold text-[#f8fafc] mb-1 block">Key Ingredients:</span>
                      {recipe.ingredients && recipe.ingredients.map(i => typeof i === 'string' ? i : '').join(', ')}
                    </p>

                    {selectedIngredients.length > 0 && recipe.missingIngredients?.length > 0 && (
                      <div className="mb-4 mt-auto">
                        <span className="font-semibold text-[#ef4444] text-xs mb-1 block">Missing Ingredients ({recipe.missingIngredients.length}):</span>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {recipe.missingIngredients.join(', ')}
                        </p>
                      </div>
                    )}

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
