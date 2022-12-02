import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
// import axios from "axios";
import { setUpRouter as setUpResourceRouter } from "./src/routes/resources";
import { setUpRouter as setUpUserRouter } from "./src/routes/users";
import { setUpRouter as setUpTagRouter } from "./src/routes/tags";

export interface IResourceSubmit {
  resource_name: string,
  author_name: string,
  url: string,
  description: string,
  content_type: string,
  rating: number,
  notes: string,
  user_id: number,
  tag_array: {tag_name: string}[]
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

const client = new Client(dbConfig);
client.connect();

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

//GET /homepage
app.get('/', (req, res) => {
  res.send('Try /resources for all the resources info or /resources/:resource_id for a specific resource')
})

app.use("/resources", setUpResourceRouter(client))
app.use("/users", setUpUserRouter(client))
app.use("/tags", setUpTagRouter(client))

//GET Catch all endpoint
app.get('*', (req, res) => {
  res.status(400).send('Sorry, nothing to see here. Try /resources')
})

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
