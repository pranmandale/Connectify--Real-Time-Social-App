import {jwtDecode} from "jwt-decode"


export const decodedToken = (token) => {
    if(!token) null;

    try{
        const decodedToken = jwtDecode(token);
        return decodedToken;
    } catch(error) {
        console.log("error decoding token");
        return null;
    }
}