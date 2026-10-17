import dotenv from 'dotenv'
import express from 'express'
import { connectDb } from './utils/db';


dotenv.config();

const app = express();

const startServer =async ()=>{
    try{
        await connectDb();

        app.listen(process.abort.env.PORT,()=>{
            console.log(`Server is running on port ${PORT}`)
        })
    }catch(err){
        console.log("Failed to start server: ",err);
        process.exit(1);
    }
}


startServer();




app.listen(3000)