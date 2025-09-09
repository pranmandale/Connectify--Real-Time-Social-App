import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required("Username, email, or phone is required"),
  password: Yup.string().min(4, "Password too short").required("Password is required"),
});

export default LoginSchema;
