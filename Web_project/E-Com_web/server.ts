import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "aura_secret_jwt_key_2026_premium";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to persistent data
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "db.json");

// Path to uploads directory
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use("/uploads", express.static(UPLOADS_DIR));

// Initial seed data
const DEFAULT_PRODUCTS: any[] = [];
const DEFAULT_ORDERS: any[] = [];
const DEFAULT_BANNERS: any[] = [];

const DEFAULT_CATEGORIES = [
  {
    id: "rings",
    name: "Rings",
    tagline: "Unconditional Elegance for Every Finger",
    description: "Classic engagement solitaires, eternity bands, and statement gemstones crafted in premium platinum and tarnish-resistant rose-gold finishes.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
    stats: "Over 45 elegant designs available"
  },
  {
    id: "earrings",
    name: "Earrings",
    tagline: "Graceful Drops and Micro-Pave Hoops",
    description: "Freshwater pearl drops, Cascading chandeliers, minimalist hoops, and sparkling crystal studs designed to frame your look.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
    stats: "Nickel-free hypoallergenic bases"
  },
  {
    id: "necklaces",
    name: "Necklaces",
    tagline: "Sophisticated Strands for Modern Silhouettes",
    description: "Elegant chains, Austrian sapphire vines, customizable medallions, and layered links plated with 18k yellow gold.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
    stats: "Adjustable 40cm-45cm lengths"
  },
  {
    id: "bangles",
    name: "Bangles",
    tagline: "Fluid Wristwear for Daily Stacking",
    description: "Hand-hammered textured bands, classic sleek slide-on bracelets, and heavy statement geometric bangles designed to layer.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
    stats: "Includes safe latching locks"
  },
  {
    id: "bracelets",
    name: "Bracelets",
    tagline: "Minimal Chics to Diamond-Cut Links",
    description: "Paperclip link chains, charms, micro pearl beads, and customizable initials bracelets for everyday premium styling.",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600",
    stats: "Tarnish-proof everyday wear"
  },
  {
    id: "gift-collections",
    name: "Gift Collections",
    tagline: "Siso Premium Gift Packaging",
    description: "Pre-paired set showcases containing matching necklaces and drop earrings packed neatly in emerald velvet bags.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
    stats: "Complementary handwritten messages"
  },
  {
    id: "custom-accessories",
    name: "Custom Accessories",
    tagline: "Bespoke Engraving and Summer Layers",
    description: "High-accuracy custom laser engraving on solid coin plates. Includes double-strand anklets with turquoise accents.",
    image: "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=600",
    stats: "Individualized laser engraving"
  }
];


const DEFAULT_CONTENT = {
  aboutUs: "Founded in Tittakudi, Siso shopping began with a singular, clear ambition: to build exquisite, masterfully crafted daily jewelry, fashion accessories, and gifts that express luxury without imposing prohibitive costs. We focus on gorgeous geometric elegance, clean lines, tarnish-free, hypoallergenic materials, and meticulously polished stones. Each piece undergoes rigid high-accuracy QA testing to match premium standards.",
  vision: "To become the most dependable and beloved online house for custom fashion jewelry and gift selections, recognized worldwide for outstanding clarity, impeccable human centered service, and ethical conflict-free procurement.",
  mission: "We strive to create magnificent, deeply moving statements of self-expression. By combining modern computer-aided luxury design with timeless handcrafting techniques, we craft jewelry suitable for both daily joy and lifetime memories.",
  values: [
    "Ethical Integrity: 100% conflicts-free, responsibly sourced diamonds and metals.",
    "Impeccable Longevity: Anti-tarnish technology, tarnish-free, waterproof materials.",
    "Artisanal Excellence: Highly detailed, hand-polished finishes from Master Craftspersons.",
    "Absolute Inclusivity: Sizing and adjustments made accessible for all backgrounds.",
    "Customer Centered: Seamless checkout, direct WhatsApp advice, and prompt 48-hour shipment tracking."
  ],
  contactPhone: "+91 8015449688",
  contactEmail: "contact@sisoshopping.com",
  contactAddress: "Siso shopping, Tittakudi",
  whatsappNumber: "8015449688",
  faqs: [
    {
      question: "Are your jewelry items water-resistant and tarnish-free?",
      answer: "Yes! High-purity stainless steel, sterling silver, and solid gold bases are coated with state-of-the-art PVD vacuum plating. They are waterproof, tarnish-free, sweatproof, and hypoallergenic, making them exceptionally safe for long daily wear."
    },
    {
      question: "Can I place a highly personalized custom order?",
      answer: "Absolutely! Under 'Custom Accessories', we offer premium engraving on circular medallions or pendant backplates. You can supply custom initials, birthdays, or specific coordinates in the 'Order Notes' during checkout."
    },
    {
      question: "What is your typical order processing and delivery timeline?",
      answer: "Standard orders are processed in our design studio within 24 to 48 hours. Domestic delivery takes 3 to 5 business days, and premium international priority shipping takes 5 to 9 days with fully trackable credentials."
    },
    {
      question: "Do you offer premium gift packaging solutions?",
      answer: "Yes, every single parcel arrives standard in our luxury recycled textured paper boxes. If you order from the 'Gift Collections' or specify inside the checkout notes, we wrap them in elegant emerald-green velvet bags and place them with an anniversary ribbon."
    }
  ]
};

