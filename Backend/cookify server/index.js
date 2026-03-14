const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


// --- DATABASE CONNECTION ---
mongoose.connect('mongodb+srv://kuldeepp91791_db_user:tigershroff1@kuldeep.w7ro5is.mongodb.net/Cookify')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect...', err));

// --- API ENDPOINTS ---
const recipeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true, // Prevents duplicate titles at the DB level
    trim: true 
  },
  category: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
  cuisine: String,
  image_url: String,
  prep_time: String,
  cook_time: String,
  ingredients: [String],
  instructions: [String]
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);
// 1. GET (Read all)
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST (Create)
app.post('/api/recipes/bulk', async (req, res) => {
  try {
    const recipes = req.body;

    if (!Array.isArray(recipes)) {
      // If it's a single object, wrap it in an array to keep logic consistent
      const singleRecipe = new Recipe(req.body);
      const saved = await singleRecipe.save();
      return res.status(201).json(saved);
    }

    // ordered: false ensures it doesn't stop on the first duplicate
    const result = await Recipe.insertMany(recipes, { ordered: false });
    res.status(201).json({
      message: "All recipes posted successfully",
      count: result.length
    });

  } catch (err) {
    // Check if it's a bulk write error (duplicates)
    if (err.name === 'BulkWriteError' || err.code === 11000) {
      const insertedCount = err.result?.nInserted || 0;
      
      // Use optional chaining (?.) to prevent the "undefined" error
      const duplicates = err.writeErrors?.map(e => ({
        index: e.index,
        // Safely access the title from the original request body using the index
        title: req.body[e.index]?.title || "Unknown", 
        error: "Duplicate title detected"
      })) || [];

      return res.status(207).json({
        message: "Partial success: Duplicates were skipped.",
        insertedCount: insertedCount,
        duplicateCount: duplicates.length,
        skipped: duplicates
      });
    }

    // Generic error fallback
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// 3. PUT (Full Update - Replaces the entire document)
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findOneAndReplace(
      { _id: req.params.id }, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedRecipe) return res.status(404).send('Recipe not found');
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. PATCH (Partial Update - e.g., only changing the cook_time)
app.patch('/api/recipes/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    if (!updatedRecipe) return res.status(404).send('Recipe not found');
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETE (Remove)
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) return res.status(404).send('Recipe not found');
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Cooking on port ${PORT}...`));