import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeContext } from '../context/RecipeContext';
import { 
  Loader2, ChefHat, Search, ArrowRight, ArrowLeft, Clock, X, Carrot, Wheat, ShoppingBag, 
  Heart, Bookmark 
} from 'lucide-react';

const cleanIngredientName = (ing) => {
  let text = ing.split(',')[0].toLowerCase();
  text = text.replace(/[\d\/\½\⅓\¼\¾\⅛\⅜\⅝\⅞\-.]+/g, ' ');
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
  const { 
    recipes, loading, error,
    hasSearched, setHasSearched,
    selectedIngredients, setSelectedIngredients,
    selectedVegetables, setSelectedVegetables,
    selectedFlour, setSelectedFlour,
    dietFilter, setDietFilter,
    savedRecipes, toggleSaved,
    favoriteRecipes, toggleFavorite,
    addRecent
  } = useRecipeContext();

  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [vegetableSearchQuery, setVegetableSearchQuery] = useState('');
  const [flourSearchQuery, setFlourSearchQuery] = useState('');
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('vegetables');

  const totalSelectedCount = selectedIngredients.length + selectedVegetables.length + selectedFlour.length;

  // Only scroll to top when hasSearched changes FROM false TO true (user clicks search)
  // We avoid scrolling to top when returning from a detail page (hasSearched stays true)
  const prevHasSearched = React.useRef(hasSearched);
  useEffect(() => {
    if (!prevHasSearched.current && hasSearched) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    prevHasSearched.current = hasSearched;
  }, [hasSearched]);

  const getItemsSet = (recipes, filter, selected, path) => {
    if (!recipes) return [];
    const relevantRecipes = filter === 'All' ? recipes : recipes.filter(r => r?.category === filter);
    const itemsSet = new Set();
    relevantRecipes.forEach(recipe => {
      const paths = ['ingredients', 'vegetables', 'flour'];
      paths.forEach(p => {
        const arr = recipe[p];
        if (arr && Array.isArray(arr)) {
          arr.forEach(ing => {
            if (typeof ing === 'string') {
              let cleanIng = cleanIngredientName(ing);
              // Only collect ingredients that have meaningful content
              if (cleanIng && cleanIng.length > 1) itemsSet.add(cleanIng);
            }
          });
        }
      });
    });
    // CRITICAL: Always include currently selected items so they don't disappear from the UI
    selected.forEach(ing => itemsSet.add(ing));
    // Filter the itemsSet for the specific path requested if still needed, 
    // but the current UI calls this for each path separately.
    // To fix the 'missing items' issue, we should ensure the selected tab only shows items found in that path.
    const pathItems = new Set();
    relevantRecipes.forEach(recipe => {
      const arr = recipe[path];
      if (arr && Array.isArray(arr)) {
        arr.forEach(ing => {
          if (typeof ing === 'string') {
            let cleanIng = cleanIngredientName(ing);
            if (cleanIng && cleanIng.length > 1) pathItems.add(cleanIng);
          }
        });
      }
    });
    selected.forEach(ing => pathItems.add(ing));
    return Array.from(pathItems).sort();
  };

  const allIngredients = useMemo(() => getItemsSet(recipes, dietFilter, selectedIngredients, 'ingredients'), [recipes, dietFilter, selectedIngredients]);
  const allVegetables = useMemo(() => getItemsSet(recipes, dietFilter, selectedVegetables, 'vegetables'), [recipes, dietFilter, selectedVegetables]);
  const allFlour = useMemo(() => getItemsSet(recipes, dietFilter, selectedFlour, 'flour'), [recipes, dietFilter, selectedFlour]);

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    else setSelectedIngredients([...selectedIngredients, ingredient]);
  };

  const toggleVegetable = (vegetable) => {
    if (selectedVegetables.includes(vegetable)) setSelectedVegetables(selectedVegetables.filter(i => i !== vegetable));
    else setSelectedVegetables([...selectedVegetables, vegetable]);
  };

  const toggleFlour = (flourItem) => {
    if (selectedFlour.includes(flourItem)) setSelectedFlour(selectedFlour.filter(i => i !== flourItem));
    else setSelectedFlour([...selectedFlour, flourItem]);
  };

  const filteredIngredientList = useMemo(() => {
    const query = ingredientSearchQuery.toLowerCase();
    return query ? allIngredients.filter(ing => ing.toLowerCase().includes(query)) : allIngredients;
  }, [allIngredients, ingredientSearchQuery]);

  const filteredVegetableList = useMemo(() => {
    const query = vegetableSearchQuery.toLowerCase();
    return query ? allVegetables.filter(v => v.toLowerCase().includes(query)) : allVegetables;
  }, [allVegetables, vegetableSearchQuery]);

  const filteredFlourList = useMemo(() => {
    const query = flourSearchQuery.toLowerCase();
    return query ? allFlour.filter(f => f.toLowerCase().includes(query)) : allFlour;
  }, [allFlour, flourSearchQuery]);

  const baseMatchedRecipes = useMemo(() => {
    if (!recipes) return [];

    // Deduplicate recipes by ID or Title to prevent ghost duplicates
    const seen = new Set();
    const uniqueRecipes = recipes.filter(recipe => {
      const identifier = (recipe.id || recipe._id || recipe.title)?.toString().toLowerCase();
      if (!identifier || seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });

    return uniqueRecipes.map(recipe => {
      let matchedCount = 0;
      let missingIngredients = [];
      const allSelected = [...selectedIngredients, ...selectedVegetables, ...selectedFlour];
      
      const recipeIngredients = (recipe.ingredients || []).map(i => typeof i === 'string' ? cleanIngredientName(i) : '').filter(i => i && i.length > 1);
      const recipeVegetables = (recipe.vegetables || []).map(i => typeof i === 'string' ? cleanIngredientName(i) : '').filter(i => i && i.length > 1);
      const recipeFlour = (recipe.flour || []).map(i => typeof i === 'string' ? cleanIngredientName(i) : '').filter(i => i && i.length > 1);
      
      const allRecipeItems = [...recipeIngredients, ...recipeVegetables, ...recipeFlour];
      const totalCount = allRecipeItems.length;

      if (totalSelectedCount > 0) {
        allRecipeItems.forEach((cleanItem) => {
          if (allSelected.includes(cleanItem)) {
            matchedCount++;
          } else if (!missingIngredients.includes(cleanItem)) {
            missingIngredients.push(cleanItem);
          }
        });
      }

      const matchPercentage = totalCount === 0 ? 0 : (matchedCount / totalCount) * 100;
      const totalTimeMinutes = parseTime(recipe.prep_time) + parseTime(recipe.cook_time);

      return { ...recipe, matchedCount, missingIngredients, matchPercentage, totalTimeMinutes };
    }).filter(recipe => {
      const query = recipeSearchQuery.toLowerCase();
      const matchesSearch = !query || (
        (recipe.title && recipe.title.toLowerCase().includes(query)) ||
        (recipe.ingredients && recipe.ingredients.some(i => typeof i === 'string' && i.toLowerCase().includes(query))) ||
        (recipe.vegetables && recipe.vegetables.some(v => typeof v === 'string' && v.toLowerCase().includes(query))) ||
        (recipe.flour && recipe.flour.some(f => typeof f === 'string' && f.toLowerCase().includes(query)))
      );
      const matchesPercentage = totalSelectedCount === 0 || recipe.matchPercentage >= 40;
      return matchesPercentage && matchesSearch;
    });
  }, [recipes, selectedIngredients, selectedVegetables, selectedFlour, recipeSearchQuery, totalSelectedCount]);

  const dietCounts = useMemo(() => {
    return {
      All: baseMatchedRecipes.length,
      Veg: baseMatchedRecipes.filter(r => r.category?.toLowerCase() === 'veg').length,
      'Non-Veg': baseMatchedRecipes.filter(r => r.category?.toLowerCase() === 'non-veg').length
    };
  }, [baseMatchedRecipes]);

  const filteredRecipes = useMemo(() => {
    return baseMatchedRecipes.filter(recipe => {
      return dietFilter === 'All' || (recipe.category && recipe.category.toLowerCase() === dietFilter.toLowerCase());
    }).sort((a, b) => {
      if (totalSelectedCount > 0 && b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      const aTime = a.totalTimeMinutes;
      const bTime = b.totalTimeMinutes;
      return aTime !== bTime ? aTime - bTime : 0;
    });
  }, [baseMatchedRecipes, dietFilter, totalSelectedCount]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex flex-col items-center justify-center">
        <div className="w-28 h-28 md:w-36 md:h-36 mb-6 relative">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain mix-blend-screen">
            <source src="https://res.cloudinary.com/dw4j19xmz/video/upload/v1773475402/Remove_background_project_4_aia7d1.mp4" type="video/mp4" />
          </video>
        </div>
        <h2 className="text-xl md:text-2xl text-text-secondary font-medium animate-pulse mt-2">Stocking the pantry...</h2>
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

  // STEP 1: Ingredient Selection UI
  if (!hasSearched) {
    return (
      <div key="selection-step" className="min-h-screen pt-32 md:pt-40 pb-12 px-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
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
            {/* Matches Found Banner */}
            {totalSelectedCount > 0 && (
              <div className="mb-6 flex items-center justify-between p-4 bg-accent/10 border border-accent/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-accent/20 rounded-xl text-accent">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm md:text-base">
                      {filteredRecipes.length > 0 ? `${filteredRecipes.length} Recipe Matches Found` : 'No Recipes Found'}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {filteredRecipes.length > 0 ? 'Click View Matches to see them!' : 'Try adding more items'}
                    </p>
                  </div>
                </div>
                {filteredRecipes.length > 0 && (
                  <button
                    onClick={() => setHasSearched(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-md hover:-translate-y-0.5"
                  >
                    View Matches
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Tabbed Ingredient Selector */}
            <div className="mb-8">
              <div className="flex p-1.5 bg-bg-primary/50 backdrop-blur-md rounded-2xl border border-border-primary overflow-x-auto custom-scrollbar mb-6 gap-2">
                {[
                  { id: 'vegetables', label: 'Vegetables', icon: Carrot, count: selectedVegetables.length, activeStyle: 'bg-[#10b981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]', defaultStyle: 'text-text-secondary hover:bg-white/5 hover:text-white' },
                  { id: 'flour', label: 'Flour & Grains', icon: Wheat, count: selectedFlour.length, activeStyle: 'bg-[#f59e0b] text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]', defaultStyle: 'text-text-secondary hover:bg-white/5 hover:text-white' },
                  { id: 'ingredients', label: 'Other Extras', icon: ShoppingBag, count: selectedIngredients.length, activeStyle: 'bg-accent text-white shadow-[0_4px_12px_rgba(37,116,120,0.3)]', defaultStyle: 'text-text-secondary hover:bg-white/5 hover:text-white' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 min-w-[150px] rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id ? tab.activeStyle : tab.defaultStyle}`}
                    >
                      <Icon size={18} />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-white/20' : 'bg-bg-secondary border border-border-primary'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Content Area */}
              <div className="bg-bg-primary/20 p-5 md:p-6 rounded-3xl border border-border-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none -mr-10 -mt-10 transition-colors duration-500 delay-75"
                   style={{ backgroundColor: activeTab === 'vegetables' ? '#10b981' : activeTab === 'flour' ? '#f59e0b' : '#257478' }}>
                </div>
                
                <div className="relative mb-5 z-10">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search size={18} className="text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'vegetables' ? 'vegetables' : activeTab === 'flour' ? 'flours & grains' : 'other ingredients'}...`}
                    value={activeTab === 'vegetables' ? vegetableSearchQuery : activeTab === 'flour' ? flourSearchQuery : ingredientSearchQuery}
                    onChange={(e) => {
                      if (activeTab === 'vegetables') setVegetableSearchQuery(e.target.value);
                      else if (activeTab === 'flour') setFlourSearchQuery(e.target.value);
                      else setIngredientSearchQuery(e.target.value);
                    }}
                    className="w-full pl-12 pr-12 py-3.5 bg-bg-secondary/80 backdrop-blur border border-border-primary rounded-2xl text-text-primary text-base transition-all duration-200 focus:outline-none focus:border-white/30 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                  />
                  {(activeTab === 'vegetables' ? vegetableSearchQuery : activeTab === 'flour' ? flourSearchQuery : ingredientSearchQuery) && (
                    <button
                      onClick={() => {
                        if (activeTab === 'vegetables') setVegetableSearchQuery('');
                        else if (activeTab === 'flour') setFlourSearchQuery('');
                        else setIngredientSearchQuery('');
                      }}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto px-1 py-1 custom-scrollbar relative z-10">
                  {/* VEGETABLES LIST */}
                  {activeTab === 'vegetables' && (
                    filteredVegetableList.length === 0 ? (
                      <div className="w-full text-center py-10 text-text-secondary italic flex flex-col items-center opacity-60">
                        <Carrot size={40} className="mb-3 opacity-40" />
                        No vegetables found.
                      </div>
                    ) : (
                      filteredVegetableList.map((item, idx) => (
                        <button
                          key={`veg-${idx}`}
                          onClick={() => toggleVegetable(item)}
                          className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${selectedVegetables.includes(item)
                              ? 'bg-[#10b981] border-[#10b981] text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] md:-translate-y-0.5'
                              : 'bg-bg-secondary border-border-primary text-text-secondary hover:border-white/40 hover:text-white hover:bg-bg-primary'
                            }`}
                        >
                          {item}
                        </button>
                      ))
                    )
                  )}

                  {/* FLOUR LIST */}
                  {activeTab === 'flour' && (
                    filteredFlourList.length === 0 ? (
                      <div className="w-full text-center py-10 text-text-secondary italic flex flex-col items-center opacity-60">
                        <Wheat size={40} className="mb-3 opacity-40" />
                        No flours found.
                      </div>
                    ) : (
                      filteredFlourList.map((item, idx) => (
                        <button
                          key={`flour-${idx}`}
                          onClick={() => toggleFlour(item)}
                          className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${selectedFlour.includes(item)
                              ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-[0_4px_15px_rgba(245,158,11,0.4)] md:-translate-y-0.5'
                              : 'bg-bg-secondary border-border-primary text-text-secondary hover:border-white/40 hover:text-white hover:bg-bg-primary'
                            }`}
                        >
                          {item}
                        </button>
                      ))
                    )
                  )}

                  {/* INGREDIENTS LIST */}
                  {activeTab === 'ingredients' && (
                    filteredIngredientList.length === 0 ? (
                      <div className="w-full text-center py-10 text-text-secondary italic flex flex-col items-center opacity-60">
                        <ShoppingBag size={40} className="mb-3 opacity-40" />
                        No other ingredients found.
                      </div>
                    ) : (
                      filteredIngredientList.map((item, idx) => (
                        <button
                          key={`ing-${idx}`}
                          onClick={() => toggleIngredient(item)}
                          className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${selectedIngredients.includes(item)
                              ? 'bg-accent border-accent text-white shadow-[0_4px_15px_rgba(37,116,120,0.4)] md:-translate-y-0.5'
                              : 'bg-bg-secondary border-border-primary text-text-secondary hover:border-white/40 hover:text-white hover:bg-bg-primary'
                            }`}
                        >
                          {item}
                        </button>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-primary">
              <button
                onClick={() => { setSelectedIngredients([]); setSelectedVegetables([]); setSelectedFlour([]); }}
                className={`py-3 px-6 rounded-xl font-medium transition-colors ${totalSelectedCount > 0 ? 'text-error hover:bg-error/10' : 'text-text-secondary opacity-50 cursor-not-allowed'}`}
                disabled={totalSelectedCount === 0}
              >
                Clear Selection
              </button>
              <button
                onClick={() => setHasSearched(true)}
                disabled={totalSelectedCount === 0 || filteredRecipes.length === 0}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all duration-200 ${
                  totalSelectedCount > 0 && filteredRecipes.length > 0
                    ? 'bg-accent text-white hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(37,116,120,0.4)]'
                    : 'bg-white/5 border border-white/10 text-text-secondary cursor-not-allowed'
                }`}
              >
                {totalSelectedCount === 0 ? 'Select Items' : filteredRecipes.length === 0 ? 'No Matches' : `Find Recipes (${filteredRecipes.length})`}
                <ArrowRight size={20} className={totalSelectedCount > 0 && filteredRecipes.length > 0 ? "opacity-100" : "opacity-50"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Recipe Results UI
  return (
    <div key="results-step" className="min-h-screen pt-32 md:pt-44 pb-12 px-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Recipe Matches</h1>
          <p className="text-text-secondary text-lg max-w-2xl" title={[...selectedIngredients, ...selectedVegetables, ...selectedFlour].join(', ')}>
            Based on: <span className="text-white font-medium">
              {totalSelectedCount > 0 
                ? (totalSelectedCount > 6 ? `${[...selectedIngredients, ...selectedVegetables, ...selectedFlour].slice(0, 6).join(', ')}...` : [...selectedIngredients, ...selectedVegetables, ...selectedFlour].join(', ')) 
                : 'All items'}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[300px]">
          <div className="flex bg-[#171717] p-1 rounded-xl border border-white/5 shadow-md">
            {['All', 'Veg', 'Non-Veg'].map(type => (
              <button
                key={type}
                onClick={() => setDietFilter(type)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 text-center flex items-center justify-center gap-2 ${dietFilter === type
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search by title, vegetable, or flour..."
              value={recipeSearchQuery}
              onChange={(e) => setRecipeSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary transition-all duration-200 focus:outline-none focus:border-accent"
            />
            {recipeSearchQuery && (
              <button
                onClick={() => setRecipeSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
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
                  src={recipe.image_url || 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png'}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { 
                    e.target.src = 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png';
                    e.target.classList.add('p-8', 'object-contain', 'bg-[#1a1a1a]'); 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-80"></div>
                
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

                {/* Missing Ingredients Badge (Top Left) */}
                {totalSelectedCount > 0 && recipe.missingIngredients?.length > 0 && (
                  <div className="absolute top-4 left-4 z-10 animate-in fade-in zoom-in duration-300">
                    <div className="px-3 py-1.5 rounded-lg backdrop-blur-md bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      +{recipe.missingIngredients.length} Needs
                    </div>
                  </div>
                )}

                {/* Save/Favorite Buttons (Bottom) */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe._id || recipe.id); }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
                        favoriteRecipes.includes(recipe._id || recipe.id) 
                          ? 'bg-red-500 border-red-500 text-white shadow-lg' 
                          : 'bg-black/40 border-white/20 text-white hover:bg-red-500/40 hover:border-red-500'
                      }`}
                    >
                      <Heart size={16} fill={favoriteRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSaved(recipe._id || recipe.id); }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
                        savedRecipes.includes(recipe._id || recipe.id) 
                          ? 'bg-accent border-accent text-white shadow-lg' 
                          : 'bg-black/40 border-white/20 text-white hover:bg-accent/40 hover:border-accent'
                      }`}
                    >
                      <Bookmark size={16} fill={savedRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{recipe.title}</h3>
                {totalSelectedCount > 0 && recipe.matchPercentage > 0 && (
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
                <p className="text-sm text-text-secondary mb-4 my-auto">
                  <span className="font-semibold text-[#f8fafc] mb-1 block">Includes:</span>
                  {[...(recipe.ingredients || []), ...(recipe.vegetables || []), ...(recipe.flour || [])]
                    .map(i => typeof i === 'string' ? i : '')
                    .filter(i => i !== '')
                    .join(', ')}
                </p>
                {totalSelectedCount > 0 && recipe.missingIngredients?.length > 0 && (
                  <div className="mb-4 mt-auto">
                    <span className="font-semibold text-[#ef4444] text-[10px] uppercase tracking-wider mb-1 block opacity-80">Missing:</span>
                    <p className="text-xs text-text-secondary line-clamp-2">{recipe.missingIngredients.join(', ')}</p>
                  </div>
                )}
                <button 
                  onClick={() => {
                    addRecent(recipe);
                    navigate(`/recipe/${recipe._id || recipe.id}`);
                  }}
                  className="w-full mt-auto py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-white/5 border border-white/10 text-white group-hover:bg-accent group-hover:border-accent"
                >
                  View Recipe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CookNow;
