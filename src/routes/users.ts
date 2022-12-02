import express, { Router } from "express";
import { Client } from "pg";

export function setUpRouter(client : Client): Router{
    const usersRouter : Router = express.Router();
    
    //// GET ////
    // GET all the users
    usersRouter.get("/", async (req, res) => {
      try {
        const dbResponse = await client.query(`
          SELECT * FROM users 
          ORDER BY name ASC
        `);
        res.status(200).json(dbResponse.rows);
      } catch(error) {
        console.error(error);
        res.status(400).json(error);
      }
    });

    // GET user's study list
    usersRouter.get<{user_id: number}>("/:user_id/study_list", async (req, res) => {
      const {user_id} = req.params;
      try {
        const dbResponse = await client.query(`
          SELECT resource_id 
          FROM study_list 
          WHERE user_id = $1
        `, [user_id]);
        res.status(200).json(dbResponse.rows);
      } catch (error) {
        console.error(error);
        res.status(400).json(error);
      }
    });

    //// POST ////
    // POST resource to user's study list
    usersRouter.post<{user_id: number}, {}, {resource_id: number}>("/:user_id/study_list", async (req, res) => {
      const {user_id} = req.params;
        const {resource_id} = req.body;
        try {
          const dbResponse = await client.query(`INSERT INTO study_list (user_id, resource_id) VALUES ($1, $2) RETURNING *`, [user_id, resource_id]);
          res.status(201).json(dbResponse.rows);
        } catch (error) {
          console.error(error);
          res.status(400).json(error);
        }
      });

    //// DELETE ////
    // DELETE /users/:user-id/study-list //delete resource from user's study list
    usersRouter.delete<{user_id: number}, {}, {resource_id: number}>("/:user_id/study_list", async (req, res) => {
      const {user_id} = req.params;
      const {resource_id} = req.body;
      try {
        const dbResponse = await client.query("delete from study_list where user_id = $1 and resource_id = $2 returning *", 
          [user_id, resource_id]);
        if (dbResponse.rowCount === 1) {
          res.status(200).json({status: "success", message: `Deleted resource ${resource_id} from your study-list`})
        } else {
          res.status(400).json({message: "Did not delete exactly one resource from the study list"});
        }
      } catch (error) {
        console.error(error);
        res.status(400).json(error);
      }
    });
      
    return usersRouter;
}