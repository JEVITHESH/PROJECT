import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if a Supabase error is a "table not found" error
function isTableNotFoundError(error: any) {
  return error && (error.code === "PGRST205" || error.message?.includes("relation") || error.message?.includes("does not exist"));
}

const STATS_PATH = process.env.VERCEL ? "/tmp/stats.json" : path.join(process.cwd(), "data", "stats.json");

function readLocalStats() {
  try {
    if (!fs.existsSync(STATS_PATH)) {
      const initialStats = {
        pageViews: 1240,
        monthlyTraffic: {
          "2026-01": 180,
          "2026-02": 260,
          "2026-03": 380,
          "2026-04": 520,
          "2026-05": 710,
          "2026-06": 940
        }
      };
      fs.writeFileSync(STATS_PATH, JSON.stringify(initialStats, null, 2), "utf-8");
      return initialStats;
    }
    return JSON.parse(fs.readFileSync(STATS_PATH, "utf-8"));
  } catch (e) {
    return {
      pageViews: 1240,
      monthlyTraffic: {}
    };
  }
}

function writeLocalStats(stats: any) {
  try {
    fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing local stats:", e);
  }
}

// Mapper functions for DB schema compatibility
function mapOrderToDb(order: any) {
  return {
    id: order.id,
    full_name: order.fullName,
    mobile: order.mobile,
    email: order.email,
    address: order.address,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    product_id: order.productId,
    product_name: order.productName,
    quantity: order.quantity,
    notes: order.notes,
    status: order.status,
    created_at: order.createdAt
  };
}

function mapOrderFromDb(dbOrder: any) {
  return {
    id: dbOrder.id,
    fullName: dbOrder.full_name,
    mobile: dbOrder.mobile,
    email: dbOrder.email,
    address: dbOrder.address,
    city: dbOrder.city,
    state: dbOrder.state,
    pincode: dbOrder.pincode,
    productId: dbOrder.product_id,
    productName: dbOrder.product_name,
    quantity: dbOrder.quantity,
    notes: dbOrder.notes,
    status: dbOrder.status,
    createdAt: dbOrder.created_at
  };
}

function mapBannerToDb(banner: any) {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    offer_text: banner.offerText,
    image_url: banner.imageUrl,
    is_active: banner.isActive
  };
}

function mapBannerFromDb(dbBanner: any) {
  return {
    id: dbBanner.id,
    title: dbBanner.title,
    subtitle: dbBanner.subtitle,
    offerText: dbBanner.offer_text,
    imageUrl: dbBanner.image_url,
    isActive: dbBanner.is_active
  };
}

function mapWebContentToDb(content: any) {
  return {
    about_us: content.aboutUs,
    vision: content.vision,
    mission: content.mission,
    values: content.values,
    contact_phone: content.contactPhone,
    contact_email: content.contactEmail,
    contact_address: content.contactAddress,
    whatsapp_number: content.whatsappNumber,
    faqs: content.faqs,
    design_portfolios: content.designPortfolios || "850+",
    client_reviews: content.clientReviews || "15k+",
    artisanal_awards: content.artisanalAwards || "12"
  };
}

function mapWebContentFromDb(dbContent: any) {
  return {
    aboutUs: dbContent.about_us,
    vision: dbContent.vision,
    mission: dbContent.mission,
    values: dbContent.values,
    contactPhone: dbContent.contact_phone,
    contactEmail: dbContent.contact_email,
    contactAddress: dbContent.contact_address,
    whatsappNumber: dbContent.whatsapp_number,
    faqs: dbContent.faqs,
    designPortfolios: dbContent.design_portfolios || "850+",
    clientReviews: dbContent.client_reviews || "15k+",
    artisanalAwards: dbContent.artisanal_awards || "12"
  };
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "aura_secret_jwt_key_2026_premium";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to persistent data
const DB_DIR = process.env.VERCEL ? "/tmp/data" : path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "db.json");

// Path to uploads directory
const UPLOADS_DIR = process.env.VERCEL ? "/tmp/uploads" : path.join(process.cwd(), "uploads");

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
  ],
  designPortfolios: "850+",
  clientReviews: "15k+",
  artisanalAwards: "12"
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
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  try {
    const { data: admin, error } = await supabase
      .from("admin_user")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !admin) {
      // Fallback to local admin
      const dbData = readDb();
      if (dbData.admin.username === username && bcrypt.compareSync(password, dbData.admin.passwordHash)) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, username });
        return;
      }
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    if (bcrypt.compareSync(password, admin.password_hash)) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" });
      res.json({ token, username });
      return;
    }
    res.status(401).json({ error: "Invalid username or password" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        res.json(dbData.products);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (err: any) {
    const dbData = readDb();
    res.json(dbData.products);
  }
});

