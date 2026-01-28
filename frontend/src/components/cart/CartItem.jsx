import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart()
  const [quantity, setQuantity] = useState(item.quantity)

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
      updateQuantity(item.product._id, item.tenure, newQuantity)
    }
  }

  const totalRent = item.product.monthlyRent * item.tenure * item.quantity
  const totalDeposit = item.product.securityDeposit * item.quantity

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.product.images[0] || 'https://via.placeholder.com/100x100?text=Product'}
            alt={item.product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex-grow">
          <div className="flex justify-between">
            <div>
              <Link to={`/product/${item.product._id}`} className="font-semibold text-lg hover:text-primary-600">
                {item.product.name}
              </Link>
              <p className="text-gray-600 text-sm">{item.product.category}</p>
            </div>
            <button
              onClick={() => removeFromCart(item.product._id, item.tenure)}
              className="text-red-500 hover:text-red-700"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Quantity Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenure</label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                {item.tenure} months
              </div>
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
              <div className="text-lg font-semibold text-primary-600">
                ₹{item.product.monthlyRent}
              </div>
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
              <div className="font-medium">
                ₹{item.product.securityDeposit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Item Total: {item.quantity} × (₹{item.product.monthlyRent} × {item.tenure} months)
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">
            ₹{totalRent} (Rent)
          </div>
          <div className="text-gray-600">
            + ₹{totalDeposit} (Deposit)
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem