import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeContext } from '../context/RecipeContext';
import { 
  ArrowLeft, ChefHat, Heart, Bookmark, Clock, 
  Trash2, Plus, MessageSquare, Edit3, AlertCircle, X
} from 'lucide-react';

const MyRecipes = () => {
  const navigate = useNavigate();
  const { recipes, user, toggleSaved, toggleFavorite, savedRecipes, favoriteRecipes, addRecent, deleteRecipe } = useRecipeContext();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const myRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter(r => r.createdBy === user);
  }, [recipes, user]);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    const result = await deleteRecipe(id);
    if (result.success) {
      setDeleteConfirm(null);
    } else {
      alert("Failed to delete recipe: " + result.error);
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen pt-32 md:pt-44 pb-20 bg-bg-primary px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="animate-in slide-in-from-left duration-700">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-text-secondary hover:text-white transition-all mb-6"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent transition-colors">
                <ArrowLeft size={16} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-4">
              <ChefHat size={40} className="text-accent" />
              My Recipes
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              You have shared {myRecipes.length} {myRecipes.length === 1 ? 'recipe' : 'recipes'} with the community
            </p>
          </div>

          <button 
            onClick={() => navigate('/add-recipe')}
            className="flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-[2rem] font-bold hover:shadow-[0_0_30px_rgba(37,116,120,0.3)] transition-all transform hover:-translate-y-1"
          >
            <Plus size={20} />
            Add New Recipe
          </button>
        </div>

        {/* Grid Section */}
        {myRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {myRecipes.map((recipe) => (
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
                  
                  {/* Diet Badge */}
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

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3">
                    <button 
                      onClick={() => {
                        addRecent(recipe);
                        navigate(`/recipe/${recipe._id || recipe.id}`);
                      }}
                      className="p-3 bg-white text-black rounded-xl hover:bg-accent hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                      title="View Details"
                    >
                      <Plus size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/edit-recipe/${recipe._id || recipe.id}`)}
                      className="p-3 bg-white text-black rounded-xl hover:bg-blue-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75"
                      title="Edit Recipe"
                    >
                      <Edit3 size={20} />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold line-clamp-1 group-hover:text-accent transition-colors duration-300">{recipe.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-text-secondary text-xs mb-6 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-accent" />
                      {recipe.prep_time || '15m'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-accent" />
                      {recipe.cuisine || 'Fusion'}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleFavorite(recipe._id || recipe.id)}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                          favoriteRecipes.includes(recipe._id || recipe.id) 
                            ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                            : 'bg-white/5 text-text-secondary hover:text-red-500 hover:bg-red-500/5'
                        }`}
                      >
                        <Heart size={18} fill={favoriteRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => toggleSaved(recipe._id || recipe.id)}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                          savedRecipes.includes(recipe._id || recipe.id) 
                            ? 'bg-accent/10 text-accent shadow-[0_0_15px_rgba(37,116,120,0.2)]' 
                            : 'bg-white/5 text-text-secondary hover:text-accent hover:bg-accent/5'
                        }`}
                      >
                        <Bookmark size={18} fill={savedRecipes.includes(recipe._id || recipe.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setDeleteConfirm(recipe._id || recipe.id)}
                      className="text-white/20 hover:text-red-500 transition-colors p-2"
                      title="Delete Recipe"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-1000">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-white/10 mb-8 border border-white/5">
              <ChefHat size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Shared Recipes Yet</h2>
            <p className="text-text-secondary max-w-sm mb-10 leading-relaxed">
              Start sharing your culinary secrets with the Cookify community and they'll appear here!
            </p>
            <button 
              onClick={() => navigate('/add-recipe')}
              className="px-10 py-4 bg-accent text-white rounded-full font-bold hover:shadow-[0_0_30px_rgba(37,116,120,0.4)] transition-all transform hover:-translate-y-1"
            >
              Share Your First Recipe
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#171717] border border-white/10 rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <AlertCircle size={32} />
              </div>
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Delete Recipe?</h3>
            <p className="text-text-secondary mb-10">
              Are you sure you want to delete this recipe? This action cannot be undone and it will be removed from everyone's collections.
            </p>
            
            <div className="flex flex-col gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirm)}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : <><Trash2 size={20} /> Delete Permanently</>}
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="w-full py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