app.post("/api/products", authenticateAdmin, async (req, res) => {
  try {
    const newProduct = {
      id: "prod-" + Date.now(),
      ...req.body
    };

    const { data, error } = await supabase
      .from("products")
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        dbData.products.push(newProduct);
        writeDb(dbData);
        res.status(201).json(newProduct);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const index = dbData.products.findIndex((p: any) => p.id === req.params.id);
        if (index === -1) {
          res.status(404).json({ error: "Product not found" });
          return;
        }
        dbData.products[index] = { ...dbData.products[index], ...req.body };
        writeDb(dbData);
        res.json(dbData.products[index]);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const index = dbData.products.findIndex((p: any) => p.id === req.params.id);
        if (index === -1) {
          res.status(404).json({ error: "Product not found" });
          return;
        }
        dbData.products.splice(index, 1);
        writeDb(dbData);
        res.json({ success: true });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories API
app.get("/api/categories", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        res.json(dbData.categories || []);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data || []);
  } catch (err: any) {
    const dbData = readDb();
    res.json(dbData.categories || []);
  }
});

app.post("/api/categories", authenticateAdmin, async (req, res) => {
  try {
    const newCategory = {
      id: "cat-" + Date.now(),
      ...req.body
    };

    const { data, error } = await supabase
      .from("categories")
      .insert([newCategory])
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        if (!dbData.categories) dbData.categories = [];
        dbData.categories.push(newCategory);
        writeDb(dbData);
        res.status(201).json(newCategory);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const index = dbData.categories.findIndex((c: any) => c.id === req.params.id);
        if (index === -1) {
          res.status(404).json({ error: "Category not found" });
          return;
        }
        dbData.categories[index] = { ...dbData.categories[index], ...req.body };
        writeDb(dbData);
        res.json(dbData.categories[index]);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const index = dbData.categories.findIndex((c: any) => c.id === req.params.id);
        if (index === -1) {
          res.status(404).json({ error: "Category not found" });
          return;
        }
        dbData.categories.splice(index, 1);
        writeDb(dbData);
        res.json({ success: true });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Orders API
app.get("/api/orders", authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        res.json(dbData.orders);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data.map(mapOrderFromDb));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Places Order
app.post("/api/orders", async (req, res) => {
  const { fullName, mobile, email, address, city, state, pincode, productId, productName, quantity, notes } = req.body;
  
  if (!fullName || !mobile || !email || !address || !city || !state || !pincode || !productId || !productName || !quantity) {
    res.status(400).json({ error: "Please fill out all required customer and product details." });
    return;
  }

  const orderQty = parseInt(quantity, 10);
  const orderId = "AUR-" + Math.floor(10000 + Math.random() * 90000);
  const newOrder = {
    id: orderId,
    fullName,
    mobile,
    email,
    address,
    city,
    state,
    pincode,
    productId,
    productName,
    quantity: orderQty,
    notes: notes || "",
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  try {
    const dbOrder = mapOrderToDb(newOrder);
    const { data, error } = await supabase
      .from("orders")
      .insert([dbOrder])
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        // Fallback to local
        const dbData = readDb();
        const product = dbData.products.find((p: any) => p.id === productId);
        if (product) {
          product.stock = Math.max(0, product.stock - orderQty);
        }
        dbData.orders.unshift(newOrder);
        if (!dbData.stats) {
          dbData.stats = { pageViews: 1240, monthlyTraffic: {}, monthlyOrders: {} };
        }
        if (!dbData.stats.monthlyOrders) {
          dbData.stats.monthlyOrders = {};
        }
        const monthKey = new Date().toISOString().substring(0, 7);
        dbData.stats.monthlyOrders[monthKey] = (dbData.stats.monthlyOrders[monthKey] || 0) + 1;
        writeDb(dbData);
        res.status(201).json(newOrder);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }

    // Decrement stock in Supabase products table
    const { data: productData } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .maybeSingle();

    if (productData) {
      const currentStock = productData.stock || 0;
      await supabase
        .from("products")
        .update({ stock: Math.max(0, currentStock - orderQty) })
        .eq("id", productId);
    }

    res.status(201).json(mapOrderFromDb(data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const dbOrder = mapOrderToDb(req.body);
    const { data, error } = await supabase
      .from("orders")
      .update(dbOrder)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const index = dbData.orders.findIndex((o: any) => o.id === req.params.id);
        if (index === -1) {
          res.status(404).json({ error: "Order not found" });
          return;
        }
        dbData.orders[index] = { ...dbData.orders[index], ...req.body };
        writeDb(dbData);
        res.json(dbData.orders[index]);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(mapOrderFromDb(data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const index = dbData.orders.findIndex((o: any) => o.id === req.params.id);
        if (index === -1) {
          res.status(404).json({ error: "Order not found" });
          return;
        }
        dbData.orders.splice(index, 1);
        writeDb(dbData);
        res.json({ success: true });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Track Order status
app.get("/api/orders/track/:tracker", async (req, res) => {
  const tracker = req.params.tracker.trim();
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*");

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const matches = dbData.orders.filter((o: any) => 
          o.id.toLowerCase() === tracker.toLowerCase() || 
          o.mobile.replace(/\D/g, "") === tracker.replace(/\D/g, "")
        );
        res.json(matches);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }

    const mapped = orders.map(mapOrderFromDb);
    const matches = mapped.filter((o: any) => 
      o.id.toLowerCase() === tracker.toLowerCase() || 
      o.mobile.replace(/\D/g, "") === tracker.replace(/\D/g, "")
    );
    res.json(matches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Customers API
app.get("/api/customers", authenticateAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isTableNotFoundError(error)) {
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
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }

    const mappedOrders = orders.map(mapOrderFromDb);
    const customerMap = new Map();
    mappedOrders.forEach((o: any) => {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Banners API
app.get("/api/banners", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        res.json(dbData.banners || []);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data ? data.map(mapBannerFromDb) : []);
  } catch (err: any) {
    const dbData = readDb();
    res.json(dbData.banners || []);
  }
});

app.put("/api/banners/:id", authenticateAdmin, async (req, res) => {
  try {
    const dbBanner = mapBannerToDb(req.body);
    const { data, error } = await supabase
      .from("banners")
      .update(dbBanner)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        const index = dbData.banners.findIndex((b: any) => b.id === req.params.id);
        if (index === -1) {
          res.status(404).json({ error: "Banner not found" });
          return;
        }
        dbData.banners[index] = { ...dbData.banners[index], ...req.body };
        writeDb(dbData);
        res.json(dbData.banners[index]);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(mapBannerFromDb(data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Dynamic Web Content API
app.get("/api/content", async (req, res) => {
  try {
    // 1. Get counts from database dynamically to automatically update stats
    let productsCount = 0;
    let categoriesCount = 0;
    let ordersCount = 0;

    const { count: prodCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    productsCount = prodCount || 0;

    const { count: catCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });
    categoriesCount = catCount || 0;

    const { count: ordCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });
    ordersCount = ordCount || 0;

    // Fallback counts using local db.json if database query fails or returns 0
    if (productsCount === 0 || categoriesCount === 0) {
      try {
        const dbData = readDb();
        if (productsCount === 0) productsCount = dbData.products.length;
        if (categoriesCount === 0) categoriesCount = dbData.categories.length;
        if (ordersCount === 0) ordersCount = dbData.orders.length;
      } catch (e) {}
    }

    const designPortfoliosVal = `${850 + productsCount}+`;
    const clientReviewsVal = `${(15000 + ordersCount).toLocaleString()}+`;
    const artisanalAwardsVal = `${12 + categoriesCount}`;

    const { data, error } = await supabase
      .from("web_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        res.json({
          ...dbData.content,
          designPortfolios: designPortfoliosVal,
          clientReviews: clientReviewsVal,
          artisanalAwards: artisanalAwardsVal
        });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }

    if (!data) {
      const dbDefault = mapWebContentToDb(DEFAULT_CONTENT);
      const { data: seededData, error: seedError } = await supabase
        .from("web_content")
        .insert([{ id: 1, ...dbDefault }])
        .select()
        .single();

      if (seedError) {
        res.json({
          ...DEFAULT_CONTENT,
          designPortfolios: designPortfoliosVal,
          clientReviews: clientReviewsVal,
          artisanalAwards: artisanalAwardsVal
        });
        return;
      }
      
      const mapped = mapWebContentFromDb(seededData);
      res.json({
        ...mapped,
        designPortfolios: designPortfoliosVal,
        clientReviews: clientReviewsVal,
        artisanalAwards: artisanalAwardsVal
      });
      return;
    }

    const mapped = mapWebContentFromDb(data);
    res.json({
      ...mapped,
      designPortfolios: designPortfoliosVal,
      clientReviews: clientReviewsVal,
      artisanalAwards: artisanalAwardsVal
    });
  } catch (err: any) {
    res.json(DEFAULT_CONTENT);
  }
});

app.put("/api/content", authenticateAdmin, async (req, res) => {
  try {
    const dbContent = mapWebContentToDb(req.body);
    const { data, error } = await supabase
      .from("web_content")
      .update(dbContent)
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        const dbData = readDb();
        dbData.content = { ...dbData.content, ...req.body };
        writeDb(dbData);
        res.json(dbData.content);
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(mapWebContentFromDb(data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Stats & Traffic Analysis APIs
app.get("/api/stats", async (req, res) => {
  try {
    let pageViews = 0;
    let monthlyTraffic: Record<string, number> = {};

    // 1. Try to fetch page views and traffic from Supabase
    const { data: dbStats, error: statsError } = await supabase
      .from("stats")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (statsError || !dbStats) {
      const localStats = readLocalStats();
      pageViews = localStats.pageViews;
      monthlyTraffic = localStats.monthlyTraffic;
    } else {
      pageViews = dbStats.page_views;
      monthlyTraffic = dbStats.monthly_traffic || {};
    }

    // 2. Fetch monthlyOrders dynamically from orders table in Supabase
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("created_at");

    const monthlyOrders: Record<string, number> = {};

    if (!ordersError && orders) {
      orders.forEach((o: any) => {
        if (o.created_at) {
          const monthKey = o.created_at.substring(0, 7);
          monthlyOrders[monthKey] = (monthlyOrders[monthKey] || 0) + 1;
        }
      });
    } else {
      // Fallback: load orders from local db.json
      const dbData = readDb();
      dbData.orders.forEach((o: any) => {
        if (o.createdAt) {
          const monthKey = o.createdAt.substring(0, 7);
          monthlyOrders[monthKey] = (monthlyOrders[monthKey] || 0) + 1;
        }
      });
    }

    res.json({
      pageViews,
      monthlyTraffic,
      monthlyOrders
    });
  } catch (err) {
    const dbData = readDb();
    res.json(dbData.stats);
  }
});

app.post("/api/stats/hit", async (req, res) => {
  try {
    const monthKey = new Date().toISOString().substring(0, 7); // "YYYY-MM"

    // 1. Try to update stats in Supabase
    const { data: dbStats, error: getError } = await supabase
      .from("stats")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!getError && dbStats) {
      const newPageViews = (dbStats.page_views || 0) + 1;
      const newTraffic = { ...(dbStats.monthly_traffic || {}) };
      newTraffic[monthKey] = (newTraffic[monthKey] || 0) + 1;

      const { error: updateError } = await supabase
        .from("stats")
        .update({ page_views: newPageViews, monthly_traffic: newTraffic })
        .eq("id", 1);

      if (!updateError) {
        res.json({ success: true, pageViews: newPageViews });
        return;
      }
    }

    if (!getError && !dbStats) {
      const initialTraffic: Record<string, number> = {};
      initialTraffic[monthKey] = 1;
      const { error: insertError } = await supabase
        .from("stats")
        .insert([{ id: 1, page_views: 1, monthly_traffic: initialTraffic }]);

      if (!insertError) {
        res.json({ success: true, pageViews: 1 });
        return;
      }
    }

    // Fallback to local stats.json
    const localStats = readLocalStats();
    localStats.pageViews = (localStats.pageViews || 0) + 1;
    if (!localStats.monthlyTraffic) {
      localStats.monthlyTraffic = {};
    }
    localStats.monthlyTraffic[monthKey] = (localStats.monthlyTraffic[monthKey] || 0) + 1;
    writeLocalStats(localStats);

    res.json({ success: true, pageViews: localStats.pageViews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stats/reset", authenticateAdmin, async (req, res) => {
  try {
    // 1. Reset stats in Supabase
    await supabase
      .from("stats")
      .update({ page_views: 0, monthly_traffic: {} })
      .eq("id", 1);

    // 2. Clear all orders in Supabase
    await supabase
      .from("orders")
      .delete()
      .neq("id", "does_not_exist");

    // 3. Reset local stats fallback
    const emptyStats = {
      pageViews: 0,
      monthlyTraffic: {}
    };
    writeLocalStats(emptyStats);

    // 4. Reset local db.json orders fallback
    const dbData = readDb();
    dbData.orders = [];
    dbData.stats = {
      pageViews: 0,
      monthlyTraffic: {},
      monthlyOrders: {}
    };
    writeDb(dbData);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

if (!process.env.VERCEL) {
  startServer();
}

export default app;
