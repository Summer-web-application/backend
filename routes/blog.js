const {Router} = require('express');
const blogRouter = Router();
const executeQuery = require('../src/helpers/db.js');
const { jwtAuth } = require('../src/helpers/auth.js');
const fs = require('fs');
const path = require('path');
//get all posts
blogRouter.get("/", async (req,res) => {
    try {
        const sql = 'SELECT posts.*, users.first_name, users.last_name, users.username FROM posts JOIN users ON posts.user_id = users.id';
        const result = await executeQuery(sql); // wait for executeQuery in db.js to finish 
        const rows = result.rows ? result.rows : []; // check if result is falsy, if so send empty
        res.status(200).json(rows); //send found rows
    } catch (error) {
        res.status(500).json({error: error}); //send error
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
        res.status(500).json({error: error});
    }
})

//create new post
blogRouter.post("/new", jwtAuth, async (req,res) => {
    const likes = 0;
    let file_name = ""
    console.log(req.body.text, "text");
    console.log(req.body, " body");
    try {
        if(req.files){
            const file = req.files.image;
            file_name = file.name;
            const path = `./public/images/${file_name}`;
            console.log(file, " image file");
            file.mv(path, (error) => {
                if (error) {
                    throw new Error(error);
                }
            });
        }
        const sql = `WITH inserted_post AS (INSERT INTO posts (text, likes, image, user_id) VALUES ($1, $2, $3, $4) RETURNING *)
        SELECT inserted_post.*, users.first_name, users.last_name, users.username
        FROM inserted_post JOIN users ON inserted_post.user_id = users.id`;
        const result = await executeQuery(sql, [req.body.text, likes, file_name, req.body.user_id]); 
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({error:error});
    }
})

// Update post by id
blogRouter.put("/:id", jwtAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text content is required" });
    }

    try {
        const sql = 'UPDATE posts SET text = $1 WHERE id = $2 RETURNING *';
        const result = await executeQuery(sql, [text, id]);
        const rows = result.rows ? result.rows : [];

        if (rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({error: error});
    }
});

//delete post
blogRouter.delete("/:id", jwtAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = 'DELETE FROM posts WHERE id = $1 RETURNING *';
        const result = await executeQuery(sql, [id]);
        const rows = result.rows ? result.rows : [];

        if (rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }
        if(rows[0].image !== ''){
            //find right path
            const imagePath = path.join(__dirname,'..', 'public', 'images', rows[0].image);
        
         // Delete the image file
         fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting image:', err);
                return res.status(500).json({ error: "Failed to delete image" });
            }
        });
        }
        res.status(200).json({ message: "Post deleted successfully", post: rows[0] });
    } catch (error) {
        res.status(500).json({error: error});
    }
});

