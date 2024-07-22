require('dotenv').config();
const pool = require('../../db');
const queries = require('./queries');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//----------USER HANDLER FUNCTIONS----------
//suoraan sql
//maybe use helpers to query database in db.js
//change functions to async
//auth check when deleting and creating.

//get all users
const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};
//get user by id
const getUserById = (req,res) => {
    const id  = parseInt(req.params.id);
    pool.query(queries.getUserById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};
//add new user
const addUser = async (req, res) => {
    const { first_name, last_name, username, email, password} = req.body;

    try {
        const emailCheckResult = await pool.query(queries.checkEmail, [email]);
        if(emailCheckResult.rows.length) {
            res.send("Email already exists.");
            return;
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(queries.addUser, [first_name, last_name, email, hashedPassword, username]);
            res.status(201).send("User created");
            console.log("User created");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
}
// login user
const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        const sql = "SELECT * FROM users WHERE email = $1";
        const result = await pool.query(sql, [email]);
        if(result.rows.length) {
            bcrypt.compare(password, result.rows[0].password, (err, bcrypt_res) => {
                if(!err && bcrypt_res === true) {
                    const user = result.rows[0];

                    const token = jwt.sign({ id:user.id}, process.env.JWT_SECRET_KEY);

                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None',
                    });

                    res.status(200).json({
                        id: user.id,
                        email: user.email,
                        username: user.username,
                    });
                } else {
                    res.status(401).send("Login failed");
                }
            })
        } else {
            res.status(401).send("Invalid login");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
}
//delete user
//database foreign keys as cascade so related posts and comments are deleted with the user.
const removeUser = (req,res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getUserById, [id], (error, results) => {
        const noUserFound = !results.rows.length;
        if(noUserFound){
            res.send("User does not exist.");
        }
    pool.query(queries.removeUser, [id], (error,results) => {
        if(error) throw error;
        res.status(200).send("User deleted");
    });
    });
}
//update user name. Maybe not needed. 
const updateUser = (req,res) => {
    const id = parseInt(req.params.id);
    const {first_name} = req.body;

    pool.query(queries.getUserById, [id], (error,results) => {
        const noUserFound = !results.rows.length;
        if(noUserFound){
            res.send("User does not exist.");
        }

        pool.query(queries.updateUser, [first_name, id], (error,results) => {
            if(error) throw error;
            res.status(200).send("User updated");
        });
    });
}
//---------POST HANDLER FUNCTIONS----------
const getPosts = (req,res) => {
    pool.query(queries.getPosts, (error,results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
};

const getPostById = (req,res) => {
    const id  = parseInt(req.params.id);
    console.log(id, "id in backend");
    pool.query(queries.getPostById, [id], (error,results) => {
        if(error) throw error;
        const post = results.rows[0];
        res.status(200).json({
            first_name: post.first_name,
            last_name: post.last_name,
            username: post.username,
            text: post.text,
            created_at: post.created_at,
            likes: post.likes
        });
        console.log("getPostById");
    })
}

//called when viewing users profile
const getUserPosts = (req,res) => {
    const user_id = parseInt(req.params.id);
    pool.query(queries.getUserPosts, [user_id], (error,results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
        console.log("getUserPosts");
    })
}

const createNewPost = (req,res) => {
    const likes = 0;
    const {text, user_id, image} = req.body;
    console.log(image, "received imageData");
    console.log(text, user_id, "bodyData");
    pool.query(queries.createPost, [text, likes, user_id], (error, results) => {
        if(error) throw error;
        res.status(201).send("Post created");
            console.log("Post created");
    });
}

const deletePostById = (req,res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.deletePostById, [id], (error,results) => {
        if(error) throw error;
        res.status(201).send("Post deleted");
        console.log("Post deleted");
    })
}
//---------COMMENT HANDLER FUNCTIONS-------
const getCommentsByPost = (req,res) => {
    const post_id = parseInt(req.params.id);
    pool.query(queries.getCommentsByPost, [post_id], (error,results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    });
}
const getAllComments = (req,res) => {
    pool.query(queries.getAllComments, (error,results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    }) 
}
const createNewComment = (req, res) => {
    const {text, postId, userId} = req.body;
    const likes = 0;
    console.log(text, " text", postId, " postid", userId, " userid");
    pool.query(queries.createAndReturnComment, [text, likes, postId, userId], (error,results) => {
        if (error) throw error;

        const newComment = results.rows[0];
        console.log(newComment, " newComment");
        res.status(201).json(newComment);
    });
}
const deleteCommentById  = (req,res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.deleteCommentById, [id], (error, results) => {
        if(error) throw error;
        res.status(201).send("Comment deleted");
        console.log("Comment deleted");
    })
}
//------LIKES HANDLER FUNCTIONS--------
const userPostsLikes = (req,res) => {

}

const userCommentsLikes = (req,res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getCommentLikes, [id], (error,results) => {
        if(error) throw error;
        const likes = results.rows.map(row => row.comment_id);
        res.status(200).json(results.rows[{likes}]);
    })
}
const likePost = (req,res) => {

}
const likeComment = (req, res) => {
    const {comment_id, user_id} = req.body;
    console.log(comment_id , user_id , " received id's");
    pool.query(queries.likeComment, [comment_id, user_id], (error, results) => {
        if (error) throw error;
        
        const updatedLikes = results.rows[0];
        console.log(updatedLikes + " updated like count");
        res.status(201).send("like relation created");
        //res.status(201).json(updatedLikes);
    })
}


module.exports = {
    getUsers,
    getUserById,
    addUser,
    loginUser,
    removeUser,
    updateUser,
    
    getPosts,
    getPostById,
    getUserPosts,
    createNewPost,
    deletePostById,

    getCommentsByPost,
    getAllComments,
    createNewComment,
    deleteCommentById,

    userPostsLikes,
    userCommentsLikes,
    likeComment,
    likePost,
};