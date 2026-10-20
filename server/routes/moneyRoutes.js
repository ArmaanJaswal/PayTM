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

router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const id = req.user.id;

    const data = await connection.query(
      `SELECT balance FROM money WHERE id = $1`,
      [id]
    );

    if (data.rowCount === 0) {
      return res.status(404).json({
        message: "Money account not found",
      });
    }

    return res.status(200).json({
      message: "Balance fetched successfully",
      balance: data.rows[0].balance,
    });
  } catch (err) {
    console.error("Error while fetching balance:", err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.post("/send/:receiver", authMiddleware, async (req, res) => {
  const client = await connection.connect();
  let transactionStarted = false;

  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiver;
    const amount = Number(req.body.amount);

    // Validate amount
    if (
      req.body.amount === undefined ||
      req.body.amount === null ||
      req.body.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message: "Amount must be a valid positive number",
      });
    }

    // Prevent self-transfer
    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        message: "Cannot send money to yourself",
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Lock both accounts in a consistent order
    const result = await client.query(
      `SELECT id, balance
       FROM money
       WHERE id IN ($1, $2)
       ORDER BY id
       FOR UPDATE`,
      [senderId, receiverId]
    );

    const sender = result.rows.find(
      (row) => String(row.id) === String(senderId)
    );

    const receiver = result.rows.find(
      (row) => String(row.id) === String(receiverId)
    );

    if (!sender || !receiver) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        message: "Sender or receiver account not found",
      });
    }

    if (amount > Number(sender.balance)) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // Deduct from sender
    const debit = await client.query(
      `UPDATE money
       SET balance = balance - $1
       WHERE id = $2
       RETURNING balance`,
      [amount, senderId]
    );

    // Credit receiver
    const credit = await client.query(
      `UPDATE money
       SET balance = balance + $1
       WHERE id = $2
       RETURNING balance`,
      [amount, receiverId]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      message: "Money transferred successfully",
      remainingBalance: debit.rows[0].balance,
      receiverBalance: credit.rows[0].balance,
    });
  } catch (err) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback Error:", rollbackError);
      }
    }

    console.error("Transfer Error:", err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  } finally {
    client.release();
  }
});

export default router;