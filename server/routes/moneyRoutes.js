import express from 'express'
import connection from '../utils/db.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post("/add",authMiddleware,async (req,res)=>{
    try{
        console.log("Request reached add route")
        console.log("Authenticated user id",req.user.id)
        console.log("request body",req.body)
        const id = req.user.id;

        const {amount} = req.body;

        if(amount<=0){
            return res.status(400).json({message:"Enter a valid amount"});
        }

        const data = await connection.query(`UPDATE money SET balance = balance+$1 WHERE id = $2 RETURNING balance`,[amount,id]);
        console.log("Rows updated:", data.rowCount);
console.log("Updated balance:", data.rows[0]?.balance);

        if(data.rowCount ===0){
            return res.status(404).json({message:"Money Account not Found"});
        }

        return res.status(200).json({message:"Amount added successfully"});

    }catch(err){
        console.log("Error while adding money",err);
        return res.status(500).json({message:"Internal Server Error"});
    }
})


router.post("/send",authMiddleware,async(req,res)=>{
    try{
        const id = req.user.id;

        const {amount,receiver} = req.body;

        if(amount==0 || amount<0){
            return res.status(400).json({message:"Amount can't be 0 or in negative"})
        }

        if(id==receiver){
            return res.status(400).json({message:"Cannot send money to yourself "})
        }

        await connection.query(`BEGIN`);

        const data = await connection.query(`
            SELECT balance FROM money where id = $1 FOR UPDATE`,[id]
            );

        const data2 = await connection.query(`
            SELECT balance FROM money where id= $1 FOR UPDATE`,[receiver]
            )

        if(data.rows.length ==0 || data2.rows.length==0){
            await connection.query("ROLLBACK");

            return res.status(404).json({message:"Sender or Receiver Account not found"})
        }

        const balance = data.rows[0].balance;
        const receiverBalance = data2.rows[0].balance;

        if(amount>balance){
            await connection.query("ROLLBACK")
            return res.status(400).json({message:"Insufficient Balance"})
        }

        await connection.query(`UPDATE money SET balance = balance - $1 WHERE id = $2`,[amount,id]);
        await connection.query(`UPDATE money SET balance = balance + $1 WHERE id = $2`,[amount,receiver]);

        await connection.query("COMMIT");

        return res.status(200).json({message:"Money transferred successfully",remainingBalance: balance-amount, receiverBalance: receiverBalance+amount});
        

    }catch(err){
        await connection.query("ROLLBACK");
        console.log("Transfer Error",err);

        return res.status(500).json({message:"Internal Server Error"});
    }
})

export default router;