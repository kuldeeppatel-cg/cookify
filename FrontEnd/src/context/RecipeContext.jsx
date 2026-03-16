import React, { createContext, useContext, useState, useEffect } from 'react';
import useApi from '../hooks/useApi';

const RecipeContext = createContext();

export const useRecipeContext = () => useContext(RecipeContext);

export const RecipeProvider = ({ children }) => {
  const { data: recipes, loading, error } = useApi('https://cookify-server.onrender.com/api/recipes');
  const user = localStorage.getItem('currentUser') || 'default';
  
  // Persistence state
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [selectedFlour, setSelectedFlour] = useState([]);
  const [dietFilter, setDietFilter] = useState('All');

  // New features: Saved, Favorites, Recent
  const [savedRecipes, setSavedRecipes] = useState(() => JSON.parse(localStorage.getItem(`saved_${user}`)) || []);
  const [favoriteRecipes, setFavoriteRecipes] = useState(() => JSON.parse(localStorage.getItem(`fav_${user}`)) || []);
  const [recentRecipes, setRecentRecipes] = useState(() => JSON.parse(localStorage.getItem(`recent_${user}`)) || []);

  useEffect(() => {
    localStorage.setItem(`saved_${user}`, JSON.stringify(savedRecipes));
  }, [savedRecipes, user]);

  useEffect(() => {
    localStorage.setItem(`fav_${user}`, JSON.stringify(favoriteRecipes));
  }, [favoriteRecipes, user]);

  useEffect(() => {
    localStorage.setItem(`recent_${user}`, JSON.stringify(recentRecipes));
  }, [recentRecipes, user]);

  const toggleSaved = (id) => {
    setSavedRecipes(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleFavorite = (id) => {
    setFavoriteRecipes(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addRecent = (recipe) => {
    if (!recipe) return;
    const id = (recipe._id || recipe.id);
    setRecentRecipes(prev => {
      const filtered = prev.filter(r => (r._id || r.id) !== id);
      return [recipe, ...filtered].slice(0, 8); // Keep last 8
    });
  };

  return (
    <RecipeContext.Provider value={{ 
      recipes, loading, error,
      hasSearched, setHasSearched,
      selectedIngredients, setSelectedIngredients,
      selectedVegetables, setSelectedVegetables,
      selectedFlour, setSelectedFlour,
      dietFilter, setDietFilter,
      savedRecipes, toggleSaved,
      favoriteRecipes, toggleFavorite,
      recentRecipes, addRecent
    }}>
      {children}
    </RecipeContext.Provider>
  );
};