//get all posts comments
blogRouter.get("/:id/comments", async (req,res) => {
    const post_id = parseInt(req.params.id);
    try {
        const sql = `
        SELECT comments.*, users.first_name, users.last_name, users.username
        FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1
        `;
        const result = await executeQuery(sql, [post_id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({error: error});
    }
})
//create new comment
blogRouter.post("/comment/new", jwtAuth, async (req,res) => {
    console.log("new comment");
    const likes = 0;
    try  {
        const sql = `WITH inserted_comment AS(INSERT INTO comments (text, likes, post_id, user_id)
        VALUES ($1, $2, $3, $4) RETURNING *) SELECT inserted_comment.*, users.first_name, users.last_name, users.username
        FROM inserted_comment JOIN users ON inserted_comment.user_id = users.id WHERE inserted_comment.post_id = $3`;
        const result = await executeQuery(sql, [req.body.text, likes, req.body.post_id, req.body.user_id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({error: error});
    }
})

//delete comment
blogRouter.delete("/comment/:id", jwtAuth, async (req, res) => {
    const commentId = parseInt(req.params.id);
    try {
        const sql = 'DELETE FROM comments WHERE id = $1 RETURNING *';
        const result = await executeQuery(sql, [commentId]);
        const rows = result.rows ? result.rows : [];

        if (rows.length === 0) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json({ message: "Comment deleted successfully", comment: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error});
    }
});

//get users comment likes
blogRouter.get("/:user_id/:post_id/comments/likes", async (req,res) => {
    const user_id = parseInt(req.params.user_id);
    const post_id = parseInt(req.params.post_id);
    try {
        const sql = 'SELECT comment_id from user_comment_likes WHERE user_id = $1 AND post_id = $2';
        const result = await executeQuery(sql, [user_id, post_id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({error: error});
    }
})
// Update comment by id
blogRouter.put("/comment/udpate/:id", jwtAuth, async (req, res) => {
    console.log("update comment called");
    const commentId = parseInt(req.params.id);
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Comment text is required" });
    }
    try {
        const sql = 'UPDATE comments SET text = $1 WHERE id = $2 RETURNING *';
        const result = await executeQuery(sql, [text, commentId]);
        const rows = result.rows ? result.rows : [];

        if (rows.length === 0) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error});
    }
});

//like and dislike comment
blogRouter.put("/comment/like", jwtAuth, async (req,res) => {
    console.log("comment like called");
    const likeStatus = req.body.like_status;
    try {
        let likeResult
        if(likeStatus == "like"){
            likeResult = await likeComment(req.body.user_id, req.body.comment_id, req.body.post_id);
        } else if (likeStatus == "dislike"){
            likeResult = await dislikeComment(req.body.comment_id);
        } else {
            console.log("like status error");
        }
        res.status(200).json(likeResult);

    } catch (error) {
        res.status(500).json({error: error});
    }
})

async function likeComment(user_id, comment_id, post_id) {
    try {
        const sql = 'INSERT INTO user_comment_likes (user_id, comment_id, post_id) VALUES ($1, $2, $3)';
        const result = await executeQuery(sql, [user_id, comment_id, post_id]);

        if(result.rowCount > 0) {
            const updateSql = 'UPDATE comments SET likes = likes + 1 WHERE id = $1 RETURNING likes';
            const updateResult = await executeQuery(updateSql, [comment_id]);
            const rows = updateResult.rows ? updateResult.rows : [];
            return rows;
        }
    } catch (error) {
        return error;
    }
}
async function dislikeComment(comment_id) {
    try {
        const sql = 'DELETE from user_comment_likes WHERE comment_id = $1';
        const result = await executeQuery(sql, [comment_id]);

        if(result.rowCount > 0){
            const updateSql = 'UPDATE comments SET likes = likes - 1 WHERE id = $1 RETURNING likes';
            const updateResult = await executeQuery(updateSql, [comment_id]);
            const rows = updateResult.rows ? updateResult.rows : [];
            return rows;
        }
    } catch (error) {
        return error;
    }
}
blogRouter.get("/:id/posts/likes", async (req,res) => {
    const id = parseInt(req.params.id);
    try {
        const sql = 'SELECT post_id from user_post_likes WHERE user_id = $1';
        const result = await executeQuery(sql, [id]);
        const rows = result.rows ? result.rows : [];
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({error: error});
    }
})
//like dislike post
blogRouter.put("/post/like", jwtAuth, async (req,res) => {
    const likeStatus = req.body.like_status;
    try {
        let likeResult
        if(likeStatus == "like"){
            likeResult = await likePost(req.body.user_id, req.body.post_id);
        } else if (likeStatus == "dislike"){
            likeResult = await dislikePost(req.body.post_id);
        } 
        res.status(200).json(likeResult);
    } catch (error) {
        res.status(500).json({error: error});
    }
})

async function likePost(user_id, post_id) {
    try {
        const sql = 'INSERT INTO user_post_likes (user_id, post_id) VALUES ($1, $2)';
        const result = await executeQuery(sql, [user_id, post_id]);

        if(result.rowCount > 0) {
            const updateSql = 'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes';
            const updateResult = await executeQuery(updateSql, [post_id]);
            const rows = updateResult.rows ? updateResult.rows : [];
            return rows;
        }
    } catch (error) {
        return error;
    }
}
async function dislikePost(post_id) {
    try {
        const sql = 'DELETE from user_post_likes WHERE post_id = $1';
        const result = await executeQuery(sql, [post_id]);
        console.log(result, "dislike result");

        if(result.rowCount > 0){
            const updateSql = 'UPDATE posts SET likes = likes - 1 WHERE id = $1 RETURNING likes';
            const updateResult = await executeQuery(updateSql, [post_id]);
            const rows = updateResult.rows ? updateResult.rows : [];
            return rows;
        }
    } catch (error) {
        return error;
    }
}


module.exports = {blogRouter}