import React, { createContext, useContext } from 'react';
import useApi from '../hooks/useApi';

const RecipeContext = createContext();

export const useRecipeContext = () => useContext(RecipeContext);

export const RecipeProvider = ({ children }) => {
  const { data: recipes, loading, error } = useApi('https://cookify-server.onrender.com/api/recipes');

  return (
    <RecipeContext.Provider value={{ recipes, loading, error }}>
      {children}
    </RecipeContext.Provider>
  );
};
