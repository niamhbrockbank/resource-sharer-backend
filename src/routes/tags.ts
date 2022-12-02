import express, { Router } from "express";
import { Client } from "pg";

export function setUpRouter(client : Client): Router{
    const tagsRouter : Router = express.Router();
    
    //// GET ////
    // GET all the tags
    tagsRouter.get("/", async (req, res) => {
      try {
        const dbResponse = await client.query("select * from tags");
        res.status(200).json(dbResponse.rows);
      } catch(error) {
        console.error(error);
        res.status(400).json(error);
      }
    })

    //// DELETE ////
    // DELETE /tags //delete a tag from the database
    tagsRouter.delete<{}, {}, {tag_name: string}>("/", async (req, res) => {
      const {tag_name} = req.body;
      try {
        const dbResponse = await client.query("delete from tags where tag_name = $1 returning *", [tag_name]);
        if (dbResponse.rowCount === 1) {
          res.status(200).json({status: "success", message: `Deleted the tag ${tag_name}`});
        } else {
          res.status(400).json({message: "Did not delete exactly one tag"});
        }
      } catch (error) {
        console.error(error);
        res.status(400).json(error);
      }
    })
    
    return tagsRouter;
}