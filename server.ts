import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client("resourcedb");
client.connect();

// GET /resources //get all resources
app.get("/resources", async (req, res) => {
  try {
    const response = await client.query("select * from resources order by time_date desc");
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /resources/:res-id //get a given resource
app.get("/resources/:resID", async (req, res) => { //add type later
  const {resID} = req.params;
  try {
    const response = await client.query("select * from resources where resource_id = $1", [parseInt(resID)]);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /resources/:res-id/comments //get all comments for a resource
app.get("/resources/:resID/comments", async (req, res) => {
  const {resID} = req.params
  try {
    const response = await client.query("select * from comments where resource_id = $1", [parseInt(resID)]);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /tags //get all the tags
app.get("/tags", async (req, res) => {
  try {
    const response = await client.query("select * from tags");
    res.json(response.rows);
  } catch(error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /users //get all the users
app.get("/users", async (req, res) => {
  try {
    const response = await client.query("select * from users");
    res.json(response.rows);
  } catch(error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /users/:user-id/study-list //get user's study list
app.get("/users/:userID/study-list", async (req, res) => {
  const {userID} = req.params;
  try {
    const response = await client.query("select * from study_list where user_id = $1", [parseInt(userID)]);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Surprise!"});
  }
})

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