// Initial database structure
const DEFAULT_DB = {
  admin: {
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10) // default secure password
  },
  products: DEFAULT_PRODUCTS,
  orders: DEFAULT_ORDERS,
  banners: DEFAULT_BANNERS,
  categories: DEFAULT_CATEGORIES,
  content: DEFAULT_CONTENT,
  stats: {
    pageViews: 1240,
    monthlyTraffic: {
      "2026-01": 180,
      "2026-02": 260,
      "2026-03": 380,
      "2026-04": 520,
      "2026-05": 710,
      "2026-06": 940
    },
    monthlyOrders: {
      "2026-01": 8,
      "2026-02": 12,
      "2026-03": 19,
      "2026-04": 25,
      "2026-05": 33,
      "2026-06": 41
    }
  }
};

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const data = JSON.parse(raw);
    
    // Ensure stats structure exists gracefully
    if (!data.stats) {
      data.stats = {
        pageViews: 1240,
        monthlyTraffic: {
          "2026-01": 180,
          "2026-02": 260,
          "2026-03": 380,
          "2026-04": 520,
          "2026-05": 710,
          "2026-06": 940
        },
        monthlyOrders: {
          "2026-01": 8,
          "2026-02": 12,
          "2026-03": 19,
          "2026-04": 25,
          "2026-05": 33,
          "2026-06": 41
        }
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
    
    // Ensure categories structure exists gracefully
    if (!data.categories) {
      data.categories = DEFAULT_CATEGORIES;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
    return data;
  } catch (error) {
    console.error("Error reading database:", error);
    return DEFAULT_DB;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// REST APIs
// Image Upload API
app.post("/api/upload", (req, res) => {
  const { name, type, base64 } = req.body;
  if (!name || !base64) {
    res.status(400).json({ error: "Missing name or base64 data" });
    return;
  }
  try {
    const match = base64.match(/^data:([^;]+);base64,(.+)$/);
    const dataStr = match ? match[2] : base64;
    const buffer = Buffer.from(dataStr, "base64");
    
    const cleanName = name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const fileName = `${Date.now()}-${cleanName}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/${fileName}` });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to save file: " + err.message });
  }
});

// 1. Auth Login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  const dbData = readDb();
  if (dbData.admin.username === username && bcrypt.compareSync(password, dbData.admin.passwordHash)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, username });
    return;
  }
  res.status(401).json({ error: "Invalid username or password" });
});

// Middleware for Admin auth
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Token missing" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token or session expired" });
  }
};

// Admin Verify Endpoint
app.get("/api/auth/verify", authenticateAdmin, (req: any, res: any) => {
  res.json({ valid: true, admin: req.admin });
});

// 2. Products API
app.get("/api/products", (req, res) => {
  const dbData = readDb();
  res.json(dbData.products);
});

app.post("/api/products", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const newProduct = {
    id: "prod-" + Date.now(),
    ...req.body
  };
  dbData.products.push(newProduct);
  writeDb(dbData);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const index = dbData.products.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  dbData.products[index] = { ...dbData.products[index], ...req.body };
  writeDb(dbData);
  res.json(dbData.products[index]);
});

app.delete("/api/products/:id", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const index = dbData.products.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  dbData.products.splice(index, 1);
  writeDb(dbData);
  res.json({ success: true });
});

// Categories API
app.get("/api/categories", (req, res) => {
  const dbData = readDb();
  res.json(dbData.categories || []);
});

app.post("/api/categories", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  if (!dbData.categories) dbData.categories = [];
  const newCategory = {
    id: "cat-" + Date.now(),
    ...req.body
  };
  dbData.categories.push(newCategory);
  writeDb(dbData);
  res.status(201).json(newCategory);
});

app.put("/api/categories/:id", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const index = dbData.categories.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  dbData.categories[index] = { ...dbData.categories[index], ...req.body };
  writeDb(dbData);
  res.json(dbData.categories[index]);
});

app.delete("/api/categories/:id", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const index = dbData.categories.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  dbData.categories.splice(index, 1);
  writeDb(dbData);
  res.json({ success: true });
});

// 3. Orders API
app.get("/api/orders", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  res.json(dbData.orders);
});

