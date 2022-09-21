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
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /resources/:res-id //get a given resource
app.get<{res_id: string}>("/resources/:res_id", async (req, res) => { //add type later
  const {res_id} = req.params;
  try {
    const response = await client.query("select * from resources where resource_id = $1", [parseInt(res_id)]);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /resources/:res-id/comments //get all comments for a resource
app.get<{res_id: string}>("/resources/:res_id/comments", async (req, res) => {
  const {res_id} = req.params
  try {
    const response = await client.query("select * from comments where resource_id = $1", [parseInt(res_id)]);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /tags //get all the tags
app.get("/tags", async (req, res) => {
  try {
    const response = await client.query("select * from tags");
    res.status(200).json(response.rows);
  } catch(error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /users //get all the users
app.get("/users", async (req, res) => {
  try {
    const response = await client.query("select * from users");
    res.status(200).json(response.rows);
  } catch(error) {
    console.error(error);
    res.status(400).json({message: "Ooops"});
  }
})

// GET /users/:user-id/study-list //get user's study list
app.get<{user_id: string}>("/users/:user_id/study-list", async (req, res) => {
  const {user_id} = req.params;
  try {
    const response = await client.query("select * from study_list where user_id = $1", [parseInt(user_id)]);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "Surprise!"});
  }
})

// DELETE /resources/:res-id //delete a resource
app.delete<{res_id: string}>("/resources/:res_id");
// DELETE /resources/:res-id/comments //delete a comment
// DELETE /resources/:res-id/likes //delete a like or dislike
// DELETE /tags //delete a tag from the database
// DELETE /users/:user-id/study-list //delete resource from user's study list


//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
