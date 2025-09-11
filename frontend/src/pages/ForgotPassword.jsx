import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Formik, Field, Form, ErrorMessage } from "formik"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"
import { ResetPasswordSchema } from '../validations/resetPasswordvalidation.js'
import { OTPSchema } from "../validations/resetPasswordvalidation.js"
import { EmailSchema } from '../validations/resetPasswordvalidation.js'
import { useDispatch } from 'react-redux'
import { sendResetOTP, verifyResetOTP, resetPassword } from "../featurres/users/authSlice.jsx"

const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const timerRef = useRef(null)

  // Timer cleanup on unmount and timer changes
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [otpTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Step 1: Send OTP to email
  const handleSendOTP = useCallback(async (values, { setSubmitting, setFieldError }) => {
    const payload = { email: values.email }

    try {
      await toast.promise(
        dispatch(sendResetOTP(payload)).unwrap(),
        {
          loading: "Sending OTP...",
          success: (res) => {
            // Success actions
            setEmail(values.email)
            setStep(2)
            setOtpTimer(300) // Start 5 minute timer (300 seconds)
            return res?.message || "OTP sent successfully"
          },
          error: (err) => {
            // Handle specific field errors
            if (err?.field === 'email') {
              setFieldError('email', err?.message || 'Invalid email address')
              return false // Prevent toast error
            }
            return err?.message || err?.error || "Failed to send OTP"
          },
        }
      )
    } catch (error) {
      console.error("OTP Error:", error)
    } finally {
      setSubmitting(false)
    }
  }, [dispatch])

  // Step 2: Verify OTP
  const handleVerifyOTP = useCallback(async (values, { setSubmitting, setFieldError }) => {
    const payload = {
      email: email,
      otp: values.otp,
    }

    try {
      await toast.promise(
        dispatch(verifyResetOTP(payload)).unwrap(),
        {
          loading: "Verifying OTP...",
          success: (res) => {
            setStep(3) // Move to reset password step
            return res?.message || "OTP verified successfully"
          },
          error: (err) => {
            // Handle specific field errors
            if (err?.field === 'otp') {
              setFieldError('otp', err?.message || 'Invalid or expired OTP')
              return false // Prevent toast error
            }
            return err?.message || err?.error || "Invalid or expired OTP"
          },
        }
      )
    } catch (error) {
      console.error("Verify OTP Error:", error)
    } finally {
      setSubmitting(false)
    }
  }, [email, dispatch])

  // Step 3: Reset password
  const handleResetPassword = useCallback(async (values, { setSubmitting, setFieldError }) => {
    const payload = {
      email: email,
      password: values.password,
    }

    try {
      await toast.promise(
        dispatch(resetPassword(payload)).unwrap(),
        {
          loading: "Resetting password...",
          success: (res) => {
            // Navigate after successful reset
            setTimeout(() => navigate("/login"), 1000)
            return res?.message || "Password reset successfully!"
          },
          error: (err) => {
            // Handle specific field errors
            if (err?.field === 'password') {
              setFieldError('password', err?.message || 'Password reset failed')
              return false // Prevent toast error
            }
            return err?.message || err?.error || "Failed to reset password"
          },
        }
      )
    } catch (error) {
      console.error("Reset Password Error:", error)
    } finally {
      setSubmitting(false)
    }
  }, [email, dispatch, navigate])

  // Go back to previous step
  const handleGoBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1)
      if (step === 2) {
        setOtpTimer(0) // Clear timer when going back
      }
    }
  }, [step])

  // Format timer display (MM:SS)
  const formatTimer = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={EmailSchema}
            onSubmit={handleSendOTP}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="flex flex-col space-y-4">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className={`w-full p-3 border rounded-lg text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send OTP"}
                </button>
              </Form>
            )}
          </Formik>
        )

      case 2:
        return (
          <Formik
            initialValues={{ otp: "" }}
            validationSchema={OTPSchema}
            onSubmit={handleVerifyOTP}
            enableReinitialize={false}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ isSubmitting, errors, touched, setFieldValue }) => (
              <Form className="flex flex-col space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-purple-600 font-semibold text-sm break-all">{email}</p>
                </div>

                <div>
                  <Field name="otp">
                    {({ field }) => (
                      <input
                        {...field} // spreads name, value, onChange, onBlur
                        value={field.value ?? ""}
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        autoComplete="one-time-code"
                        className={`w-full p-3 border rounded-lg text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-center tracking-widest font-mono ${errors.otp && touched.otp ? 'border-red-300' : 'border-gray-300'
                          }`}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                          setFieldValue('otp', value)
                        }}
                      />
                    )}
                  </Field>

                  <ErrorMessage name="otp" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpTimer === 0}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : "Verify OTP"}
                </button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-gray-500 text-sm">
                      Code expires in <span className="font-mono font-semibold text-purple-600">{formatTimer(otpTimer)}</span>
                    </p>
                  ) : (
                    <p className="text-red-500 text-sm font-medium">
                      OTP has expired. Please go back and request a new one.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGoBack}
                  className="text-purple-600 text-sm hover:text-purple-700 transition-colors duration-200 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded px-2 py-1"
                >
                  ← Go back and resend OTP
                </button>
              </Form>
            )}
          </Formik>
        )

      case 3:
        return (
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleResetPassword}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="flex flex-col space-y-4">
                <div>
                  <div className="relative">
                    <Field name="password">
                      {({ field }) => (
                        <input
                          {...field}
                          value={field.value ?? ""} // ✅ ensure always a string
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className={`w-full p-3 pr-12 border rounded-lg text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${errors.password && touched.password ? "border-red-300" : "border-gray-300"
                            }`}
                        />
                      )}
                    </Field>

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <div className="relative">
                    <Field name="confirmPassword">
                      {({ field }) => (
                        <input
                          {...field}
                          value={field.value ?? ""} // ✅ fallback to ""
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className={`w-full p-3 pr-12 border rounded-lg text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword && touched.confirmPassword ? "border-red-300" : "border-gray-300"
                            }`}
                        />
                      )}
                    </Field>

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded p-1"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-xs font-medium mb-1">Password requirements:</p>
                  <ul className="text-blue-700 text-xs space-y-1">
                    <li>• At least 6 characters</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={handleGoBack}
                  className="text-purple-600 text-sm hover:text-purple-700 transition-colors duration-200 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded px-2 py-1"
                >
                  ← Back to OTP verification
                </button>
              </Form>
            )}
          </Formik>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Forgot Password?"
      case 2: return "Verify OTP"
      case 3: return "Reset Password"
      default: return ""
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your email address and we'll send you an OTP to reset your password"
      case 2: return "Enter the verification code we sent to your email"
      case 3: return "Create a new password for your account"
      default: return ""
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      {/* Progress Steps */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= stepNumber
                  ? "bg-white text-purple-600 shadow-md"
                  : "bg-white bg-opacity-30 text-white"
                  }`}
              >
                {step > stepNumber ? "✓" : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`h-1 w-16 mx-2 transition-all duration-300 rounded-full ${step > stepNumber ? "bg-white shadow-sm" : "bg-white bg-opacity-30"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm bg-opacity-95">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Connectify
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {getStepTitle()}
          </h2>
          <p className="text-gray-600 text-sm">
            {getStepDescription()}
          </p>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Back to Login - Only show on first step */}
        {step === 1 && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-purple-600 text-sm hover:text-purple-700 transition-colors duration-200 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded px-2 py-1"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword