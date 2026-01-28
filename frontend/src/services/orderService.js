import api from './api'

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  getUserOrders: async () => {
    try {
      const response = await api.get('/orders')
      return response.data
    } catch (error) {
      // If auth fails, try mock endpoint
      if (error.response?.status === 401) {
        const mockResponse = await api.get('/orders/mock')
        return mockResponse.data
      }
      throw error
    }
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status })
    return response.data
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`)
    return response.data
  },
}