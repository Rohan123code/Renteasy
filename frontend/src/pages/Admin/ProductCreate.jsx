import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productService } from '../../services/productService';

const ProductCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'furniture',
    subcategory: 'bed',
    monthlyRent: '',
    securityDeposit: '',
    stock: 1,
    availability: true,
    tenureOptions: [3, 6, 12],
    specifications: {
      'Material': '',
      'Color': '',
      'Size': '',
      'Weight': ''
    }
  });

  const categories = {
    furniture: ['bed', 'sofa', 'table', 'dining', 'wardrobe', 'chair'],
    appliance: ['fridge', 'tv', 'washing-machine', 'ac', 'microwave', 'oven']
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('specs.')) {
      const specKey = name.replace('specs.', '');
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Create URLs for preview (in real app, you would upload to cloud storage)
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.monthlyRent || !formData.securityDeposit) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would upload images to cloud storage first
      // For now, use placeholder or existing URLs
      const imageUrls = images.map(img => img.preview);
      
      const productData = {
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        stock: parseInt(formData.stock),
        images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        // Filter out empty specifications
        specifications: Object.fromEntries(
          Object.entries(formData.specifications).filter(([_, value]) => value.trim())
        )
      };

      await productService.createProduct(productData);
      
      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Create product error:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="mb-4 text-primary-600 hover:text-primary-800 flex items-center"
        >
          ← Back to Products
        </button>
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <p className="text-gray-600">Add a new product to your rental catalog</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Describe the product in detail..."
                required
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="furniture">Furniture</option>
                  <option value="appliance">Appliance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory *
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categories[formData.category].map(sub => (
                    <option key={sub} value={sub}>
                      {sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit (₹) *
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Stock & Availability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1"
                  min="1"
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary-600 rounded"
                />
                <label htmlFor="availability" className="ml-2 text-gray-700">
                  Available for Rent
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Images & Specifications */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload images</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                </label>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Specifications
              </label>
              <div className="space-y-3">
                {Object.keys(formData.specifications).map((key) => (
                  <div key={key} className="flex items-center">
                    <label className="w-24 text-sm text-gray-600 capitalize">
                      {key}:
                    </label>
                    <input
                      type="text"
                      name={`specs.${key}`}
                      value={formData.specifications[key]}
                      onChange={handleChange}
                      className="flex-1 input-field"
                      placeholder={`Enter ${key.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tenure Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rental Tenure Options (months)
              </label>
              <div className="flex space-x-4">
                {[3, 6, 12].map((tenure) => (
                  <label key={tenure} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tenureOptions.includes(tenure)}
                      onChange={(e) => {
                        const newTenureOptions = e.target.checked
                          ? [...formData.tenureOptions, tenure]
                          : formData.tenureOptions.filter(t => t !== tenure);
                        setFormData(prev => ({
                          ...prev,
                          tenureOptions: newTenureOptions.sort((a, b) => a - b)
                        }));
                      }}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">{tenure} months</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;