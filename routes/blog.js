const {Router} = require('express');
const blogRouter = Router();
const executeQuery = require('../db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//get all posts
blogRouter.get("/", async (req,res) => {
    try {
        const sql = 'SELECT posts.*, users.first_name, users.last_name FROM posts JOIN users ON posts.user_id = users.id';
        const result = await executeQuery(sql);
        const rows = result.rows ? result.rows : []; // check if result is falsy, if so send empty
        res.status(200).json(rows);
    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error: error});
    }
})

//get post by id
blogRouter.get("/:id", async (req,res) => {
    const id  = parseInt(req.params.id);
    try {
        const sql = `SELECT posts.*, users.first_name, users.last_name, users.username 
        FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1
        `
        const result = await executeQuery(sql, [id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error:error});
    }
})

//get posts by user id
blogRouter.get("/user/:id", async (req,res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = 'SELECT * FROM posts WHERE user_id = $1'; // not ready
        const result = await executeQuery(sql, [id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);

    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error:error});
    }
})

//create new post
blogRouter.post("/new", async (req,res) => {
    const likes = 0;
    const {text, user_id, image} = req.body;
    try {
        const sql = 'INSERT INTO posts (text, likes, user_id) VALUES ($1, $2, $3)';
        const result = await executeQuery(sql, [text, likes, user_id]); // not ready return the made post and image things
        res.status(201).send("Post created");
        console.log("Post created");
    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error:error});
    }
})

//delete post


//get all posts comments
blogRouter.get("/:id/comments", async (req,res) => {
    const post_id = parseInt(req.params.id);
    console.log("Post id to get comments: ", post_id)
    try {
        const sql = `
        SELECT comments.*, users.first_name, users.last_name, users.username
        FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1
        `;
        const result = await executeQuery(sql, [post_id]);
        const rows = result.rows ? result.rows : [];
        //console.log("Comments returned: ", rows)
        res.status(200).json(rows);
    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error: error});
    }
})
//create new comment
blogRouter.post("/comment/new", async (req,res) => {
    const likes = 0;
    try  {
        const sql = `WITH inserted_comment AS(INSERT INTO comments (text, likes, post_id, user_id)
        VALUES ($1, $2, $3, $4) RETURNING *) SELECT inserted_comment.*, users.first_name, users.last_name, users.username
        FROM inserted_comment JOIN users ON inserted_comment.user_id = users.id WHERE inserted_comment.post_id = $3`;
        const result = await executeQuery(sql, [req.body.text, likes, req.body.postId, req.body.user_id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error: error});
    }
})

//get users post likes


//get users comment likes !!change to also check the post
blogRouter.get("/:id/comments/likes", async (req,res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = 'SELECT comment_id from user_comment_likes WHERE user_id = $1';
        const result = await executeQuery(sql, [id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error: error});
    }
})
//like or dislike system
blogRouter.put("/comment/like", async (req,res) => {
    console.log("likeStatus: ", req.body.likeStatus);
    try {
        const sql = 'INSERT INTO user_comment_likes (user_id, comment_id) VALUES ($2, $1)';
        const result = await executeQuery(sql, [req.body.comment_id, req.body.user_id]);

        if(result.rowCount > 0) {
            const updateSql = 'UPDATE comments SET likes = likes + 1 WHERE id = $1 RETURNING likes';
            const updateResult = await executeQuery(updateSql, [req.body.comment_id]);
            const rows = updateResult.rows ? updateResult.rows : [];
            res.status(200).json(rows);
        }
    } catch (error) {
        res.statusMessage = error;
        res.status(500).json({error: error});
    }
})

async function likeComment() {
    try {
        const sql = 'INSERT INTO user_comment_likes (user_id, comment_id, like_status) VALUES ($1, $2)';
        const result = await executeQuery(sql, [req.body.user_id, req.body.comment_id, req.body.like_status]);
    } catch (error) {
        return error;
    }
}
async function dislikeComment() {
    try {

    } catch (error) {
        return error;
    }
}

module.exports = {blogRouter}