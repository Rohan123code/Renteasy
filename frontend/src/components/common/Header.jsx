import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <span className="font-bold text-xl">RE</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">RentEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">
              Home
            </Link>
            <Link to="/catalog" className="text-gray-600 hover:text-primary-600 font-medium">
              Catalog
            </Link>
            
            {isAuthenticated && (
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
                Dashboard
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative">
              <FiShoppingCart className="w-6 h-6 text-gray-600 hover:text-primary-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6 text-gray-600" />
            ) : (
              <FiMenu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">
                Home
              </Link>
              <Link to="/catalog" className="text-gray-600 hover:text-primary-600 font-medium">
                Catalog
              </Link>
              
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium">
                  Admin
                </Link>
              )}

              <Link to="/cart" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 font-medium">
                <FiShoppingCart className="w-5 h-5" />
                <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiUser className="w-5 h-5" />
                    <span>{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header