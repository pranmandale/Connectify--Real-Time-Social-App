import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signUp } from "../featurres/users/authSlice.jsx"; // your signup thunk
import { SignupSchema } from "../validations/signupValidation.js"; // your Yup schema

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignup = async (values, resetForm) => {
    const payload = {
      name: values.name,
      userName: values.userName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    };

    await toast.promise(
      dispatch(signUp(payload)).unwrap(),
      {
        loading: "Signing up...",
        success: (res) => {
          resetForm(); 
          return res?.message || "Signup successful!";
        },
        error: (err) => {
          console.error("Signup error:", err);
          return err?.message || "Signup failed!";
        },
      }
    );
  };

  const initialValues = {
    name: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Brand */}
        <h1 className="text-center text-4xl font-extrabold mb-6 text-gray-800">
          Connectify
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Sign up to connect with friends and the world around you.
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            await handleSignup(values, resetForm);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col space-y-4">
              {/* Full Name */}
              <div>
                <Field
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Username */}
              <div>
                <Field
                  type="text"
                  name="userName"
                  placeholder="Username"
                  className="w-full p-3 border rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage
                  name="userName"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Phone */}
              <div>
                <Field
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full p-3 border rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage
                  name="phone"
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
                {isSubmitting ? "Signing up..." : "Sign Up"}
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

        {/* Social signup mock */}
        <button className="w-full text-blue-600 font-semibold text-sm mb-3">
          Sign up with Facebook
        </button>

        {/* Already have account */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-pink-600 font-semibold underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
