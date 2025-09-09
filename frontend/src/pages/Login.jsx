import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import LoginSchema from "../validations/loginValidation.js";
import { useDispatch } from "react-redux";
import {toast} from "react-hot-toast"
import { login } from "../featurres/users/authSlice.jsx";
import {useNavigate} from "react-router-dom"

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialValues = { identifier: "", password: "" };

  const handleLogin = async(values, resetForm) => {
    

    const payload = {
      identifier : values.identifier,
      password : values.password
    }

    await toast.promise(
  dispatch(login(payload)).unwrap(),
  {
    loading: "Logging in...",
    success: (res) => res?.message || "Login successful",
    error: (err) => {
      console.error("Login error:", err);
      // fallback to either message or first string in err object
      return err?.message || err?.error || "Login failed";
    },
  }
);



  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 space-y-4">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Brand */}
        <h1 className="text-center text-4xl font-extrabold mb-6 text-gray-800">
          Connectify
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Log in to see photos and updates from your friends.
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={async(values, { setSubmitting, resetForm }) => {
           await handleLogin(values, resetForm);
            setSubmitting(false);
          }}

        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col space-y-4">
              {/* Identifier (username/email/phone) */}
              <div>
                <Field
                  type="text"
                  name="identifier"
                  placeholder="Phone number, username, or email"
                  className="w-full p-3 border rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage
                  name="identifier"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Password */}
              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-3 border rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Fake Facebook login */}
        <button className="w-full text-blue-600 font-semibold text-sm mb-3">
          Log in with Facebook
        </button>

        {/* Forgot Password */}
        <a href="#" className="block text-center text-xs text-blue-600">
          Forgot password?
        </a>
      </div>

      {/* Signup Box */}
      <div className="w-full max-w-md bg-white border border-gray-200 p-6 text-center text-sm rounded-xl shadow">
        Don’t have an account?{" "}
        <button
            onClick={() => navigate("/signup")}
            className="text-pink-600 font-semibold underline"
          >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
