import { createContext, useState, useContext, useEffect } from 'react'

const CartContext = createContext({})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems')
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, tenure = 3) => {
    const existingItem = cartItems.find(
      item => item.product._id === product._id && item.tenure === tenure
    )

    if (existingItem) {
      setCartItems(
        cartItems.map(item =>
          item.product._id === product._id && item.tenure === tenure
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCartItems([...cartItems, { product, tenure, quantity: 1 }])
    }
  }

  const removeFromCart = (productId, tenure) => {
    setCartItems(cartItems.filter(item => 
      !(item.product._id === productId && item.tenure === tenure)
    ))
  }

  const updateQuantity = (productId, tenure, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, tenure)
      return
    }

    setCartItems(
      cartItems.map(item =>
        item.product._id === productId && item.tenure === tenure
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.product.monthlyRent * item.tenure * item.quantity
      return total + itemTotal
    }, 0)
  }

  const getDepositTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.securityDeposit * item.quantity)
    }, 0)
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getDepositTotal,
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    }}>
      {children}
    </CartContext.Provider>
  )
}