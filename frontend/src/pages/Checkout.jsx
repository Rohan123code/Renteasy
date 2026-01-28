import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiMapPin, FiCalendar, FiCreditCard, FiCheckCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { orderService } from '../services/orderService'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Checkout = () => {
  const { cartItems, getCartTotal, getDepositTotal, clearCart } = useCart()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })

  useEffect(() => {
    // Set default delivery date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDeliveryDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    })
  }

  const validateAddress = () => {
    if (!address.street.trim()) {
      toast.error('Please enter street address')
      return false
    }
    if (!address.city.trim()) {
      toast.error('Please enter city')
      return false
    }
    if (!address.state.trim()) {
      toast.error('Please enter state')
      return false
    }
    if (!address.zipCode.trim()) {
      toast.error('Please enter zip code')
      return false
    }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      return
    }

    setLoading(true)
    
    try {
      const orderData = {
        products: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          tenure: item.tenure,
        })),
        deliveryAddress: address,
        deliveryDate,
      }

      const order = await orderService.createOrder(orderData)
      toast.success('Order placed successfully!')
      clearCart()
      setStep(3)
      
      // You would typically redirect to order confirmation page
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (error) {
      console.error('Failed to place order:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = getCartTotal() + getDepositTotal()

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart to checkout</p>
        <button
          onClick={() => navigate('/catalog')}
          className="btn-primary"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between max-w-2xl mx-auto">
          {['Delivery Address', 'Review Order', 'Confirmation'].map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${step > index + 1 ? 'bg-green-600 text-white' : 
                  step === index + 1 ? 'bg-primary-600 text-white' : 
                  'bg-gray-200 text-gray-400'}
              `}>
                {step > index + 1 ? (
                  <FiCheckCircle className="w-6 h-6" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-sm ${
                step >= index + 1 ? 'text-primary-600 font-medium' : 'text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <FiMapPin className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter your street address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter state"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>

                <div className="flex items-center mt-6">
                  <FiCalendar className="w-6 h-6 text-primary-600 mr-3" />
                  <h3 className="font-bold">Delivery Date</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Delivery is free and includes installation
                  </p>
                </div>
              </form>
              
              <div className="mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="w-full btn-primary"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <FiCreditCard className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-bold">Review Your Order</h2>
              </div>
              
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-bold mb-4">Items in Your Order</h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.product._id}-${item.tenure}`} className="border-b pb-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} × {item.tenure} months rental
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ₹{item.product.monthlyRent * item.tenure * item.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            Deposit: ₹{item.product.securityDeposit * item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Delivery Information */}
              <div className="mb-6">
                <h3 className="font-bold mb-4">Delivery Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium">{address.street}</div>
                  <div>{address.city}, {address.state} {address.zipCode}</div>
                  <div className="mt-2 text-gray-600">
                    Delivery Date: {new Date(deliveryDate).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="mt-2 text-primary-600 hover:text-primary-800 text-sm"
                >
                  Change address or date
                </button>
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Rental Amount:</span>
                    <span>₹{getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span>₹{getDepositTotal()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Payable:</span>
                    <span className="text-primary-600">₹{totalAmount}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Security deposit will be refunded within 7 business days 
                    after product return, minus any damages or outstanding dues.
                  </p>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Placing Order...</span>
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="mb-6">
                <FiCheckCircle className="w-20 h-20 text-green-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your order. Your rental has been confirmed and is being processed.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">
                  You will receive a confirmation email with order details shortly.
                  Our delivery team will contact you to schedule the delivery.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/catalog')}
                  className="btn-outline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {step !== 3 && (
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="font-bold text-lg mb-6">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.product._id}-${item.tenure}`} className="flex justify-between">
                  <div className="text-sm">
                    <div>{item.product.name}</div>
                    <div className="text-gray-500">
                      {item.quantity} × {item.tenure} months
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    ₹{item.product.monthlyRent * item.tenure * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Rental Amount:</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit:</span>
                  <span>₹{getDepositTotal()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-primary-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-3">What's Included:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                  Free delivery & installation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                  Free maintenance support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                  Easy return process
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                  Deposit refund upon return
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout