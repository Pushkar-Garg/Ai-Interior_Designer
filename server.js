import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "interior-ai-secret-key-2024";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/interior_ai";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Define Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  original_image: { type: String, required: true },
  generated_image: { type: String, required: true },
  prompt: { type: String, required: true },
  style: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);

async function startServer() {
  await connectDB();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Auth Middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, name });
      await user.save();
      
      const token = jwt.sign({ id: user._id.toString(), email, name }, JWT_SECRET);
      res.json({ token, user: { id: user._id.toString(), email, name } });
    } catch (e) {
      console.error("Signup error:", e);
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET);
        res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e) {
      console.error("Login error:", e);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Projects
  app.get("/api/projects", authenticateToken, async (req, res) => {
    try {
      const projects = await Project.find({ user_id: req.user.id }).sort({ created_at: -1 });
      // Map _id to id for frontend compatibility if needed, though frontend uses project.id
      const formattedProjects = projects.map(p => ({
        ...p.toObject(),
        id: p._id,
        user_id: p.user_id
      }));
      res.json(formattedProjects);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", authenticateToken, async (req, res) => {
    const { name, original_image, generated_image, prompt, style } = req.body;
    try {
      const project = new Project({
        user_id: req.user.id,
        name,
        original_image,
        generated_image,
        prompt,
        style
      });
      await project.save();
      res.json({ id: project._id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to save project" });
    }
  });

  app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
    try {
      await Project.deleteOne({ _id: req.params.id, user_id: req.user.id });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
