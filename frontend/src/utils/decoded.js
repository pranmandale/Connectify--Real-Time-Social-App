import { jwtDecode } from "jwt-decode";

export const decodedToken = (token) => {
  if (!token) return null;   // stop here if no token

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded);
    return decoded;
  } catch (error) {
    console.log("error decoding token", error);
    return null;
  }
};
