import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/products/ProductGrid'
import CategoryFilter from '../components/products/CategoryFilter'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { productService } from '../services/productService'

const Catalog = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    fetchProducts()
  }, [category, subcategory, search, currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        category,
        subcategory,
        search,
        page: currentPage,
        limit: 12,
      }
      
      const data = await productService.getProducts(params)
      setProducts(data.products || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filters) => {
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.subcategory) params.subcategory = filters.subcategory
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    
    setSearchParams(params)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const searchValue = e.target.search.value
    const params = new URLSearchParams(searchParams)
    
    if (searchValue) {
      params.set('search', searchValue)
    } else {
      params.delete('search')
    }
    
    setSearchParams(params)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search for furniture or appliances..."
            className="flex-grow input-field"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <CategoryFilter onFilterChange={handleFilterChange} />

      {/* Active Filters */}
      {(category || subcategory || search) && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {category && (
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                Category: {category}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.delete('category')
                    setSearchParams(params)
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
            {subcategory && (
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                Subcategory: {subcategory}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.delete('subcategory')
                    setSearchParams(params)
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
            {search && (
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                Search: {search}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.delete('search')
                    setSearchParams(params)
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      {error ? (
        <ErrorMessage message={error} onRetry={fetchProducts} />
      ) : (
        <>
          <ProductGrid products={products} loading={loading} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => {
                    // Add ellipsis for gaps
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <span key={`ellipsis-${page}`} className="px-3 py-2">
                          ...
                        </span>
                      )
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Catalog