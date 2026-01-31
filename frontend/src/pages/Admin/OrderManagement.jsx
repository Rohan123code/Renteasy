import { useState, useEffect } from 'react'
import { FiEye, FiCheckCircle, FiXCircle, FiPackage, FiUser, FiCalendar, FiDollarSign, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../services/api'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/orders')
      setOrders(response.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      
      if (error.response?.status === 401) {
        toast.error('Please login as admin')
        window.location.href = '/login'
        return
      }
      
      if (error.response?.status === 403) {
        toast.error('Admin access required')
        window.location.href = '/'
        return
      }
      
      toast.error('Failed to load orders')
      setOrders([])
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      
      // Make API call to update order status
      const response = await api.put(`/admin/orders/${orderId}/status`, { 
        status: newStatus 
      })
      
      // Update the orders list with the updated order
      const updatedOrder = response.data.order
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      )
      
      // If the modal is open for this order, update it too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updatedOrder)
      }
      
      toast.success(response.data.message || `Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update order status:', error)
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
        return
      }
      
      if (error.response?.status === 403) {
        toast.error('Admin access required')
        return
      }
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid status value')
        return
      }
      
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleConfirmOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to confirm this order?')) {
      await handleStatusUpdate(orderId, 'confirmed')
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await handleStatusUpdate(orderId, 'cancelled')
    }
  }

  const handleDeliverOrder = async (orderId) => {
    if (window.confirm('Mark this order as delivered?')) {
      await handleStatusUpdate(orderId, 'delivered')
    }
  }

  const handleMarkAsActive = async (orderId) => {
    if (window.confirm('Mark this order as active?')) {
      await handleStatusUpdate(orderId, 'active')
    }
  }

  const handleCompleteOrder = async (orderId) => {
    if (window.confirm('Mark this order as completed?')) {
      await handleStatusUpdate(orderId, 'completed')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'delivered':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-indigo-100 text-indigo-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplayText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'delivered': 'Delivered',
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    return statusMap[status] || status
  }

  const getAvailableActions = (status) => {
    const actions = {
      'pending': ['confirm', 'cancel'],
      'confirmed': ['deliver', 'cancel'],
      'delivered': ['activate', 'cancel'],
      'active': ['complete', 'cancel'],
      'completed': ['cancel'],
      'cancelled': []
    }
    return actions[status] || []
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status !== filter) {
      return false
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        order.products?.some(p => 
          p.product?.name?.toLowerCase().includes(searchLower)
        )
      )
    }
    
    return true
  })

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    active: orders.filter(o => o.status === 'active').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => ['confirmed', 'delivered', 'active', 'completed'].includes(o.status))
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  }

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-gray-600">Manage and track all customer orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 disabled:opacity-50"
            disabled={loading}
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'delivered', 'active', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== 'all' && (
                      <span className="ml-1">
                        ({orders.filter(o => o.status === status).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, customer, or product..."
                className="w-full input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filter !== 'all' ? 'No matching orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Orders will appear here once customers place them'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Products</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Delivery Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isUpdating = updatingOrderId === order._id
                  const availableActions = getAvailableActions(order.status)
                  
                  return (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-mono text-sm font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{order.user?.name || 'Unknown User'}</div>
                            <div className="text-sm text-gray-600">{order.user?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm space-y-1">
                          {order.products?.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded overflow-hidden">
                                <img
                                  src={item.product?.images?.[0] || 'https://via.placeholder.com/24x24'}
                                  alt={item.product?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="truncate max-w-[150px]">
                                {item.quantity} × {item.product?.name || 'Unknown Product'}
                              </span>
                            </div>
                          ))}
                          {order.products?.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{order.products.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold">{formatCurrency(order.totalAmount)}</div>
                        <div className="text-xs text-gray-500">
                          Deposit: {formatCurrency(order.totalDeposit || 0)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusDisplayText(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            {formatDate(order.deliveryDate)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="View Details"
                            disabled={isUpdating}
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          
                          {/* Dynamic action buttons based on status */}
                          {availableActions.includes('confirm') && (
                            <button
                              onClick={() => handleConfirmOrder(order._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Confirm Order"
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <LoadingSpinner size="small" />
                              ) : (
                                <FiCheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          {availableActions.includes('deliver') && (
                            <button
                              onClick={() => handleDeliverOrder(order._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as Delivered"
                              disabled={isUpdating}
                            >
                              Deliver
                            </button>
                          )}
                          
                          {availableActions.includes('activate') && (
                            <button
                              onClick={() => handleMarkAsActive(order._id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as Active"
                              disabled={isUpdating}
                            >
                              Activate
                            </button>
                          )}
                          
                          {availableActions.includes('complete') && (
                            <button
                              onClick={() => handleCompleteOrder(order._id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as Completed"
                              disabled={isUpdating}
                            >
                              Complete
                            </button>
                          )}
                          
                          {availableActions.includes('cancel') && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Cancel Order"
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <LoadingSpinner size="small" />
                              ) : (
                                <FiXCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-gray-600">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
                  disabled={updatingOrderId === selectedOrder._id}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Order Date</div>
                    <div className="font-medium">{formatDate(selectedOrder.createdAt)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusDisplayText(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Delivery Date</div>
                    <div className="font-medium">
                      {formatDate(selectedOrder.deliveryDate)}
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <FiUser className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Name</div>
                        <div className="font-medium">{selectedOrder.user?.name || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{selectedOrder.user?.email || 'No email'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedOrder.deliveryAddress && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                      <FiPackage className="w-5 h-5 mr-2" />
                      Delivery Address
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium">{selectedOrder.deliveryAddress.street}</div>
                      <div>
                        {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.products?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.product?.images?.[0] || 'https://via.placeholder.com/60x60'}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity} | Tenure: {item.tenure} months
                            </div>
                            <div className="text-sm text-gray-600">
                              Monthly: {formatCurrency(item.monthlyRent)} | Deposit: {formatCurrency(item.securityDeposit)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(item.monthlyRent * item.tenure * item.quantity)}</div>
                          <div className="text-sm text-gray-600">Total rent</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="border-t pt-6">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <FiDollarSign className="w-5 h-5 mr-2" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.totalDeposit || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Payable:</span>
                      <span className="text-primary-600">
                        {formatCurrency((selectedOrder.totalAmount || 0) + (selectedOrder.totalDeposit || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updatingOrderId === selectedOrder._id}
                >
                  Close
                </button>
                
                {/* Action buttons in modal */}
                <div className="flex space-x-2">
                  {getAvailableActions(selectedOrder.status).map((action) => {
                    const buttons = {
                      'confirm': (
                        <button
                          key="confirm"
                          onClick={() => handleConfirmOrder(selectedOrder._id)}
                          className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          {updatingOrderId === selectedOrder._id ? 'Processing...' : 'Confirm Order'}
                        </button>
                      ),
                      'deliver': (
                        <button
                          key="deliver"
                          onClick={() => handleDeliverOrder(selectedOrder._id)}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          {updatingOrderId === selectedOrder._id ? 'Processing...' : 'Mark as Delivered'}
                        </button>
                      ),
                      'activate': (
                        <button
                          key="activate"
                          onClick={() => handleMarkAsActive(selectedOrder._id)}
                          className="btn-indigo disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          {updatingOrderId === selectedOrder._id ? 'Processing...' : 'Mark as Active'}
                        </button>
                      ),
                      'complete': (
                        <button
                          key="complete"
                          onClick={() => handleCompleteOrder(selectedOrder._id)}
                          className="btn-gray disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          {updatingOrderId === selectedOrder._id ? 'Processing...' : 'Mark as Completed'}
                        </button>
                      ),
                      'cancel': (
                        <button
                          key="cancel"
                          onClick={() => handleCancelOrder(selectedOrder._id)}
                          className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingOrderId === selectedOrder._id}
                        >
                          Cancel Order
                        </button>
                      )
                    }
                    return buttons[action]
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement