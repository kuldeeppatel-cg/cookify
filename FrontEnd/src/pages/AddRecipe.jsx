import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipeContext } from '../context/RecipeContext';
import { 
  ArrowLeft, ChefHat, Plus, Trash2, Image as ImageIcon, 
  Clock, Save, AlertCircle, CheckCircle2, Utensils, 
  Carrot, Wheat, ShoppingBasket, BookOpen, Info, Edit3
} from 'lucide-react';

const AddRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe } = useRecipeContext();
  
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Veg',
    cuisine: '',
    image_url: '',
    prep_time: '',
    cook_time: '',
    ingredients: [''],
    vegetables: [''],
    flour: [''],
    instructions: ['']
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditing && recipes) {
      const recipeToEdit = recipes.find(r => (r._id || r.id) === id);
      if (recipeToEdit) {
        setFormData({
          title: recipeToEdit.title || '',
          category: recipeToEdit.category || 'Veg',
          cuisine: recipeToEdit.cuisine || '',
          image_url: recipeToEdit.image_url || '',
          prep_time: recipeToEdit.prep_time || '',
          cook_time: recipeToEdit.cook_time || '',
          ingredients: recipeToEdit.ingredients?.length > 0 ? recipeToEdit.ingredients : [''],
          vegetables: recipeToEdit.vegetables?.length > 0 ? recipeToEdit.vegetables : [''],
          flour: recipeToEdit.flour?.length > 0 ? recipeToEdit.flour : [''],
          instructions: recipeToEdit.instructions?.length > 0 ? recipeToEdit.instructions : ['']
        });
      }
    }
  }, [id, recipes, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (index, field) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clean data: remove empty strings from arrays
    const cleanedIngredients = formData.ingredients.filter(i => i.trim() !== '');
    const cleanedInstructions = formData.instructions.filter(ins => ins.trim() !== '');
    const cleanedVegetables = formData.vegetables.filter(v => v.trim() !== '');
    const cleanedFlour = formData.flour.filter(f => f.trim() !== '');

    // Validation
    if (cleanedIngredients.length < 1) {
      setError('Please add at least one ingredient');
      setLoading(false);
      return;
    }

    if (cleanedInstructions.length < 2) {
      setError('Please add at least 2 cooking steps');
      setLoading(false);
      return;
    }

    const cleanedData = {
      ...formData,
      ingredients: cleanedIngredients,
      vegetables: cleanedVegetables,
      flour: cleanedFlour,
      instructions: cleanedInstructions
    };

    let result;
    if (isEditing) {
      result = await updateRecipe(id, cleanedData);
    } else {
      result = await addRecipe(cleanedData);
    }
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate(isEditing ? '/my-recipes' : '/'), 2000);
    } else {
      setError(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-bg-secondary p-12 rounded-[3rem] border border-accent/20 shadow-2xl max-w-lg animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">{isEditing ? 'Recipe Updated!' : 'Recipe Added!'}</h2>
          <p className="text-text-secondary mb-8">
            {isEditing 
              ? 'Your changes have been saved successfully. Redirecting...' 
              : 'Your culinary masterpiece has been shared with the world. Redirecting...'}
          </p>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-accent h-full animate-[progress_2s_linear]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-bg-primary px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 px-5 py-2.5 bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-full font-medium text-sm text-text-secondary transition-all duration-300 hover:text-white hover:border-accent hover:shadow-[0_0_20px_rgba(37,116,120,0.3)] hover:-translate-x-1 mb-10"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 group-hover:bg-accent transition-colors duration-300">
            <ArrowLeft size={16} className="text-text-secondary group-hover:text-white transition-colors duration-300" />
          </div>
          <span>Cancel & Go Back</span>
        </button>

        <div className="bg-[#171717]/40 backdrop-blur-md border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-8 md:p-12 border-b border-white/5 bg-gradient-to-r from-accent/5 to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                {isEditing ? <Edit3 size={28} /> : <ChefHat size={28} />}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{isEditing ? 'Edit Your Recipe' : 'Share Your Recipe'}</h1>
            </div>
            <p className="text-text-secondary">
              {isEditing ? 'Make changes to your recipe details below.' : 'Fill in the details below to add your secret recipe to Cookify.'}
              <span className="block mt-2 text-xs text-accent italic font-medium">* Required fields must be completed. Vegetables and Flour & Grains are optional.</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            {/* Basic Info */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-white font-bold opacity-60">
                <Info size={18} />
                <h2 className="uppercase text-xs tracking-widest">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Recipe Title</label>
                  <input 
                    required
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Grandma's Special Pasta"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Veg" className="bg-[#1a1a1a]">Vegetarian</option>
                    <option value="Non-Veg" className="bg-[#1a1a1a]">Non-Vegetarian</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Cuisine Type *</label>
                  <input 
                    required
                    type="text" 
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    placeholder="e.g. Italian, Indian, Mexican"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Recipe Image URL *</label>
                  <div className="relative">
                    <input 
                      required
                      type="url" 
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-white/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Prep Time *</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      name="prep_time"
                      value={formData.prep_time}
                      onChange={handleChange}
                      placeholder="e.g. 15m"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-white/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">Cook Time *</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      name="cook_time"
                      value={formData.cook_time}
                      onChange={handleChange}
                      placeholder="e.g. 30m"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-white/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                    <Utensils className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-white font-bold opacity-60">
                <Utensils size={18} />
                <h2 className="uppercase text-xs tracking-widest">Ingredients Breakdown</h2>
              </div>

              {/* Vegetables */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#10b981]">
                    <Carrot size={16} /> Vegetables
                  </label>
                  <button 
                    type="button" 
                    onClick={() => addArrayField('vegetables')}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add More
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.vegetables.map((v, i) => (
                    <div key={i} className="relative group">
                      <input 
                        type="text" 
                        value={v}
                        onChange={(e) => handleArrayChange(i, e.target.value, 'vegetables')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#10b981] outline-none"
                      />
                      {formData.vegetables.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeArrayField(i, 'vegetables')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flour/Grains */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#f59e0b]">
                    <Wheat size={16} /> Flour & Grains
                  </label>
                  <button 
                    type="button" 
                    onClick={() => addArrayField('flour')}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add More
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.flour.map((f, i) => (
                    <div key={i} className="relative group">
                      <input 
                        type="text" 
                        value={f}
                        onChange={(e) => handleArrayChange(i, e.target.value, 'flour')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#f59e0b] outline-none"
                      />
                      {formData.flour.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeArrayField(i, 'flour')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Ingredients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-accent">
                    <ShoppingBasket size={16} /> Other Ingredients *
                  </label>
                  <button 
                    type="button" 
                    onClick={() => addArrayField('ingredients')}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add More
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.ingredients.map((ing, i) => (
                    <div key={i} className="relative group">
                      <input 
                        type="text" 
                        value={ing}
                        onChange={(e) => handleArrayChange(i, e.target.value, 'ingredients')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                      />
                      {formData.ingredients.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeArrayField(i, 'ingredients')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-white font-bold opacity-60">
                <BookOpen size={18} />
                <h2 className="uppercase text-xs tracking-widest">Cooking Steps * (Min 2)</h2>
              </div>

              <div className="space-y-6">
                {formData.instructions.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 relative">
                      <textarea 
                        rows="2"
                        value={step}
                        onChange={(e) => handleArrayChange(i, e.target.value, 'instructions')}
                        placeholder="Describe this step..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-accent outline-none transition-all resize-none"
                      />
                      {formData.instructions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeArrayField(i, 'instructions')}
                          className="absolute -right-12 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => addArrayField('instructions')}
                  className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-text-secondary hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Next Step
                </button>
              </div>
            </div>

            {error && (
              <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4 text-red-500 animate-in slide-in-from-top-1">
                <AlertCircle size={24} />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="pt-8">
              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-accent text-white rounded-[2rem] font-black text-xl hover:shadow-[0_0_40px_rgba(37,116,120,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={24} />
                    {isEditing ? 'Save Changes' : 'Publish Recipe'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRecipe;
