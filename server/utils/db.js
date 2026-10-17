import {Client } from 'pg'

const client = await new Client({
    connectionString:process.env.POSTGRES_URI
})

export const connectDb =async ()=>{
    try{
        await client.connect();
        console.log("DataBase Connected")

        await client.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE
            password VARCHAR(150) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `)

        await client.query(
            `
            CREATE TABLE IF NOT EXISTS money(
            id INT REFERENCES users(id),
            amount INT NOT NULL
            )
            `
        )
        console.log("Tables Initialized")
    }catch(err){
        console.log("Error in Database Connection")
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export default client;


