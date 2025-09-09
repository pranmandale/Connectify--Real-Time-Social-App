import * as Yup from "yup";

// ✅ Validation Schema
export const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  userName: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(4, "Password must be at least 4 characters")
    .required("Password is required"),
});
