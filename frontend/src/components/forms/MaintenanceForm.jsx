import { useState } from 'react'
import { toast } from 'react-toastify'
import { FiAlertTriangle, FiFileText } from 'react-icons/fi'

const MaintenanceForm = ({ orderId, productId, onSubmit }) => {
  const [formData, setFormData] = useState({
    issueType: 'repair',
    description: '',
    priority: 'medium',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      toast.error('Please describe the issue')
      return
    }
    
    setLoading(true)
    
    try {
      const maintenanceData = {
        orderId,
        productId,
        ...formData,
      }
      
      await onSubmit(maintenanceData)
      toast.success('Maintenance request submitted successfully!')
      
      // Reset form
      setFormData({
        issueType: 'repair',
        description: '',
        priority: 'medium',
      })
    } catch (error) {
      toast.error(error.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
        <h3 className="text-lg font-bold">Request Maintenance</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Type
          </label>
          <select
            name="issueType"
            value={formData.issueType}
            onChange={handleChange}
            className="input-field"
          >
            <option value="repair">Repair Needed</option>
            <option value="replacement">Replacement Request</option>
            <option value="technical">Technical Support</option>
            <option value="other">Other Issue</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
              { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
              { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
              { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer ${formData.priority === option.value ? option.color : 'bg-gray-100 text-gray-600'} rounded-lg p-3 text-center`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={option.value}
                  checked={formData.priority === option.value}
                  onChange={handleChange}
                  className="hidden"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FiFileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="pl-10 input-field"
              placeholder="Please describe the issue in detail..."
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Be specific about the problem for faster resolution
          </p>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            name="additionalInstructions"
            rows="2"
            className="input-field"
            placeholder="Any special instructions for the technician..."
          />
        </div>

        {/* Contact Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Contact Method
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contactMethod"
                value="phone"
                defaultChecked
                className="h-4 w-4 text-primary-600"
              />
              <span className="ml-2 text-gray-600">Phone Call</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contactMethod"
                value="whatsapp"
                className="h-4 w-4 text-primary-600"
              />
              <span className="ml-2 text-gray-600">WhatsApp</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contactMethod"
                value="email"
                className="h-4 w-4 text-primary-600"
              />
              <span className="ml-2 text-gray-600">Email</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Submitting Request...
            </div>
          ) : (
            'Submit Maintenance Request'
          )}
        </button>
      </form>

      {/* Response Time Info */}
      <div className="mt-6 pt-6 border-t">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Response Time</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Urgent issues: Within 24 hours</li>
            <li>• High priority: Within 48 hours</li>
            <li>• Medium priority: Within 3-5 business days</li>
            <li>• Low priority: Within 7 business days</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceForm