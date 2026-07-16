import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("dinery_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [restaurantId, setRestaurantId] = useState(() => {
    return localStorage.getItem("dinery_restaurant_id") || null;
  });

  useEffect(() => {
    localStorage.setItem("dinery_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem("dinery_restaurant_id", restaurantId);
    } else {
      localStorage.removeItem("dinery_restaurant_id");
    }
  }, [restaurantId]);

  useEffect(() => {
  if (cart.length === 0 && restaurantId) {
    setRestaurantId(null);
  }
}, [cart]);


  function addToCart(item, fromRestaurantId) {
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
      return [...prev, {
        menu_item_id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        image_url: item.image_url || null,
        quantity: 1,
      }];
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