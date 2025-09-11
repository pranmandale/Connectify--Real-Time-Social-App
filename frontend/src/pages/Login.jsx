"use client"
import { Formik, Field, Form, ErrorMessage } from "formik"
import LoginSchema from "../validations/loginValidation.js"
import { useDispatch } from "react-redux"
import { toast } from "react-hot-toast"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { login } from "../featurres/users/authSlice.jsx"
import { Link, useNavigate } from "react-router-dom"

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const initialValues = { identifier: "", password: "" }

  const handleLogin = async (values, resetForm) => {
    const payload = {
      identifier: values.identifier,
      password: values.password,
    }

    await toast.promise(dispatch(login(payload)).unwrap(), {
      loading: "Logging in...",
      success: (res) => res?.message || "Login successful",
      error: (err) => {
        console.error("Login error:", err)
        return err?.message || err?.error || "Login failed"
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm bg-opacity-95">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Connectify
          </h1>
          <p className="text-gray-600 text-sm">Connect with friends and share your moments</p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            await handleLogin(values, resetForm)
            setSubmitting(false)
          }}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col space-y-4">
              {/* Identifier */}
              <div>
                <Field
                  type="text"
                  name="identifier"
                  placeholder="Phone number, username, or email"
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                />
                <ErrorMessage name="identifier" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Facebook login */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm py-3 rounded-lg mb-4 hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
          Continue with Facebook
        </button>

        {/* Forgot Password */}
        <Link
          to="/forgot-password"
          className="block text-center text-sm text-purple-600 hover:text-purple-700 transition-colors duration-200"
        >
          Forgot password?
        </Link>
      </div>

      {/* Signup Box */}
      <div className="w-full max-w-md bg-white border border-gray-100 p-4 text-center text-sm rounded-lg shadow-lg backdrop-blur-sm bg-opacity-95 mt-4">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          onClick={() => navigate("/signup")}
          className="text-purple-600 cursor-pointer font-semibold hover:text-purple-700 transition-colors duration-200"
        >
          Sign up
        </button>
      </div>
    </div>
  )
}

export default Login