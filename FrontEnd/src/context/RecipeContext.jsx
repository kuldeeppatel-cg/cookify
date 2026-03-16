import React, { createContext, useContext, useState } from 'react';
import useApi from '../hooks/useApi';

const RecipeContext = createContext();

export const useRecipeContext = () => useContext(RecipeContext);

export const RecipeProvider = ({ children }) => {
  const { data: recipes, loading, error } = useApi('https://cookify-server.onrender.com/api/recipes');
  
  // Persistence state
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [selectedFlour, setSelectedFlour] = useState([]);
  const [dietFilter, setDietFilter] = useState('All');

  return (
    <RecipeContext.Provider value={{ 
      recipes, 
      loading, 
      error,
      hasSearched, setHasSearched,
      selectedIngredients, setSelectedIngredients,
      selectedVegetables, setSelectedVegetables,
      selectedFlour, setSelectedFlour,
      dietFilter, setDietFilter
    }}>
      {children}
    </RecipeContext.Provider>
  );
};
