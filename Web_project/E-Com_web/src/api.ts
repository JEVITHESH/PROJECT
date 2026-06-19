import { Product, Order, Customer, Banner, WebContent, Category } from "./types";

const API_BASE = ""; // Relative paths since server.ts mounts Vite in development & serves static in production

// Get Admin Token from localStorage
export function getAdminToken(): string | null {
  return localStorage.getItem("aura_admin_token");
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem("aura_admin_token", token);
  } else {
    localStorage.removeItem("aura_admin_token");
  }
}

// Request helper with optional token
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  // Authentication
  async login(username: string, password: string): Promise<{ token: string; username: string }> {
    return apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  },
  
  async verifyToken(): Promise<{ valid: boolean; admin: any }> {
    return apiFetch("/api/auth/verify");
  },
  
  // Products
  async getProducts(): Promise<Product[]> {
    return apiFetch("/api/products");
  },
  
  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    return apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify(product)
    });
  },
  
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return apiFetch(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product)
    });
  },
  
  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/products/${id}`, {
      method: "DELETE"
    });
  },
  
  // Orders
  async getOrders(): Promise<Order[]> {
    return apiFetch("/api/orders");
  },
  
  async createOrder(order: Omit<Order, "id" | "status" | "createdAt">): Promise<Order> {
    return apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(order)
    });
  },
  
  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    return apiFetch(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(orderData)
    });
  },
  
  async deleteOrder(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/orders/${id}`, {
      method: "DELETE"
    });
  },
  
  async trackOrder(tracker: string): Promise<Order[]> {
    return apiFetch(`/api/orders/track/${encodeURIComponent(tracker)}`);
  },
  
  // Customers List
  async getCustomers(): Promise<Customer[]> {
    return apiFetch("/api/customers");
  },
  
  // Banners
  async getBanners(): Promise<Banner[]> {
    return apiFetch("/api/banners");
  },
  
  async updateBanner(id: string, bannerData: Partial<Banner>): Promise<Banner> {
    return apiFetch(`/api/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(bannerData)
    });
  },
  
  // Content
  async getContent(): Promise<WebContent> {
    return apiFetch("/api/content");
  },
  
  async updateContent(contentData: Partial<WebContent>): Promise<WebContent> {
    return apiFetch("/api/content", {
      method: "PUT",
      body: JSON.stringify(contentData)
    });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return apiFetch("/api/categories");
  },
  
  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    return apiFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify(category)
    });
  },
  
  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    return apiFetch(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category)
    });
  },
  
  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/categories/${id}`, {
      method: "DELETE"
    });
  },

  // Website Traffic and Monthly Analytics Stats
  async getStats(): Promise<{
    pageViews: number;
    monthlyTraffic: Record<string, number>;
    monthlyOrders: Record<string, number>;
  }> {
    return apiFetch("/api/stats");
  },

  async incrementHit(): Promise<{ success: boolean; pageViews: number }> {
    return apiFetch("/api/stats/hit", {
      method: "POST"
    });
  },

  async resetStats(): Promise<{ success: boolean }> {
    return apiFetch("/api/stats/reset", {
      method: "POST"
    });
  }
};
