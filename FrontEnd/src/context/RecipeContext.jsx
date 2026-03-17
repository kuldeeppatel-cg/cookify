import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi';

const RecipeContext = createContext();

export const useRecipeContext = () => useContext(RecipeContext);

const API_BASE_URL = (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cookifyotpauthentication.onrender.com') + '/api';

export const RecipeProvider = ({ children }) => {
  const { data: recipes, loading, error, refetch } = useApi(`${API_BASE_URL}/recipes`);
  const user = localStorage.getItem('currentUser') || 'default';
  const userId = localStorage.getItem('currentUserId');
  
  // Persistence state
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [selectedFlour, setSelectedFlour] = useState([]);
  const [dietFilter, setDietFilter] = useState('All');

  // New features: Saved, Favorites, Recent
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Fetch user data from backend on mount or when user changes
  useEffect(() => {
    if (userId) {
      setIsUserLoading(true);
      fetch(`${API_BASE_URL}/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setSavedRecipes(data.savedRecipes || []);
            setFavoriteRecipes(data.favoriteRecipes || []);
            setRecentRecipes(data.recentRecipes || []);
          }
        })
        .catch(err => console.error('Failed to fetch user data:', err))
        .finally(() => setIsUserLoading(false));
    } else {
      setIsUserLoading(false);
    }
  }, [userId]);

  // Cleanup: Remove any recent recipes that are no longer in the main database
  useEffect(() => {
    if (recipes && recipes.length > 0 && recentRecipes.length > 0) {
      const recipeIds = new Set(recipes.map(r => (r._id || r.id)));
      const filtered = recentRecipes.filter(r => recipeIds.has(r._id || r.id));
      
      // Only update if the content actually changed to avoid infinite loops
      if (filtered.length !== recentRecipes.length) {
        setRecentRecipes(filtered);
      }
    }
  }, [recipes]); // Removed recentRecipes from dependencies to avoid loop

  const toggleSaved = useCallback(async (id) => {
    setSavedRecipes(prev => {
      const isSaved = prev.includes(id);
      const newSaved = isSaved ? prev.filter(i => i !== id) : [...prev, id];
      
      // Sync with backend
      if (userId) {
        fetch(`${API_BASE_URL}/users/${userId}/save-recipe`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId: id })
        }).catch(err => console.error('Failed to sync saved recipe:', err));
      }
      
      return newSaved;
    });
  }, [userId]);

  const toggleFavorite = useCallback((id) => {
    setFavoriteRecipes(prev => {
      const isFav = prev.includes(id);
      const newFav = isFav ? prev.filter(i => i !== id) : [...prev, id];

      // Sync with backend
      if (userId) {
        fetch(`${API_BASE_URL}/users/${userId}/favorite-recipe`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId: id })
        }).catch(err => console.error('Failed to sync favorite recipe:', err));
      }

      return newFav;
    });
  }, [userId]);

  const addRecent = useCallback((recipe) => {
    if (!recipe) return;
    const id = (recipe._id || recipe.id);
    setRecentRecipes(prev => {
      if (prev.length > 0 && (prev[0]._id || prev[0].id) === id) return prev;
      const filtered = prev.filter(r => (r._id || r.id) !== id);
      return [recipe, ...filtered].slice(0, 4);
    });
  }, []);

  // Effect to sync recentRecipes to the backend whenever it changes locally
  useEffect(() => {
    if (userId && recentRecipes.length >= 0) {
      // Small debounce or simple check to avoid unnecessary hits
      const timer = setTimeout(() => {
        fetch(`${API_BASE_URL}/users/${userId}/recent-recipes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recentRecipes })
        }).catch(err => console.error('Failed to sync recent recipes:', err));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [recentRecipes, userId]);

  const addRecipe = useCallback(async (recipeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recipeData, createdBy: user })
      });
      if (!response.ok) throw new Error('Failed to add recipe');
      await refetch();
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }, [user, refetch]);

  const deleteRecipe = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete recipe');
      
      // Cleanup local persistence states
      setRecentRecipes(prev => prev.filter(r => (r._id || r.id) !== id));
      setSavedRecipes(prev => prev.filter(savedId => savedId !== id));
      setFavoriteRecipes(prev => prev.filter(favId => favId !== id));

      await refetch();
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }, [refetch]);

  const updateRecipe = useCallback(async (id, recipeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      if (!response.ok) throw new Error('Failed to update recipe');
      await refetch();
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }, [refetch]);

  return (
    <RecipeContext.Provider value={{ 
      recipes, loading, error, isUserLoading,
      hasSearched, setHasSearched,
      selectedIngredients, setSelectedIngredients,
      selectedVegetables, setSelectedVegetables,
      selectedFlour, setSelectedFlour,
      dietFilter, setDietFilter,
      savedRecipes, toggleSaved,
      favoriteRecipes, toggleFavorite,
      recentRecipes, addRecent,
      addRecipe,
      deleteRecipe,
      updateRecipe,
      user
    }}>
      {children}
    </RecipeContext.Provider>
  );
};
