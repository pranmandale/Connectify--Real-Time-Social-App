import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required("Username, email, or phone is required"),
  password: Yup.string() 
    .min(6, "Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and number")
    .required("Password is required"),
});

export default LoginSchema;
