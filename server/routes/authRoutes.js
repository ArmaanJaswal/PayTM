import express from 'express'
import connection from '../utils/db.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      authenticated: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify authentication",
    });
  }
});

router.post("/signup",async (req,res)=>{
    try{
        const {username,email,password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({message:"Bad Request"})
    }
    const hashedPassword =await bcrypt.hash(password,10);
    const response = await connection.query(`INSERT INTO users(username,email,password) VALUES ($1,$2,$3) RETURNING id, username, email`,[username,email,hashedPassword]);;

    console.log(response.rows[0]);
    const user = response.rows[0];
    await connection.query(
  `INSERT INTO money (id, balance)
   VALUES ($1, $2)`,
  [user.id, 0]
);
    

    return res.status(201).json({message:"User Created Successfully",user:response.rows[0]})
    }catch(err){
        console.log("Error while Signing up",err);
        return res.status(400).json({message:"Error while signin up"});
    }
})


router.post("/signin",async (req,res)=>{
    try{
        const {email,password}= req.body;
        if(!email || !password){
        return res.status(400).json({message:"Bad Request"});
        }

        const findUser = await connection.query(`SELECT * FROM USERS WHERE email = $1`,[email]);

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
        return res.status(400).json({message:"Bad Request"});
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
});

router.get("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
});

export default router;