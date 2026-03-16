const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. CONFIGURATION & MIDDLEWARE
dotenv.config();
const app = express();
app.use(express.json()); // Parses incoming JSON
app.use(cors());         // Allows cross-origin requests from your Cookify frontend

// 2. MONGODB CONNECTION
// Replace 'your_mongodb_uri' with your actual connection string in a .env file
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kuldeepp91791_db_user:tigershroff1@kuldeep.w7ro5is.mongodb.net/Cookify";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Cookify Database Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 3. USER MODEL (SCHEMA)
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

// 4. API ROUTES

// Root Route
app.get('/', (req, res) => {
  res.send('Cookify User Data Server is Online');
});

// GET: Fetch a single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already registered" });

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ message: "Username already taken" });

    const newUser = new User({ username, email, password });
    await newUser.save();
    
    res.status(201).json({ message: "User created!", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST: Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // Search for user by email OR username
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

// PUT: Toggle save a recipe
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

// PUT: Toggle favorite a recipe
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

// PUT: Sync recent recipes
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

// 5. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});