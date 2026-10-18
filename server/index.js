import "dotenv/config"
import express from 'express'
import { connectDb } from './utils/db.js';
import authRoutes from './routes/authRoutes.js'
import moneyRoutes from './routes/moneyRoutes.js'
import userRoutes from './routes/userRoutes.js'
import cookieParser from "cookie-parser";



const app = express();
app.use(express.json());
app.use(cookieParser());

const startServer =async ()=>{
    try{
        await connectDb();

        app.use('/api/v1/auth',authRoutes);
        app.use('/api/v1/money',moneyRoutes);
        app.use('/api/v1/user',userRoutes);

        const PORT = process.env.PORT || 3000
        app.listen(PORT,()=>{
            console.log(`Server is running on port ${PORT}`)
        })
    }catch(err){
        console.log("Failed to start server: ",err);
        process.exit(1);
    }
}


startServer();




