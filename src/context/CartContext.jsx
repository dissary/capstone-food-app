import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]); // [{ menu_item_id, name, price, quantity }]
  const [restaurantId, setRestaurantId] = useState(null);

  function addToCart(item, fromRestaurantId) {
    // Prevent mixing items from different restaurants
    if (restaurantId && restaurantId !== fromRestaurantId) {
      const confirmClear = window.confirm(
        "Your cart has items from a different restaurant. Clear cart and add this item instead?"
      );
      if (!confirmClear) return;
      setCart([]);
    }
    setRestaurantId(fromRestaurantId);

    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item_id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: parseFloat(item.price), quantity: 1 }];
    });
  }

  function removeFromCart(menuItemId) {
    setCart((prev) => prev.filter((i) => i.menu_item_id !== menuItemId));
  }

  function updateQuantity(menuItemId, quantity) {
    if (quantity <= 0) return removeFromCart(menuItemId);
    setCart((prev) =>
      prev.map((i) => (i.menu_item_id === menuItemId ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setCart([]);
    setRestaurantId(null);
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = { cart, restaurantId, addToCart, removeFromCart, updateQuantity, clearCart, total };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}