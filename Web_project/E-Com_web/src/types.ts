export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  colors: string[];
  stock: number;
  sku: string;
}

export interface Order {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  productId: string;
  productName: string;
  quantity: number;
  notes: string;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  offerText: string;
  imageUrl: string;
  isActive: boolean;
}

export interface WebContent {
  aboutUs: string;
  vision: string;
  mission: string;
  values: string[];
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  whatsappNumber: string;
  faqs: { question: string; answer: string }[];
  designPortfolios?: string;
  clientReviews?: string;
  artisanalAwards?: string;
}

export interface Customer {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  orderHistory: {
    orderId: string;
    productName: string;
    quantity: number;
    status: string;
    createdAt: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  stats?: string;
}

