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
      const allRecipeItems = [
        ...(recipe.ingredients || []), 
        ...(recipe.vegetables || []), 
        ...(recipe.flour || [])
      ].map(i => typeof i === 'string' ? cleanIngredientName(i) : '').filter(i => i && i.length > 1);
      
      const totalCount = allRecipeItems.length;
      if (totalSelectedCount > 0) {
        allRecipeItems.forEach((cleanItem) => {
          if (allSelected.includes(cleanItem)) matchedCount++;
          else if (!missingIngredients.includes(cleanItem)) missingIngredients.push(cleanItem);
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
      if (totalSelectedCount > 0 && b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
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

  // STEP 1: Selection UI
  if (!hasSearched) {
    return (
      <div className="min-h-screen pt-28 md:pt-40 pb-32 px-4 md:px-6 max-w-[1200px] mx-auto animate-in fade-in duration-500 overflow-x-hidden">
        {/* Mobile Sticky CTA */}
        {totalSelectedCount > 0 && filteredRecipes.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent md:hidden animate-in slide-in-from-bottom-full duration-500">
            <button
              onClick={() => setHasSearched(true)}
              className="w-full flex items-center justify-center gap-3 py-5 bg-accent text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(37,116,120,0.4)] active:scale-95 transition-all"
            >
              View {filteredRecipes.length} Matches
              <ArrowRight size={22} className="animate-bounce-subtle" />
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 px-5 py-2.5 mb-8 bg-bg-secondary border border-border-primary rounded-full font-bold text-sm text-text-secondary hover:text-white transition-all"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </button>

          <header className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
              What's in your <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">kitchen?</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl leading-relaxed">
              Select what you have, and we'll reveal the magic you can cook right now.
            </p>
          </header>

          <div className="bg-bg-secondary border border-border-primary rounded-[2.5rem] p-4 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] pointer-events-none rounded-full" />
            
            {/* Custom Tab Bar */}
            <div className="flex bg-bg-primary/40 p-1.5 rounded-3xl border border-border-primary overflow-x-auto no-scrollbar mb-8 gap-2 relative z-10">
              {[
                { id: 'vegetables', label: 'Vegetables', icon: Carrot, count: selectedVegetables.length, color: 'text-emerald-400', activeBg: 'bg-emerald-500/20 border-emerald-500/30' },
                { id: 'flour', label: 'Flour & Grains', icon: Wheat, count: selectedFlour.length, color: 'text-amber-400', activeBg: 'bg-amber-500/20 border-amber-500/30' },
                { id: 'ingredients', label: 'Other Items', icon: ShoppingBag, count: selectedIngredients.length, color: 'text-accent', activeBg: 'bg-accent/20 border-accent/40' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-4 md:py-3.5 min-w-[120px] rounded-[1.25rem] font-black transition-all duration-500 border-2 ${
                      isActive ? `${tab.activeBg} ${tab.color} scale-[1.02]` : 'bg-transparent border-transparent text-text-secondary hover:bg-white/5'
                    }`}
                  >
                    <Icon size={isActive ? 24 : 20} className={isActive ? "animate-bounce-subtle" : ""} />
                    <span className="text-sm md:text-base whitespace-nowrap">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black border-2 ${isActive ? 'bg-white/20 border-white/50' : 'bg-bg-secondary border-border-primary'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selection Area */}
            <div className="relative z-10 space-y-6">
              <div className="relative group">
                <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={activeTab === 'vegetables' ? vegetableSearchQuery : activeTab === 'flour' ? flourSearchQuery : ingredientSearchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeTab === 'vegetables') setVegetableSearchQuery(val);
                    else if (activeTab === 'flour') setFlourSearchQuery(val);
                    else setIngredientSearchQuery(val);
                  }}
                  className="w-full pl-14 pr-12 py-5 bg-bg-primary/60 backdrop-blur-xl border-2 border-border-primary rounded-3xl text-lg font-medium transition-all focus:outline-none focus:border-accent focus:bg-bg-primary/90 shadow-lg"
                />
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto px-1 py-2 custom-scrollbar pr-2">
                {(activeTab === 'vegetables' ? filteredVegetableList : activeTab === 'flour' ? filteredFlourList : filteredIngredientList)
                  .map((item, idx) => {
                    const isSelected = activeTab === 'vegetables' ? selectedVegetables.includes(item) : activeTab === 'flour' ? selectedFlour.includes(item) : selectedIngredients.includes(item);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (activeTab === 'vegetables') toggleVegetable(item);
                          else if (activeTab === 'flour') toggleFlour(item);
                          else toggleIngredient(item);
                        }}
                        className={`relative p-5 rounded-3xl text-sm md:text-base font-black border-2 transition-all duration-300 transform active:scale-95 ${
                          isSelected 
                            ? (activeTab === 'vegetables' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]' : activeTab === 'flour' ? 'bg-amber-500 border-amber-400 text-white shadow-[0_8px_20px_rgba(245,158,11,0.3)]' : 'bg-accent border-accent text-white shadow-[0_8px_20px_rgba(37,116,120,0.3)]')
                            : 'bg-bg-primary/40 border-border-primary text-text-secondary hover:border-white/20 hover:text-white hover:bg-bg-primary/80'
                        }`}
                      >
                        {isSelected && <X size={14} className="absolute top-3 right-3 opacity-60" />}
                        <span className="line-clamp-1">{item}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t-2 border-border-primary flex flex-col md:flex-row items-center justify-between gap-6">
              <button
                onClick={() => { setSelectedIngredients([]); setSelectedVegetables([]); setSelectedFlour([]); }}
                className={`flex items-center gap-2 py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${totalSelectedCount > 0 ? 'text-red-500 hover:bg-red-500/10' : 'text-text-secondary opacity-30 cursor-not-allowed'}`}
                disabled={totalSelectedCount === 0}
              >
                Clear Panatry
              </button>
              
              <button
                onClick={() => setHasSearched(true)}
                disabled={totalSelectedCount === 0 || filteredRecipes.length === 0}
                className={`hidden md:flex items-center justify-center gap-3 px-10 py-5 rounded-[1.5rem] font-black text-xl transition-all shadow-xl ${
                  totalSelectedCount > 0 && filteredRecipes.length > 0
                    ? 'bg-accent text-white hover:bg-accent-hover hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(37,116,120,0.4)]'
                    : 'bg-white/5 border-2 border-white/5 text-text-secondary cursor-not-allowed'
                }`}
              >
                {totalSelectedCount === 0 ? 'Pick Ingredients' : `Show ${filteredRecipes.length} Recipes`}
                <ArrowRight size={24} className={totalSelectedCount > 0 ? "animate-bounce-subtle ml-2" : "opacity-30"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Matching UI
  return (
    <div key="results-step" className="min-h-screen pt-32 md:pt-44 pb-12 px-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-primary rounded-full font-bold text-xs md:text-sm text-text-secondary hover:text-white transition-all"
            >
              <ArrowLeft size={14} />
              Dashboard
            </button>
            <span className="text-border-primary">/</span>
            <button
              onClick={() => setHasSearched(false)}
              className="group flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/40 rounded-full font-bold text-xs md:text-sm text-accent hover:bg-accent hover:text-white transition-all"
            >
              <ChefHat size={14} />
              Edit kitchen
            </button>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Matches!</h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            Finding joy with <span className="text-white font-bold">{totalSelectedCount} ingredients</span>.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[320px]">
          <div className="flex bg-bg-secondary p-1.5 rounded-2xl border border-border-primary shadow-xl">
            {['All', 'Veg', 'Non-Veg'].map(type => (
              <button
                key={type}
                onClick={() => setDietFilter(type)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all text-center flex items-center justify-center gap-2 ${dietFilter === type
                    ? (type === 'Veg' ? 'bg-emerald-500/20 text-emerald-400' : type === 'Non-Veg' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white')
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
              >
                {type}
                <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${dietFilter === type ? 'bg-white/10 border-white/10' : 'border-transparent'}`}>
                  {dietCounts[type]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20 bg-bg-secondary border border-border-primary rounded-[2.5rem] shadow-2xl">
          <ChefHat size={80} className="mx-auto text-text-secondary mb-8 opacity-20 animate-pulse" />
          <h3 className="text-3xl font-black mb-4">No perfect match yet</h3>
          <p className="text-text-secondary text-lg max-w-md mx-auto mb-10">
            Keep searching! Try adding more essentials or checking our "Others" section.
          </p>
          <button
            onClick={() => setHasSearched(false)}
            className="px-8 py-4 bg-accent text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg"
          >
            Adjust Pantry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, index) => (
            <div key={recipe.id || index} className="flex flex-col bg-bg-secondary border-2 border-border-primary rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:border-white/10 group">
              <div className="relative h-60 overflow-hidden bg-[#222]">
                <img
                  src={recipe.image_url || 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png'}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { 
                    e.target.src = 'https://res.cloudinary.com/dw4j19xmz/image/upload/v1773396970/Remove_background_project_3_new_nyocqk.png';
                    e.target.classList.add('p-12', 'object-contain', 'bg-[#1a1a1a]'); 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute top-6 right-6 z-10">
                  <div className={`p-2 rounded-xl backdrop-blur-md border ${
                    recipe.category?.toLowerCase() === 'veg' 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
                      recipe.category?.toLowerCase() === 'veg' ? 'border-emerald-500' : 'border-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        recipe.category?.toLowerCase() === 'veg' ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                </div>

                {totalSelectedCount > 0 && recipe.missingIngredients?.length > 0 && (
                  <div className="absolute top-6 left-6 z-10">
                    <div className="px-4 py-2 rounded-xl backdrop-blur-md bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-black shadow-lg flex items-center gap-2">
                      <X size={14} />
                      {recipe.missingIngredients.length} MISSING
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black text-white mb-4 line-clamp-2 leading-tight">{recipe.title}</h3>
                
                {totalSelectedCount > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2 font-black">
                      <span className="text-accent">{Math.round(recipe.matchPercentage)}% MATCH</span>
                      <span className="text-text-secondary flex items-center gap-1.5"><Clock size={16} />{recipe.totalTimeMinutes}m</span>
                    </div>
                    <div className="w-full bg-border-primary rounded-full h-2 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-accent to-emerald-400 h-full transition-all duration-1000" style={{ width: `${recipe.matchPercentage}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <p className="text-sm text-text-secondary line-clamp-3">
                    <span className="font-black text-white uppercase text-[10px] tracking-widest block mb-1">Needs:</span>
                    {[...(recipe.ingredients || []), ...(recipe.vegetables || []), ...(recipe.flour || [])].join(', ')}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-border-primary flex items-center gap-4">
                  <button 
                    onClick={() => {
                      addRecent(recipe);
                      navigate(`/recipe/${recipe._id || recipe.id}`);
                    }}
                    className="flex-1 py-4.5 bg-accent text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-lg hover:bg-accent-hover hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    View Recipe
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe._id || recipe.id); }}
                      className={`w-12 h-12 rounded-[1rem] flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
                        favoriteRecipes.includes(recipe._id || recipe.id) 
                          ? 'bg-red-500 border-red-500 text-white shadow-lg' 
                          : 'bg-white/5 border-white/20 text-white hover:bg-red-500/20'
                      }`}
                    >
                      <Heart size={20} fill={favoriteRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CookNow;
