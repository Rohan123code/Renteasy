import { createContext, useState, useContext, useEffect } from 'react'
import { toast } from 'react-toastify'
import { authService } from '../services/authService'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('token', data.token)
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const data = await authService.register(userData)
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('token', data.token)
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    toast.info('Logged out successfully')
  }

  const updateProfile = async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData)
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('token', data.token)
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
      return { success: false, error: error.message }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}