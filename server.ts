import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc"

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


//Swagger
/** 
 * @swagger
 * components:
 *  schemas:
 *    Resource:
 *      type : object
 *      required:
 *        - resource_id
 *        - resource_name
 *        - url
 *        - user_id
 *      properties:
 *        resource_id: 
 *          type: number
 *          description: Unique serial id for resource
 *        resource_name: 
 *          type: string
 *          description: Title of resource
 *        author_name:
 *          type: string
 *          description: Name of resource author
 *        url:
 *          type: string
 *          description: Publicly available URL for resource
 *        description:
 *          type: string
 *          description: Summary of the resource's contents
 *        content_type:
 *          type: string
 *          description: The media type of the resource (i.e. Video or Article)
 *        time_date: 
 *          type: string
 *          description: Date and time the resource was added to the database
 *        rating: 
 *          type: number
 *          description: Usefulness rating of the resource out of 100
 *        notes: 
 *          type: string
 *          description: Some comments from the user which added the resource
 *        user_id: 
 *          type: number
 *          description: Unique ID of the user that added the resource to the database
 *        tag_array: 
 *          type: string[]
 *          description: List of tags that describe the contents of the resource
 *      example:
 *        resource_id: 2
 *        resource_name: 'Swagger API Documentation'
 *        author_name: 'Swagger'
 *        url: 'https://swagger.io/'
 *        description: 'API documentation tool'
 *        content_type: 'Documentation'
 *        time_date: '2017-07-21T17:32:28Z'
 *        rating: 80
 *        notes: 'Powerful and easy to follow API docs tool'
 *        user_id: 1
 *        tag_array: ['Express', 'Cypress']
 *    Comment:
 *      type: object
 *      required: 
 *        - comment_body
 *        - user_id
 *      properties:
 *        comment_id:
 *          type: number
 *          description: Unique serial id for comment
 *        resource_id:
 *          type: number
 *          description: Unique serial id for resource
 *        comment_body:
 *          type: string
 *          description: The contents of the comment
 *        user_id:
 *          type: number
 *          description: Unique serial id for user that made the comment
 *        time_date:
 *          type: string
 *          description: Time date of when the comment was made
 *        user_name:
 *          type: string
 *          description: Name of the user that made the comment
 */
//TODO: Add example to comment schema

/**
 * @swagger
 * tags: 
 *    name: Resources
 *    description: The resources managing API
 */


const options = {
  definition : {
    openapi : "3.0.0",
    info : {
      title : "Resources API",
      version : "1.0.0",
      description : "A simple Express resources library API"
    },
    servers : [
      {
        url : "https://resource-sharer.onrender.com/"
      },
      {
        url : "http://localhost:4000/"
      }
    ]  
  },
  apis : ["./server.ts", "./src/routes/*.ts"]
}

const specs = swaggerJsDoc(options)
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))

// ROUTES
// GET /homepage
app.get('/', (req, res) => {
  res.send('Try /resources for all the resources info or /resources/:resource_id for a specific resource')
})

app.use("/resources", setUpResourceRouter(client))
app.use("/users", setUpUserRouter(client))
app.use("/tags", setUpTagRouter(client))

// GET Catch all endpoint
app.get('*', (req, res) => {
  res.status(400).send('Sorry, nothing to see here. Try /resources')
})

// Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
