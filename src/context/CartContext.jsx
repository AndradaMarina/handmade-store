import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Eroare la citirea coșului din localStorage:", error);
      }
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Eroare la salvarea coșului în localStorage:", error);
      }
    }
  }, [cart]);

  const addToCart = useCallback((item) => {
    if (!item || !item.id) return;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.variant === item.variant &&
          cartItem.size === item.size &&
          cartItem.engraving === item.engraving
      );

      if (existingIndex !== -1) {
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: (newCart[existingIndex].quantity || 1) + 1
        };
        return newCart;
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id, variant, size, engraving) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.id === id &&
          item.variant === variant &&
          item.size === size &&
          item.engraving === engraving
      );

      if (index === -1) return prev;

      const newCart = [...prev];
      const currentItem = newCart[index];

      if (currentItem.quantity > 1) {
        newCart[index] = {
          ...currentItem,
          quantity: currentItem.quantity - 1
        };
      } else {
        newCart.splice(index, 1);
      }

      return newCart;
    });
  }, []);

  const removeItemCompletely = useCallback((id, variant, size, engraving) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.variant === variant &&
            item.size === size &&
            item.engraving === engraving
          )
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (id, variant, size, engraving, newQuantity) => {
      if (newQuantity <= 0) {
        removeItemCompletely(id, variant, size, engraving);
        return;
      }

      setCart((prev) => {
        const index = prev.findIndex(
          (item) =>
            item.id === id &&
            item.variant === variant &&
            item.size === size &&
            item.engraving === engraving
        );

        if (index === -1) return prev;

        const newCart = [...prev];
        newCart[index] = {
          ...newCart[index],
          quantity: newQuantity
        };

        return newCart;
      });
    },
    [removeItemCompletely]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce(
      (acc, item) => acc + item.price * (item.quantity || 1),
      0
    );
  }, [cart]);

  const getCartItemsCount = useCallback(() => {
    return cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart trebuie folosit în interiorul unui CartProvider");
  }
  return context;
};


