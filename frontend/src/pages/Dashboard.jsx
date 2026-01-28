import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiSettings, FiUser } from 'react-icons/fi'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { orderService } from '../services/orderService'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const { user } = useAuth()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getUserOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-600" />
      case 'delivered':
        return <FiPackage className="w-5 h-5 text-blue-600" />
      default:
        return <FiPackage className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'delivered':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') return order.status === 'active'
    if (activeTab === 'pending') return order.status === 'pending'
    if (activeTab === 'completed') return ['delivered', 'completed'].includes(order.status)
    if (activeTab === 'cancelled') return order.status === 'cancelled'
    return true
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FiUser className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="font-bold">{user?.name}</div>
                <div className="text-sm text-gray-600">{user?.email}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg bg-primary-50 text-primary-700">
                <FiPackage className="w-5 h-5" />
                <span className="font-medium">My Rentals</span>
              </Link>
              <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 w-full text-left">
                <FiSettings className="w-5 h-5" />
                <span className="font-medium">Account Settings</span>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold mb-4">Rental Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Active Rentals</div>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'active').length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Rentals</div>
                <div className="text-2xl font-bold">{orders.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b">
              {[
                { id: 'active', label: 'Active Rentals' },
                { id: 'pending', label: 'Pending' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 text-center font-medium ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'active' 
                    ? "You don't have any active rentals"
                    : `You don't have any ${activeTab} orders`}
                </p>
                <Link to="/catalog" className="btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ₹{order.totalAmount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-3">Items:</h4>
                    <div className="space-y-3">
                      {order.products.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.product?.images?.[0] || 'https://via.placeholder.com/50x50'}
                              alt={item.product?.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{item.product?.name}</div>
                              <div className="text-sm text-gray-600">
                                {item.quantity} × {item.tenure} months
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ₹{item.monthlyRent * item.tenure * item.quantity}
                            </div>
                            <div className="text-sm text-gray-600">
                              Deposit: ₹{item.securityDeposit * item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Delivery Date</div>
                        <div className="font-medium">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Delivery Address</div>
                        <div className="font-medium">
                          {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                        </div>
                      </div>
                      <div className="text-right">
                        {order.status === 'active' && (
                          <button className="btn-primary">
                            Request Maintenance
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to cancel this order?')) {
                                try {
                                  await orderService.cancelOrder(order._id)
                                  toast.success('Order cancelled successfully')
                                  fetchOrders()
                                } catch (error) {
                                  toast.error('Failed to cancel order')
                                }
                              }
                            }}
                            className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard