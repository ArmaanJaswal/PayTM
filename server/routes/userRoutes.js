import express from 'express'

import connection from '../utils/db.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const data = await connection.query(`
      SELECT id, username, email
      FROM users
      ORDER BY username ASC
    `);

    if (data.rows.length === 0) {
      return res.status(404).json({
        message: "No users found",
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      users: data.rows,
    });
  } catch (err) {
    console.error("Error while fetching users:", err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});


router.put("/update", authMiddleware, async (req, res) => {
  try {
    const id = req.user.id;
    const { username } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const data = await connection.query(
      `UPDATE users
       SET username = $1
       WHERE id = $2
       RETURNING id, username, email, created_at`,
      [username.trim(), id]
    );

    if (data.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: data.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    console.error("Error updating user:", err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;