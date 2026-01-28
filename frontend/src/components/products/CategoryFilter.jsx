import { useState, useEffect } from 'react'
import { FiFilter } from 'react-icons/fi'
import { productService } from '../../services/productService'

const CategoryFilter = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories()
      setCategories(data.categories || [])
      setSubcategories(data.subcategories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    
    // Reset subcategory if category changes
    if (key === 'category') {
      newFilters.subcategory = ''
    }
    
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      minPrice: '',
      maxPrice: '',
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  if (loading) {
    return <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filter Products</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-800"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            value={filters.subcategory}
            onChange={(e) => handleFilterChange('subcategory', e.target.value)}
            className="input-field"
            disabled={!filters.category}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat.charAt(0).toUpperCase() + subcat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Price (₹)
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="0"
            className="input-field"
            min="0"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Price (₹)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="10000"
            className="input-field"
            min="0"
          />
        </div>
      </div>
    </div>
  )
}

export default CategoryFilter