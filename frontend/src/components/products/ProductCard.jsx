import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiCheck } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { toast } from 'react-toastify'

const ProductCard = ({ product }) => {
  const [selectedTenure, setSelectedTenure] = useState(3)
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart, cartItems } = useCart()

  const isInCart = cartItems.some(
    item => item.product._id === product._id && item.tenure === selectedTenure
  )

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart(product, selectedTenure)
    toast.success('Added to cart!')
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      {/* Product Image */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        <img
          src={product.images[0] || 'https://via.placeholder.com/300x200?text=Product+Image'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
        {!product.availability && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Rental Info */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Monthly Rent:</span>
            <span className="font-bold text-xl text-primary-600">
              ₹{product.monthlyRent}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Security Deposit:</span>
            <span className="font-medium">₹{product.securityDeposit}</span>
          </div>
        </div>

        {/* Tenure Options */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tenure (months):
          </label>
          <div className="flex space-x-2">
            {product.tenureOptions.map((tenure) => (
              <button
                key={tenure}
                onClick={() => setSelectedTenure(tenure)}
                className={`flex-1 py-2 text-sm rounded ${
                  selectedTenure === tenure
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tenure} months
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 btn-outline text-center"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={!product.availability || isInCart || isAdding}
            className={`flex-1 flex items-center justify-center space-x-2 ${
              isInCart
                ? 'bg-green-600 text-white'
                : 'btn-primary'
            } ${(!product.availability || isAdding) && 'opacity-50 cursor-not-allowed'}`}
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isInCart ? (
              <>
                <FiCheck className="w-5 h-5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard