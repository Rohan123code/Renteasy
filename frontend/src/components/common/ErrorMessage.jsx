import { FiAlertCircle } from 'react-icons/fi'

const ErrorMessage = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <FiAlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage