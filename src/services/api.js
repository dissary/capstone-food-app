const API_BASE = "http://localhost:3000/api";

async function authFetch(url, options = {}, currentUser) {
  const token = currentUser ? await currentUser.getIdToken() : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

export function createRestaurant(data, currentUser) {
  return authFetch("/restaurants", {
    method: "POST",
    body: JSON.stringify(data),
  }, currentUser);
}

export function getRestaurants() {
  return authFetch("/restaurants"); // no auth needed, public route
}

export function getMenuItems(restaurantId) {
  return authFetch(`/menu-items/restaurant/${restaurantId}`);
}
export function getRestaurant(id) {
  return authFetch(`/restaurants/${id}`);
}

export function createOrder(orderData, currentUser) {
  return authFetch("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  }, currentUser); // currentUser can be null — authFetch already handles that (no token attached)
}

export function createPaymentIntent(amount, currentUser) {
  return authFetch("/payments/create-payment-intent", {
    method: "POST",
    body: JSON.stringify({ amount }),
  }, currentUser);
}

export function getMyRestaurant(currentUser) {
  return authFetch("/restaurants/mine", {}, currentUser);
}
export function updateRestaurant(id, data, currentUser) {
  return authFetch(`/restaurants/${id}`, { method: "PUT", body: JSON.stringify(data) }, currentUser);
}
export function deleteRestaurant(id, currentUser) {
  return authFetch(`/restaurants/${id}`, { method: "DELETE" }, currentUser);
}
export function createMenuItem(data, currentUser) {
  return authFetch("/menu-items", { method: "POST", body: JSON.stringify(data) }, currentUser);
}
export function updateMenuItem(id, data, currentUser) {
  return authFetch(`/menu-items/${id}`, { method: "PUT", body: JSON.stringify(data) }, currentUser);
}
export function deleteMenuItem(id, currentUser) {
  return authFetch(`/menu-items/${id}`, { method: "DELETE" }, currentUser);
}

export function getAllUsers(currentUser) {
  return authFetch("/users", {}, currentUser);
}
export function updateUserRole(id, role, currentUser) {
  return authFetch(`/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }, currentUser);
}

export function getCurrentUserProfile(currentUser) {
  return authFetch("/users/me", {}, currentUser);
}

export function getOrder(id, currentUser) {
  return authFetch(`/orders/${id}`, {}, currentUser);
}
export function getMyOrders(currentUser) {
  return authFetch("/orders/mine", {}, currentUser);
}

export function getAllMenuItemsForOwner(restaurantId, currentUser) {
  return authFetch(`/menu-items/restaurant/${restaurantId}/all`, {}, currentUser);
}

export function getRestaurantOrders(restaurantId, currentUser) {
  return authFetch(`/orders/restaurant/${restaurantId}`, {}, currentUser);
}

export function updateOrderStatus(orderId, status, currentUser) {
  return authFetch(`/orders/${orderId}/status`, { method: "PUT", body: JSON.stringify({ status }) }, currentUser);
}

export function getAllRestaurantsForAdmin(currentUser) {
  return authFetch("/restaurants/all", {}, currentUser);
}