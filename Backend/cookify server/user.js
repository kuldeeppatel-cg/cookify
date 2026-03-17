const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. CONFIGURATION & MIDDLEWARE
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// 2. MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kuldeepp91791_db_user:tigershroff1@kuldeep.w7ro5is.mongodb.net/Cookify";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Cookify Database Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 3. MODELS
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedRecipes: [{ type: String }],           
  favoriteRecipes: [{ type: String }],        
  recentRecipes: [{ type: Object }],          
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
  cuisine: String,
  image_url: String,
  prep_time: String,
  cook_time: String,
  ingredients: [String],
  vegetables: [String],
  flour: [String],
  instructions: [String],
  createdBy: { type: String, default: 'server' }
}, { timestamps: true });
const Recipe = mongoose.model('Recipe', recipeSchema);

// 4. API ROUTES

// Root Route
app.get('/', (req, res) => {
  res.send('Cookify Unified Server is Online');
});

// --- USER ROUTES ---
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already registered" });
    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ message: "Username already taken" });
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "User created!", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }], 
      password 
    });
    if (user) {
      res.status(200).json({ message: "Login successful", user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/save-recipe', async (req, res) => {
  try {
    const { recipeId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isSaved = user.savedRecipes.includes(recipeId);
    const update = isSaved 
      ? { $pull: { savedRecipes: recipeId } } 
      : { $addToSet: { savedRecipes: recipeId } };
    const updatedUser = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id/favorite-recipe', async (req, res) => {
  try {
    const { recipeId } = req.body;
    const user = await User.findById(req.params.id);
    const isFav = user.favoriteRecipes.includes(recipeId);
    const update = isFav 
      ? { $pull: { favoriteRecipes: recipeId } } 
      : { $addToSet: { favoriteRecipes: recipeId } };
    const updatedUser = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id/recent-recipes', async (req, res) => {
  try {
    const { recentRecipes } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { recentRecipes } },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- RECIPE ROUTES ---
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/recipes/bulk', async (req, res) => {
  try {
    const recipes = req.body;
    if (!Array.isArray(recipes)) {
      const singleRecipe = new Recipe(req.body);
      const saved = await singleRecipe.save();
      return res.status(201).json(saved);
    }
    const result = await Recipe.insertMany(recipes, { ordered: false });
    res.status(201).json({ message: "All recipes posted successfully", count: result.length });
  } catch (err) {
    if (err.name === 'BulkWriteError' || err.code === 11000) {
      const insertedCount = err.result?.nInserted || 0;
      const duplicates = err.writeErrors?.map(e => ({
        index: e.index,
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
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.patch('/api/recipes/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updatedRecipe) return res.status(404).send('Recipe not found');
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) return res.status(404).send('Recipe not found');
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Cookify Server running at http://localhost:${PORT}`);
});
