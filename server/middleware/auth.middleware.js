import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/apiError.js"

//extract the tokens from the request header or the cookies and verify it using the seceret key 
//if valid add the user to the request 
//always call the next middleware 
const verifyJwt = asyncHandler(async (req, res, next) => {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.replace("Bearer ", "")
        : null;

    const token = bearerToken || req.cookies?.token;

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
});

//middleware to check if the user is an admin
const admin = (req,res,next)=>{
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        throw new ApiError(403, "Forbidden: Admins only");
    }
}



export { verifyJwt, admin };