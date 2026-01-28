import { Link } from 'react-router-dom'
import { FiTruck, FiShield, FiClock, FiDollarSign } from 'react-icons/fi'
import ProductGrid from '../components/products/ProductGrid'
import { productService } from '../services/productService'
import { useEffect, useState } from 'react'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts({ limit: 8 })
      setFeaturedProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Rent Furniture & Appliances
              <span className="block text-primary-200">Without the Commitment</span>
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Perfect for students and professionals. Flexible monthly rentals, free delivery, 
              and premium quality products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
                Browse Catalog
              </Link>
              <Link to="/register" className="btn-outline border-white text-white hover:bg-white/10">
                Start Renting
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">Why Choose RentEase?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Affordable</h3>
              <p className="text-gray-600">Pay monthly without huge upfront costs</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Free Delivery</h3>
              <p className="text-gray-600">Free delivery and installation</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Flexible Plans</h3>
              <p className="text-gray-600">Choose from 3, 6, or 12 month plans</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Maintenance Included</h3>
              <p className="text-gray-600">Free maintenance and support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/catalog" className="text-primary-600 hover:text-primary-800 font-medium">
              View All →
            </Link>
          </div>
          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Browse & Select</h3>
              <p className="text-gray-600">Choose from our wide range of furniture and appliances</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Schedule Delivery</h3>
              <p className="text-gray-600">Pick your delivery date and provide address details</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Enjoy & Return</h3>
              <p className="text-gray-600">Use the product and return when done. It's that simple!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Simplify Your Living?</h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who choose convenience over commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
              Get Started Free
            </Link>
            <Link to="/catalog" className="btn-outline border-white text-white hover:bg-white/10">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home