// Customer Places Order
app.post("/api/orders", (req, res) => {
  const dbData = readDb();
  const { fullName, mobile, email, address, city, state, pincode, productId, productName, quantity, notes } = req.body;
  
  if (!fullName || !mobile || !email || !address || !city || !state || !pincode || !productId || !productName || !quantity) {
    res.status(400).json({ error: "Please fill out all required customer and product details." });
    return;
  }

  // Find product to decrement stock
  const product = dbData.products.find((p: any) => p.id === productId);
  if (product) {
    // optional decrement stock
    product.stock = Math.max(0, product.stock - quantity);
  }

  const newOrder = {
    id: "AUR-" + Math.floor(10000 + Math.random() * 90000),
    fullName,
    mobile,
    email,
    address,
    city,
    state,
    pincode,
    productId,
    productName,
    quantity: parseInt(quantity, 10),
    notes: notes || "",
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  dbData.orders.unshift(newOrder);

  // Increment order count in stats
  if (!dbData.stats) {
    dbData.stats = { pageViews: 1240, monthlyTraffic: {}, monthlyOrders: {} };
  }
  if (!dbData.stats.monthlyOrders) {
    dbData.stats.monthlyOrders = {};
  }
  const monthKey = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  dbData.stats.monthlyOrders[monthKey] = (dbData.stats.monthlyOrders[monthKey] || 0) + 1;

  writeDb(dbData);
  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const index = dbData.orders.findIndex((o: any) => o.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  dbData.orders[index] = { ...dbData.orders[index], ...req.body };
  writeDb(dbData);
  res.json(dbData.orders[index]);
});

app.delete("/api/orders/:id", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const index = dbData.orders.findIndex((o: any) => o.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  dbData.orders.splice(index, 1);
  writeDb(dbData);
  res.json({ success: true });
});

// Track Order status (either by exact order id like AUR-12345 or mobile phone matching)
app.get("/api/orders/track/:tracker", (req, res) => {
  const dbData = readDb();
  const tracker = req.params.tracker.trim();
  const matches = dbData.orders.filter((o: any) => 
    o.id.toLowerCase() === tracker.toLowerCase() || 
    o.mobile.replace(/\D/g, "") === tracker.replace(/\D/g, "")
  );
  res.json(matches);
});

// 4. Customers API (Admin only, generated from all orders lists but uniqueness by mobile)
app.get("/api/customers", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const customerMap = new Map();
  dbData.orders.forEach((o: any) => {
    if (!customerMap.has(o.mobile)) {
      customerMap.set(o.mobile, {
        fullName: o.fullName,
        mobile: o.mobile,
        email: o.email,
        address: `${o.address}, ${o.city}, ${o.state} - ${o.pincode}`,
        orderHistory: []
      });
    }
    const currentHist = customerMap.get(o.mobile);
    currentHist.orderHistory.push({
      orderId: o.id,
      productName: o.productName,
      quantity: o.quantity,
      status: o.status,
      createdAt: o.createdAt
    });
  });
  res.json(Array.from(customerMap.values()));
});

// 5. Banners API
app.get("/api/banners", (req, res) => {
  const dbData = readDb();
  res.json(dbData.banners);
});

app.put("/api/banners/:id", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  const index = dbData.banners.findIndex((b: any) => b.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Banner not found" });
    return;
  }
  dbData.banners[index] = { ...dbData.banners[index], ...req.body };
  writeDb(dbData);
  res.json(dbData.banners[index]);
});

// 7. Dynamic Web Content API
app.get("/api/content", (req, res) => {
  const dbData = readDb();
  res.json(dbData.content);
});

app.put("/api/content", authenticateAdmin, (req, res) => {
  const dbData = readDb();
  dbData.content = { ...dbData.content, ...req.body };
  writeDb(dbData);
  res.json(dbData.content);
});

// 8. Stats & Traffic Analysis APIs
app.get("/api/stats", (req, res) => {
  const dbData = readDb();
  res.json(dbData.stats);
});

app.post("/api/stats/hit", (req, res) => {
  const dbData = readDb();
  if (!dbData.stats) {
    dbData.stats = {
      pageViews: 1240,
      monthlyTraffic: {},
      monthlyOrders: {}
    };
  }
  dbData.stats.pageViews = (dbData.stats.pageViews || 0) + 1;
  const monthKey = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  if (!dbData.stats.monthlyTraffic) {
    dbData.stats.monthlyTraffic = {};
  }
  dbData.stats.monthlyTraffic[monthKey] = (dbData.stats.monthlyTraffic[monthKey] || 0) + 1;
  writeDb(dbData);
  res.json({ success: true, pageViews: dbData.stats.pageViews });
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Siso shopping fullstack] running successfully on http://localhost:${PORT}`);
  });
}

startServer();
