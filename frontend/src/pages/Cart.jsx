import { Link } from 'react-router-dom'
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import { useAuth } from '../context/AuthContext'

const Cart = () => {
  const { cartItems, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-gray-400 mb-6">
            <FiShoppingBag className="w-24 h-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalog" className="btn-primary">
              Browse Products
            </Link>
            <Link to="/" className="btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
              <button
                onClick={clearCart}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800"
              >
                <FiTrash2 className="w-5 h-5" />
                <span>Clear Cart</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={`${item.product._id}-${item.tenure}`} item={item} />
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="flex justify-between">
            <Link to="/catalog" className="btn-outline">
              ← Continue Shopping
            </Link>
            <Link to="/checkout" className="btn-primary">
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}

export default Cart