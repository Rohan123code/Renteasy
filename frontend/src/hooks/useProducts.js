import { useState, useEffect } from 'react'
import { productService } from '../services/productService'

export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = async (customParams = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const mergedParams = { ...params, ...customParams }
      const data = await productService.getProducts(mergedParams)
      
      setProducts(data.products || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    totalPages,
    refetch: fetchProducts,
  }
}