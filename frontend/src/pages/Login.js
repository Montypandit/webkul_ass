"use client"

import React, { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import AuthContext from "../context/AuthContext"
import { Eye, EyeOff } from "lucide-react"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { loginUser } = useContext(AuthContext)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("") // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await loginUser(formData.email, formData.password)
      navigate("/allposts") // Redirect to home page after successful login
    } catch (error) {
      console.error("Login error:", error.response.data)
      setError(
        error.response?.data?.detail || 
        "Invalid credentials. Please check your email and password."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-blue-200">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to your account to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition 
              ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-3">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline font-medium">
              Register here
            </a>
          </p>

          {/* Forgot Password Link */}
          <p className="text-center text-sm text-gray-500">
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login 
//" "}
//           <a href="#" className="text-blue-600 hover:underline">
//             Sign up
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
