import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

interface IResource {
  resource_name: string,
  author_name: string,
  url: string,
  description: string,
  content_type: string,
  build_stage: string,
  opinion: string,
  opinion_reason: string,
  user_id: number
}

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

const client = new Client("localResourceDB");
client.connect();

app.post<{}, {}, IResource>("/resources", async (req, res) => {
  const {resource_name, author_name, url, description, content_type, build_stage, opinion, opinion_reason, user_id} = req.body;    
  try {
    const dbResponse = await client.query(`INSERT INTO resources (resource_name, author_name, url, description, content_type, build_stage, opinion, opinion_reason, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [resource_name, author_name, url, description, content_type, build_stage, opinion, opinion_reason, user_id]);
    res.status(201).json(dbResponse.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({status: error});
  }
});

app.post<{res_id: string}, {}, {comment_body: string, user_id: number}>("/resources/:res_id/comments", async (req, res) => {
  const res_id = parseInt(req.params.res_id);
  const {comment_body, user_id} = req.body;
  try {
    const dbResponse = await client.query(`INSERT INTO comments (comment_body, user_id, resource_id) VALUES ($1, $2, $3) RETURNING *`, [comment_body, user_id, res_id]);
    res.status(201).json(dbResponse);
  } catch (error) {
    console.error(error);
    res.status(400).json({status: error});
  }
});

// See if it is possible to return from SQL statement
app.post<{res_id: string}, {}, {user_id: number, like_or_dislike: "like" | "dislike"}>("/resources/:res_id/likes", async (req, res) => {
  const res_id = parseInt(req.params.res_id);
  const {user_id, like_or_dislike} = req.body;
  const like_boolean = like_or_dislike === "like" ? true : false;
  try {
    const dbResponse = await client.query(`do 
    $do$
    begin
    if exists (select * from likes where user_id = $1 and resource_id = $2) then update likes set liked = $3 where user_id = $1 and resource_id = $2;
    else insert into likes values ($1, $2, $3);
    end if;
    end 
    $do$`, [user_id, res_id, like_boolean]);
    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(400).json({status: error});
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
