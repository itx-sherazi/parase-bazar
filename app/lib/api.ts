const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Role = "CUSTOMER" | "ADMIN" | "SUB_ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  stock: number;
  priceOverride: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; parentId: string | null } | null;
  price: number;
  mrp: number | null;
  stock: number;
  images: string[];
  variants?: ProductVariant[];
}

const ACCESS_TOKEN_KEY = "ParasBazar_access_token";
const USER_KEY = "ParasBazar_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function storeSession(accessToken: string, user: AuthUser) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseError(res: Response) {
  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  try {
    const data = await res.json();
    return data.message || "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  captchaToken?: string | null;
}) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  storeSession(data.accessToken, data.user);
  return data.user as AuthUser;
}

export async function loginUser(input: { email: string; password: string; captchaToken?: string | null }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  storeSession(data.accessToken, data.user);
  return data.user as AuthUser;
}

export async function logoutUser() {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  clearSession();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.categories as Category[];
}

export async function fetchProducts(params?: { category?: string; search?: string }) {
  const url = new URL(`${API_BASE}/api/products`);
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.search) url.searchParams.set("search", params.search);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.products as Product[];
}

export async function fetchProduct(slug: string) {
  const res = await fetch(`${API_BASE}/api/products/${slug}`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.product as Product;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  adminReply: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

export async function fetchProductReviews(productId: string) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ reviews: Review[]; averageRating: number; reviewCount: number }>;
}

export async function submitReview(productId: string, rating: number, comment?: string) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ rating, comment }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export interface ProductQuestion {
  id: string;
  question: string;
  answer: string | null;
  createdAt: string;
  answeredAt: string | null;
  user: { name: string };
}

export async function fetchProductQuestions(productId: string) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/questions`);
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.questions as ProductQuestion[];
}

export async function askProductQuestion(productId: string, question: string) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  variant: ProductVariant | null;
  quantity: number;
  product: Product;
}

export interface Cart {
  id?: string;
  items: CartItem[];
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export async function fetchWishlist() {
  const res = await fetch(`${API_BASE}/api/wishlist`, {
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.items as WishlistItem[];
}

export async function addToWishlist(productId: string) {
  const res = await fetch(`${API_BASE}/api/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function removeFromWishlist(productId: string) {
  const res = await fetch(`${API_BASE}/api/wishlist/${productId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function fetchCart() {
  const res = await fetch(`${API_BASE}/api/cart`, {
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.cart as Cart;
}

export async function addToCart(productId: string, quantity = 1, variantId?: string) {
  const res = await fetch(`${API_BASE}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ productId, quantity, variantId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.cart as Cart;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const res = await fetch(`${API_BASE}/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.cart as Cart;
}

export async function removeCartItem(itemId: string) {
  const res = await fetch(`${API_BASE}/api/cart/items/${itemId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.cart as Cart;
}

export type PaymentMethod = "COD" | "JAZZCASH";

export interface Order {
  id: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  guestEmail: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  items: (CartItem & { itemStatus: string; price: number })[];
}

export interface JazzCashRedirect {
  hcpUrl: string | null;
  params: Record<string, string | number>;
  mock: boolean;
}

export async function checkout(input: {
  paymentMethod: PaymentMethod;
  couponCode?: string;
  shipping: { name: string; phone: string; address: string; city: string; state: string };
}) {
  const res = await fetch(`${API_BASE}/api/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data as { order: Order; jazzcash?: JazzCashRedirect };
}

export async function guestCheckout(input: {
  paymentMethod: PaymentMethod;
  couponCode?: string;
  items: { productId: string; quantity: number }[];
  shipping: { name: string; phone: string; address: string; city: string; state: string; email: string };
}) {
  const res = await fetch(`${API_BASE}/api/guest-orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data as { order: Order; jazzcash?: JazzCashRedirect };
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: "PERCENT" | "FIXED";
  value: number;
  discountAmount: number;
}

export async function validateCoupon(code: string, cartTotal: number) {
  const isGuest = !getStoredToken();
  const res = await fetch(`${API_BASE}/api/${isGuest ? "guest-orders" : "orders"}/validate-coupon`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ code, cartTotal }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<CouponValidation>;
}

export async function fetchMyOrders() {
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.orders as Order[];
}

export async function fetchMyOrder(orderId: string) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.order as Order;
}

export async function trackGuestOrder(orderId: string, email: string) {
  const url = new URL(`${API_BASE}/api/guest-orders/track`);
  url.searchParams.set("orderId", orderId);
  url.searchParams.set("email", email);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.order as Order;
}

export async function downloadInvoice(orderId: string) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/invoice`, {
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ParasBazar-invoice-${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export interface ReturnRequest {
  id: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED";
  reason: string;
  orderItemId: string;
}

export async function requestReturn(itemId: string, reason: string) {
  const res = await fetch(`${API_BASE}/api/orders/items/${itemId}/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.return as ReturnRequest;
}

export async function fetchMyReturns() {
  const res = await fetch(`${API_BASE}/api/orders/returns`, {
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.returns as ReturnRequest[];
}

export interface LegalPage {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export async function fetchLegalPage(slug: string) {
  const res = await fetch(`${API_BASE}/api/legal/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.page as LegalPage;
}
