// import React, { useState } from 'react';
// import axiosInstance from '../config/apiConfig';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: '',       // ✅ Added
//     full_name: '',
//     email: '',
//     password: '',
//     dob: '',            // ✅ Changed from date_of_birth → dob
//   });
//   const [profile_image, setProfileImage] = useState(null); // ✅ Changed name

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleFile = (e) => setProfileImage(e.target.files[0]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
//     for (const key in formData) data.append(key, formData[key]);
//     if (profile_image) data.append('profile_image', profile_image); // ✅ updated key

//     try {
//       await axiosInstance.post('/register/', data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       alert('Registration successful! You can now login.');
//     } catch (error) {
//       console.log(error.response?.data);
//       alert('Registration failed!');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
//       <h2>Register</h2>
//       <input
//         type="text"
//         name="username"
//         placeholder="Username"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="text"
//         name="full_name"
//         placeholder="Full Name"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="date"
//         name="dob"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="file"
//         name="profile_image"
//         onChange={handleFile}
//       />
//       <button type="submit">Register</button>
//     </form>
//   );
// };

// export default Register;



"use client"

import React, { useState } from "react"
import axiosInstance from "../config/apiConfig"
import { Eye, EyeOff, Upload } from "lucide-react"

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    date_of_birth: "",
  })
  const [profile_picture, setProfilePicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmError, setConfirmError] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // client-side password confirmation check
    if (formData.password !== formData.confirm_password) {
      setConfirmError("Passwords do not match")
      return
    }
    setConfirmError("")
  const data = new FormData()
  // do not send confirm_password to backend
  for (const key in formData) if (key !== "confirm_password") data.append(key, formData[key])
    if (profile_picture) data.append("profile_picture", profile_picture)

    try {
      setLoading(true)
      setErrorMessage("") // Clear any previous errors
      await axiosInstance.post("/register/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      alert("Registration successful! You can now login.")
      setFormData({ full_name: "", email: "", password: "", confirm_password: "", date_of_birth: "" })
      setProfilePicture(null)
      setPreviewUrl(null)
    } catch (error) {
      if (error.response?.data?.email?.[0]) {
        setErrorMessage(error.response.data.email[0])
      } else {
        setErrorMessage("Registration failed! It is already exist.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-blue-200">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">SignUp Page</h2>
        <p className="text-center text-gray-500 mb-6">
          Join our network and connect with others
        </p>

        {errorMessage && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Profile Picture
            </label>
            <div
              onClick={() => document.getElementById("profileInput").click()}
              className="w-28 h-28 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover"
                />
              ) : (
                <Upload className="text-blue-500 w-6 h-6" />
              )}
            </div>
            <input
              id="profileInput"
              type="file"
              name="profile_picture"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
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

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
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
              {/* Recheck password  or confirm password */}

          {/* Confirm Password */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
            </div>
            {confirmError && (
              <p className="text-sm text-red-600 mt-2">{confirmError}</p>
            )}
          </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition 
              ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-3">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
