import express from 'express'
import client from '../utils/db';
import bcrypt from 'bcrypt'
import { message } from 'statuses';
import jwt from 'jsonwebtoken'

const router = express.Router();


router.use("/signup",async (req,res)=>{
    try{
        const {username,email,password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({message:"Bad Request"})
    }
    const hashedPassword = bcrypt.hash(password,10);
    const response = await client.query(`INSERT INTO users(username,email,password) $1,$2,$3 RETURNING user_id, username, email`,[username,email,hashedPassword]);;

    console.log(response.rows[0]);

    return res.status(201).json({message:"User Created Successfully",response})
    }catch(err){
        console.log("Error while Signing up",err);
        return res.status(400).json({message:"Error while signin up"});
    }
})


router.use("/signin",async (req,res)=>{
    try{
        const {email,password}= req.body;
        if(!email || !password){
        return res.status(400).json({message:"Bad Request"});
        }

        const findUser = await client.query(`SELECT * FROM USERS WHERE email = $1`,[email]);

        if(findUser.rows.length>0){
            const foundUser = findUser.rows[0];

            const passwordCorrect = bcrypt.compare(foundUser.password,password);

            if(!passwordCorrect){
                return res.status(400).json({message:"Incorrect Password"});
            }

            const token = jwt.sign({id:foundUser.id},process.env.JWT_SECRET,{expiresIn:"1d"});

            res.cookie("token",token,{
                httpOnly:true,
                maxAge: 224*60*60*1000
            });

            return res.status(200).json({message:"Sign In Successfull"})

        }else{
            return res.status(404).json({message:"User Not Found"});
        }
    }catch(err){
        console.log("Error while signing in ",err);
        return res.status(400).json({message:"Bad Request"})
    }
    
})


