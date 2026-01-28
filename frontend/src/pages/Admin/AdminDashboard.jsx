import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiPackage, FiDollarSign, FiAlertTriangle, FiTrendingUp, FiShoppingBag, FiCheckCircle, FiClock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../services/api'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeOrders: 0,
    pendingMaintenance: 0,
    revenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats from API
      const statsResponse = await api.get('/admin/stats')
      setStats(statsResponse.data.stats || {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        activeOrders: 0,
        pendingMaintenance: 0,
        revenue: 0,
      })

      // Fetch recent orders
      try {
        const ordersResponse = await api.get('/admin/orders?limit=5')
        setRecentOrders(ordersResponse.data.slice(0, 5).map(order => ({
          id: order._id.slice(-6).toUpperCase(),
          user: order.user?.name || 'Unknown User',
          amount: order.totalAmount,
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString()
        })))
      } catch (orderError) {
        console.error('Failed to fetch orders:', orderError)
        setRecentOrders([])
      }

      // Fetch recent products
      try {
        const productsResponse = await api.get('/admin/products?limit=5')
        setRecentProducts(productsResponse.data.slice(0, 5))
      } catch (productError) {
        console.error('Failed to fetch products:', productError)
        setRecentProducts([])
      }

      // Generate chart data (monthly revenue for last 6 months)
      const monthlyData = [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Apr', revenue: 61000 },
        { month: 'May', revenue: 55000 },
        { month: 'Jun', revenue: 72000 },
      ]
      setChartData(monthlyData)
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      
      // If unauthorized (401), redirect to login
      if (error.response?.status === 401) {
        toast.error('Please login as admin')
        window.location.href = '/login'
        return
      }
      
      // If not admin (403), redirect to home
      if (error.response?.status === 403) {
        toast.error('Admin access required')
        window.location.href = '/'
        return
      }
      
      toast.error('Failed to load dashboard data')
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <FiClock className="w-4 h-4 text-yellow-500" />
      case 'delivered':
        return <FiPackage className="w-4 h-4 text-blue-500" />
      default:
        return <FiShoppingBag className="w-4 h-4 text-gray-500" />
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
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-blue-500',
      change: '+12%',
      description: 'Registered users'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'bg-green-500',
      change: '+5%',
      description: 'Available products'
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      change: '+8%',
      description: 'Currently active rentals'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'bg-orange-500',
      change: '+15%',
      description: 'All time orders'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-indigo-500',
      change: '+18%',
      description: 'Total revenue generated'
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to RentEase Admin Panel</p>
        <div className="flex items-center space-x-4 mt-2">
          <button
            onClick={fetchDashboardData}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Refresh Data
          </button>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{stat.title}</div>
            <div className="text-xs text-gray-500">{stat.description}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders & Revenue Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Revenue Overview</h2>
              <span className="text-sm text-gray-600">Last 6 months</span>
            </div>
            
            <div className="h-64">
              <div className="flex items-end h-48 space-x-2">
                {chartData.map((item, index) => {
                  const height = (item.revenue / 80000) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative">
                        <div 
                          className="w-full bg-primary-600 rounded-t-lg transition-all duration-300"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium">
                            ₹{(item.revenue / 1000).toFixed(0)}k
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">{item.month}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between text-sm">
                <div className="text-gray-600">Total Revenue (6 months):</div>
                <div className="font-bold text-lg">
                  ₹{chartData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link to="/admin/orders" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All Orders →
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <FiShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
                <p className="text-gray-500">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm">#{order.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{order.user}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold">₹{order.amount}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">{order.date}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Quick Actions & Recent Products */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/admin/products/create"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                  <FiPackage className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="font-medium">Add New Product</div>
                  <div className="text-sm text-gray-600">Create a new rental product</div>
                </div>
              </Link>
              
              <Link
                to="/admin/products"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Manage Products</div>
                  <div className="text-sm text-gray-600">View and edit products</div>
                </div>
              </Link>
              
              <Link
                to="/admin/orders"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                  <FiShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Manage Orders</div>
                  <div className="text-sm text-gray-600">Process and track orders</div>
                </div>
              </Link>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                    <FiUsers className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">Manage Users</div>
                    <div className="text-sm text-gray-600">
                      {stats.totalUsers} registered users
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Products</h2>
              <Link to="/admin/products" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All →
              </Link>
            </div>
            
            {recentProducts.length === 0 ? (
              <div className="text-center py-4">
                <FiPackage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No products added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProducts.slice(0, 3).map((product) => (
                  <div key={product._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/40x40'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm line-clamp-1">{product.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          ₹{product.monthlyRent}/month
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.availability 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.availability ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Link
              to="/admin/products/create"
              className="w-full mt-6 btn-primary flex items-center justify-center space-x-2"
            >
              <FiPackage className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">API Server</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Database</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Storage</span>
                </div>
                <span className="text-sm text-gray-600">85% used</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Active Sessions</span>
                </div>
                <span className="text-sm text-gray-600">{Math.floor(Math.random() * 50) + 20}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Last check: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard