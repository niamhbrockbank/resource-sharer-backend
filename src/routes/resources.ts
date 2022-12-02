import express, { Router } from "express";
import { Client } from "pg";
import { IResourceSubmit } from "../../server";
import { getResourcesQuery } from "../utils/getResourcesQuery";

export function setUpRouter(client : Client): Router{
    const resourcesRouter : Router = express.Router();
    
    //// GET ////
    // GET all resources
    resourcesRouter.get('/', async (req, res) => {
        try {
            const dbResponse = await client.query(getResourcesQuery);
            res.status(200).json(dbResponse.rows);
          } catch (error) {
            console.error(error);
            res.status(400).json(error);
          }
    })

    // GET a given resource
    resourcesRouter.get<{res_id: number}>("/:res_id", async (req, res) => { 
        const {res_id} = req.params;
        try {
        const dbResponse = await client.query(`
            SELECT resources.*, users.name AS user_name
            FROM resources 
            JOIN users ON users.user_id = resources.user_id
            WHERE resource_id = $1`
            , [res_id]);
        if (dbResponse.rowCount === 1) {
            res.status(200).json(dbResponse.rows);
        } else {
            res.status(404).json({message: "Could not find any rows or found too many"})
        }
        } catch (error) {
        console.error(error);
        res.status(400).json(error);
        }
    })

    // GET all comments for a resource
    resourcesRouter.get<{res_id: number}>("/:res_id/comments", async (req, res) => {
        const {res_id} = req.params
        try {
        const dbResponse = await client.query(`
            SELECT comments.*, users.name AS user_name 
            FROM comments 
            JOIN users 
            ON comments.user_id = users.user_id 
            WHERE resource_id = $1 
            ORDER BY comments.time_date DESC`
            , [res_id]);
        res.status(200).json(dbResponse.rows);
        } catch (error) {
        console.error(error);
        res.status(400).json(error);
        }
    })
  
    // GET the likes for a particular comment on a particular resource
    resourcesRouter.get<{comment_id: number}>("/comments/:comment_id/likes", async (req, res) => {
        const {comment_id} = req.params;
        try {
        const dbResponse = await client.query(`
          SELECT liked, count(*) 
          FROM comment_likes 
          WHERE comment_id = $1 
          GROUP BY (liked);`
          , [comment_id]);
        res.status(200).json(dbResponse.rows);
        } catch (error) {
        console.error(error);
        res.status(400).json(error);
        }
    })
    
    //// POST ////
    // POST a new resource
    resourcesRouter.post<{}, {}, IResourceSubmit>("/", async (req, res) => {
        const {resource_name, author_name, url, description, content_type, rating, notes, user_id, tag_array} = req.body;    
        try {
          const dbResponse = await client.query(`
            INSERT INTO resources 
            (resource_name, author_name, url, description, content_type, rating, notes, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`, 
            [resource_name, author_name, url, description, content_type, rating, notes, user_id]);

          const {resource_id} = dbResponse.rows[0];

          const existingTags = await client.query(`SELECT * FROM tags`);
          const existingTagNames = existingTags.rows.map(tagRow => tagRow.tag_name);
          const newTags = tag_array.map(postedTag => postedTag.tag_name).filter(newTag => !existingTagNames.includes(newTag));

          for (const newTag of newTags) {
            await client.query(`
              INSERT INTO tags 
              VALUES ($1)`
              , [newTag]);
          }
          for (const tag of tag_array) {
            await client.query(`
              INSERT INTO resource_tags 
              VALUES ($1, $2)`
              , [resource_id, tag.tag_name]);
          }
          // await axios.post(process.env.DISCORD_URL,
          //   {content: `There's a new resource (${dbResponse.rows[0].resource_name}) on ${frontEndURL}!`});
          res.status(201).json(dbResponse.rows);
        } catch (error) {
          console.error(error);
          res.status(400).json({status: error});
        }
      });
      
      // POST a comment on a particular resource
      resourcesRouter.post<{res_id: number}, {}, {comment_body: string, user_id: number}>("/:res_id/comments", async (req, res) => {
        const {res_id} = req.params;
        const {comment_body, user_id} = req.body;
        try {
          const dbResponse = await client.query(`
            INSERT INTO comments 
            (comment_body, user_id, resource_id) 
            VALUES ($1, $2, $3) 
            RETURNING *`
            , [comment_body, user_id, res_id]);
          res.status(201).json(dbResponse.rows);
        } catch (error) {
          console.error(error);
          res.status(400).json({status: error});
        }
      });
      
      // POST a like or dislike for a particular resource
      resourcesRouter.post<{res_id: number}, {}, {user_id: number, like_or_dislike: "like" | "dislike"}>("/:res_id/likes", async (req, res) => {
        const {res_id}= req.params;
        const {user_id, like_or_dislike} = req.body;
        const like_boolean = like_or_dislike === "like" ? true : false;
        try {
          const dbResponse = await client.query(`
            INSERT INTO resource_likes VALUES ($1,$2,$3) 
            ON CONFLICT (resource_id, user_id) 
            DO UPDATE SET liked = $3 RETURNING *; `
            , [res_id, user_id, like_boolean]);
          res.status(200).json(dbResponse);
        } catch (error) {
          console.error(error);
          res.status(400).json({status: error});
        }
      });
      
      // POST a like or dislike for a particular comment
      resourcesRouter.post<{comment_id: number}, {}, {user_id: number, like_or_dislike: "like" | "dislike"}>("/comments/:comment_id/likes", async (req, res) => {
        const {comment_id}= req.params;
        const {user_id, like_or_dislike} = req.body;
        const like_boolean = like_or_dislike === "like" ? true : false;
        try {
          const dbResponse = await client.query(`
            INSERT INTO comment_likes VALUES ($1,$2,$3) 
            ON CONFLICT (comment_id, user_id) 
            DO UPDATE SET liked = $3 RETURNING *; `
            , [comment_id, user_id, like_boolean]);
          res.status(200).json(dbResponse);
        } catch (error) {
          console.error(error);
          res.status(400).json({status: error});
        }
      });

    //// PUT ////
    // PUT update a particular resource
    resourcesRouter.put<{res_id: number}, {}, IResourceSubmit>("/:res_id", async (req, res) => {
        const {res_id} = req.params
        const {resource_name, author_name, url, description, content_type, rating, notes, user_id, tag_array} = req.body;    
        try {
            const dbResponse = await client.query(`
              UPDATE resources 
              SET 
                resource_name=$1, 
                author_name=$2, 
                url=$3, 
                description=$4, 
                content_type=$5, 
                rating=$6, 
                notes=$7, 
                user_id=$8 
              WHERE resource_id=$9 
              RETURNING *`, 
              [resource_name, author_name, url, description, content_type, rating, notes, user_id, res_id]);
            const {resource_id} = dbResponse.rows[0];
            await client.query(`
              DELETE FROM resource_tags 
              WHERE resource_id = $1`
              , [resource_id]);
            const existingTags = await client.query(`
              SELECT * 
              FROM tags`);
            const existingTagNames = existingTags.rows.map(tagRow => tagRow.tag_name);
            const newTags = tag_array.map(postedTag => postedTag.tag_name).filter(newTag => !existingTagNames.includes(newTag));
            for (const newTag of newTags) {
            await client.query(`
              INSERT INTO tags 
              VALUES ($1)`
              , [newTag]);
            }
            for (const tag of tag_array) {
            await client.query(`
              INSERT INTO resource_tags 
              VALUES ($1, $2)`
              , [resource_id, tag.tag_name]);
            }
            if (dbResponse.rowCount === 1) {
            res.status(201).json(dbResponse.rows);
            } else {
            res.status(400).json("Did not update exactly one row");
            }
        } catch (error) {
            console.error(error);
            res.status(400).json({status: error});
        }
    });
      
    // PUT update a particular comment on a particular resource
    resourcesRouter.put<{comment_id: number}, {}, {comment_body: string}>("/comments/:comment_id", async (req, res) => {
        const {comment_id} = req.params;
        const {comment_body} = req.body;
        try {
            const dbResponse = await client.query(`
              UPDATE comments 
              SET comment_body=$1 
              WHERE comment_id=$2 
              RETURNING *`
              , [comment_body, comment_id])
            if (dbResponse.rowCount === 1) {
            res.status(200).json(dbResponse.rows);
            } else {
            res.status(400).json("Did not update exactly one comment");
            }
        } catch (error) {
            console.error(error);
            res.status(400).json(error);
        }
    });
    
    //// DELETE ////
    // DELETE delete a resource
    resourcesRouter.delete<{res_id: number}>("/resources/:res_id", async (req, res) => {
        const {res_id} = req.params;
        try {
            const dbResponse = await client.query(`
              DELETE FROM resources 
              WHERE resource_id = $1 
              RETURNING *`
              , [res_id]);
            if (dbResponse.rowCount === 1) {
            res.status(200).json({status: "success", message: `Deleted resource ${res_id}`})
            } else {
            res.status(400).json({message: "Did not delete exactly one resource"});
            }
        } catch (error) {
            console.error(error);
            res.status(400).json(error);
        }
    });

    // DELETE delete a single comment
    resourcesRouter.delete<{comment_id: number}>("/resources/comments/:comment_id", async (req, res) => {
        const {comment_id} = req.params;
        try {
        const dbResponse = await client.query(`
          DELETE FROM comments 
          WHERE comment_id = $1 
          RETURNING *`
          , [comment_id]);
        if (dbResponse.rowCount === 1) {
            res.status(200).json({status: "success", message: `Deleted comment ${comment_id}`})
        } else {
            res.status(400).json({message: "Did not delete exactly one comment"});
        }
        } catch (error) {
        console.error(error);
        res.status(400).json(error);
        }
    })
    
    // DELETE delete a like or dislike from a particular resource
    resourcesRouter.delete<{res_id: number, user_id: number}, {}, {}>("/resources/:res_id/:user_id/likes", async (req, res) => {
        const {res_id} = req.params;
        const {user_id} = req.params;
        try {
        const dbResponse = await client.query(`
          DELETE FROM resource_likes 
          WHERE resource_id = $1 
          AND user_id=$2 
          RETURNING *`
          , [res_id, user_id]);
        if (dbResponse.rowCount === 1) {
            res.status(200).json({status: "success", message: `Deleted your like/dislike from ${res_id}`})
        } else {
            res.status(400).json({message: "Did not delete exactly one like/dislike"});
        }
        } catch (error) {
        console.error(error);
        res.status(400).json(error);
        }
    })
  
    // DELETE a comment like
    resourcesRouter.delete<{comment_id: number}, {}, {user_id: number}>("/resources/comments/:comment_id/likes", async (req, res) => {
        const {comment_id} = req.params;
        const {user_id} = req.body;
        try {
        const dbResponse = await client.query(`
          DELETE FROM comment_likes 
          WHERE comment_id = $1 
          AND user_id=$2 
          RETURNING *`
          , [comment_id, user_id]);
        if (dbResponse.rowCount === 1) {
            res.status(200).json({status: "success", message: `Deleted your like/dislike from ${comment_id}`})
        } else {
            res.status(400).json({message: "Did not delete exactly one like/dislike"});
        }
        } catch (error) {
        console.error(error);
        res.status(400).json(error);
        }
    })
      
    return resourcesRouter;
}