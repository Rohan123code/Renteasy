import api from './api'

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params })
    return response.data
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/products/categories')
    return response.data
  },

  // Admin product management
  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData)
    return response.data
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData)
    return response.data
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`)
    return response.data
  },

  // Get all products for admin
  getAllProducts: async () => {
    const response = await api.get('/admin/products')
    return response.data
  },
}