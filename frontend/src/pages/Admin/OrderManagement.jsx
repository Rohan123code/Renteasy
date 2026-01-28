import { useState, useEffect } from 'react'
import { FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // In a real app, you would fetch from your API
      // const response = await fetch('/api/admin/orders')
      // const data = await response.json()
      
      // Mock data for now
      setTimeout(() => {
        setOrders([
          {
            _id: '1',
            user: { name: 'John Doe', email: 'john@example.com' },
            products: [
              { product: { name: 'Queen Size Bed' }, quantity: 1, tenure: 6 },
            ],
            status: 'active',
            totalAmount: 4500,
            deliveryDate: '2024-01-15',
            createdAt: '2024-01-10',
          },
          {
            _id: '2',
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            products: [
              { product: { name: 'Sofa Set' }, quantity: 1, tenure: 12 },
            ],
            status: 'pending',
            totalAmount: 8500,
            deliveryDate: '2024-01-20',
            createdAt: '2024-01-12',
          },
          // Add more mock orders as needed
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // In a real app, you would make an API call
      // await fetch(`/api/admin/orders/${orderId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // })
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ))
      
      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    }
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
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium">#{order._id}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-sm text-gray-600">{order.user.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      {order.products.map((item, index) => (
                        <div key={index}>
                          {item.quantity} × {item.product.name} ({item.tenure} months)
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">₹{order.totalAmount}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'active' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'active')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Confirm Order"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Cancel Order"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {order.status === 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Mark as Delivered"
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiEye className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here once customers place them</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-bold mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Order ID</div>
                      <div className="font-medium">#{selectedOrder._id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Order Date</div>
                      <div className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedOrder.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                      <div className="font-medium">₹{selectedOrder.totalAmount}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-bold mb-3">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">{selectedOrder.user.name}</div>
                    <div className="text-gray-600">{selectedOrder.user.email}</div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-bold mb-3">Products</h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity} | Tenure: {item.tenure} months
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{item.product.monthlyRent * item.tenure * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h3 className="font-bold mb-3">Delivery Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium mb-1">Delivery Date</div>
                    <div>{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-outline"
                >
                  Close
                </button>
                <button className="btn-primary">
                  Update Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement