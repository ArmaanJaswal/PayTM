
import { Pool } from 'pg';
const connection =  new Pool({
    connectionString:process.env.POSTGRES_URI,
})

export const connectDb =async (req,res)=>{
    try{

        console.log("DataBase Connected")

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(150) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `)

        await connection.query(
            `
            CREATE TABLE IF NOT EXISTS money(
            id INT REFERENCES users(id),
            balance INT NOT NULL    
            )
            `
        )
        console.log("Tables Initialized")
    }catch(err){
        console.log("Error in Database Connection")
        throw err;
    }
}

export default connection;


