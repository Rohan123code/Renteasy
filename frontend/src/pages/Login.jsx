import LoginForm from '../components/forms/LoginForm'

const Login = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}

export default Login