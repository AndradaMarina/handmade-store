import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      const parsedCart = stored ? JSON.parse(stored) : [];
      console.log("CartContext initialized with:", parsedCart);
      return parsedCart;
    } catch (error) {
      console.error("Eroare la citirea coșului din localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      console.log("Saving cart to localStorage:", cart);
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Eroare la salvarea coșului în localStorage:", error);
    }
  }, [cart]);

  const addToCart = useCallback((item) => {
    console.log("Adding to cart:", item);
    
    if (!item || !item.id) {
      console.error("Item invalid adăugat în coș:", item);
      return;
    }
    
    setCart((prev) => {
      console.log("Previous cart:", prev);
      
      // Verifică dacă produsul cu aceleași specificații există deja
      const existingIndex = prev.findIndex(
        (cartItem) => 
          cartItem.id === item.id && 
          cartItem.variant === item.variant && 
          cartItem.size === item.size &&
          cartItem.engraving === item.engraving
      );

      let newCart;
      if (existingIndex !== -1) {
        // Dacă există, crește cantitatea
        newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: (newCart[existingIndex].quantity || 1) + 1
        };
      } else {
        // Dacă nu există, adaugă ca produs nou cu cantitate 1
        newCart = [...prev, { ...item, quantity: 1 }];
      }
      
      console.log("New cart after add:", newCart);
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((id, variant, size, engraving) => {
    console.log("Removing from cart:", { id, variant, size, engraving });
    
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
        // Dacă cantitatea > 1, scade cantitatea
        newCart[index] = { ...currentItem, quantity: currentItem.quantity - 1 };
      } else {
        // Dacă cantitatea = 1, elimină produsul complet
        newCart.splice(index, 1);
      }
      
      console.log("New cart after remove:", newCart);
      return newCart;
    });
  }, []);

  const removeItemCompletely = useCallback((id, variant, size, engraving) => {
    console.log("Removing item completely:", { id, variant, size, engraving });
    
    setCart((prev) => {
      const newCart = prev.filter(
        (item) => 
          !(item.id === id && 
            item.variant === variant && 
            item.size === size &&
            item.engraving === engraving)
      );
      
      console.log("New cart after complete removal:", newCart);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((id, variant, size, engraving, newQuantity) => {
    console.log("Updating quantity:", { id, variant, size, engraving, newQuantity });
    
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
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      
      console.log("New cart after quantity update:", newCart);
      return newCart;
    });
  }, [removeItemCompletely]);

  const clearCart = useCallback(() => {
    console.log("CLEARING CART - this should only happen after successful order!");
    console.trace("clearCart called from:");
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    console.log("Calculating cart total:", total, "from cart:", cart);
    return total;
  }, [cart]);

  const getCartItemsCount = useCallback(() => {
    const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    console.log("Calculating cart items count:", count, "from cart:", cart);
    return count;
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