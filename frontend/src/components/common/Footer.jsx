import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-white text-primary-600 p-2 rounded-lg">
                <span className="font-bold text-xl">RE</span>
              </div>
              <span className="text-2xl font-bold">RentEase</span>
            </Link>
            <p className="text-gray-300 mb-6">
              Affordable furniture and appliance rentals for students and professionals.
              Flexible plans, convenient delivery, and excellent service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-300 hover:text-white">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog?category=furniture" className="text-gray-300 hover:text-white">
                  Furniture
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=appliance" className="text-gray-300 hover:text-white">
                  Appliances
                </Link>
              </li>
              <li>
                <Link to="/catalog?subcategory=bed" className="text-gray-300 hover:text-white">
                  Beds & Mattresses
                </Link>
              </li>
              <li>
                <Link to="/catalog?subcategory=sofa" className="text-gray-300 hover:text-white">
                  Sofas & Chairs
                </Link>
              </li>
              <li>
                <Link to="/catalog?subcategory=fridge" className="text-gray-300 hover:text-white">
                  Refrigerators
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-300">
                <FiMapPin className="w-5 h-5 flex-shrink-0" />
                <span>123 Rental Street, City, State 12345</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FiPhone className="w-5 h-5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FiMail className="w-5 h-5 flex-shrink-0" />
                <span>support@rentease.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} RentEase. All rights reserved.</p>
          <p className="mt-2 text-sm">Flexible furniture and appliance rentals for urban living</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer