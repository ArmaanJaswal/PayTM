

import express from "express"
import jwt from 'jsonwebtoken'

export const authMiddleware=async (req,res,next)=>{
    try{
        
        const token = req.cookies?.token;

        if(!token){
            return res.status(401).json({message:"No token provided. Please log in"})
        }

        const decoded= jwt.verify(token,process.env.JWT_SECRET);
        

        req.user = decoded;

        next();

    }catch(err){
        console.log("Error in auth middleware: ",err);
        return res.status(401).json({message:"Invalid or Expired Token"});
    }
}