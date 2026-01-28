import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiCheck, FiTruck, FiShield, FiClock, FiStar } from 'react-icons/fi'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { useCart } from '../context/CartContext'
import { productService } from '../services/productService'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTenure, setSelectedTenure] = useState(3)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addToCart, cartItems } = useCart()

  const isInCart = cartItems.some(
    item => item.product._id === id && item.tenure === selectedTenure
  )

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const data = await productService.getProductById(id)
      setProduct(data)
      
      if (data.tenureOptions?.length > 0) {
        setSelectedTenure(data.tenureOptions[0])
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setError('Product not found or failed to load.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || !product.availability) {
      toast.error('Product is not available')
      return
    }
    
    addToCart(product, selectedTenure)
    toast.success('Added to cart!')
  }

  const handleBuyNow = () => {
    if (!product || !product.availability) {
      toast.error('Product is not available')
      return
    }
    
    addToCart(product, selectedTenure)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message={error || 'Product not found'} onRetry={fetchProduct} />
        <button
          onClick={() => navigate('/catalog')}
          className="mt-4 btn-primary"
        >
          Back to Catalog
        </button>
      </div>
    )
  }

  const totalRent = product.monthlyRent * selectedTenure

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/catalog')}
        className="mb-6 text-primary-600 hover:text-primary-800 flex items-center"
      >
        ← Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <img
              src={product.images[selectedImage] || 'https://via.placeholder.com/600x400?text=Product+Image'}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg"
            />
          </div>
          
          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto py-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Category & Availability */}
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded">
                {product.category}
              </span>
              <div className="text-right">
                {product.availability ? (
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                    In Stock
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded">
                    Out of Stock
                  </span>
                )}
                {product.stock > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {product.stock} units available
                  </div>
                )}
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">{key}</div>
                      <div className="font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-gray-500 mr-2">Monthly Rent:</span>
                <span className="text-3xl font-bold text-primary-600">
                  ₹{product.monthlyRent}
                </span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-gray-500">Security Deposit:</div>
                  <div className="font-medium">₹{product.securityDeposit}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">Refundable upon return</div>
                </div>
              </div>
            </div>

            {/* Tenure Selection */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Select Rental Tenure</h3>
              <div className="grid grid-cols-3 gap-3">
                {product.tenureOptions.map((tenure) => (
                  <button
                    key={tenure}
                    onClick={() => setSelectedTenure(tenure)}
                    className={`py-3 rounded-lg text-center ${
                      selectedTenure === tenure
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-bold">{tenure} months</div>
                    <div className="text-sm">₹{product.monthlyRent * tenure}/total</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span>Total Rent ({selectedTenure} months):</span>
                <span className="font-bold">₹{totalRent}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Security Deposit:</span>
                <span>₹{product.securityDeposit}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total Payable:</span>
                <span className="text-primary-600">
                  ₹{totalRent + product.securityDeposit}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.availability || isInCart}
                className={`flex-1 flex items-center justify-center space-x-2 ${
                  isInCart
                    ? 'bg-green-600 text-white'
                    : 'btn-primary'
                } ${!product.availability && 'opacity-50 cursor-not-allowed'}`}
              >
                {isInCart ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.availability}
                className={`flex-1 btn-primary ${
                  !product.availability && 'opacity-50 cursor-not-allowed'
                }`}
              >
                Rent Now
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <FiTruck className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <div className="font-bold">Free Delivery</div>
                <div className="text-sm text-gray-600">Within city limits</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <FiShield className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <div className="font-bold">Maintenance</div>
                <div className="text-sm text-gray-600">Free support included</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <FiClock className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <div className="font-bold">Flexible Returns</div>
                <div className="text-sm text-gray-600">Easy return process</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Details */}
      <div className="mt-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Product Details</h2>
          
          <div className="prose max-w-none">
            <p>{product.description}</p>
            
            <h3 className="font-bold text-lg mt-6 mb-3">Key Features</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>High-quality materials and construction</li>
              <li>Regular maintenance and cleaning included</li>
              <li>Flexible rental terms with easy upgrades</li>
              <li>Professional installation and setup</li>
              <li>24/7 customer support</li>
            </ul>

            <h3 className="font-bold text-lg mt-6 mb-3">Rental Terms</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Minimum rental period: 3 months</li>
              <li>Free delivery and installation</li>
              <li>Security deposit fully refundable upon return</li>
              <li>Free maintenance during rental period</li>
              <li>Easy return process with pickup service</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail