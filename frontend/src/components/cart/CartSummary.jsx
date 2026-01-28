import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CartSummary = () => {
  const { cartItems, getCartTotal, getDepositTotal, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-bold text-xl mb-6">Order Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Items:</span>
          <span className="font-medium">{totalItems}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Rental Amount:</span>
          <span className="font-medium">₹{getCartTotal()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Security Deposit:</span>
          <span className="font-medium">₹{getDepositTotal()}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Payable:</span>
            <span className="text-primary-600">
              ₹{getCartTotal() + getDepositTotal()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            *Security deposit will be refunded upon return
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
          className={`w-full btn-primary ${cartItems.length === 0 && 'opacity-50 cursor-not-allowed'}`}
        >
          {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
        </button>
        
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="w-full btn-outline"
          >
            Clear Cart
          </button>
        )}
        
        <button
          onClick={() => navigate('/catalog')}
          className="w-full text-center text-primary-600 hover:text-primary-800 font-medium"
        >
          Continue Shopping
        </button>
      </div>

      {/* Benefits */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="font-semibold mb-3">Benefits of Renting with Us:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
            Free delivery and installation
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
            Flexible tenure options
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
            24/7 maintenance support
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
            Easy returns and relocation
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CartSummary