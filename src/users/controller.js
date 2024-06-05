require('dotenv').config();
const pool = require('../../db');
const queries = require('./queries');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//----------USER HANDLER FUNCTIONS----------
//suoraan sql
//maybe use helpers to query database in db.js
//change functions to async
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

                    res.status(200).json({
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        token: token
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
    pool.query(queries.getPostById, [id], (error,results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
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
    const {header, text, likes, user_id} = req.body;
    pool.query(queries.createPost, [header, text, likes, user_id], (error, results) => {
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
    const {text, likes, post_id, user_id} = req.body;
    pool.query(queries.createNewComment, [text, likes, post_id, user_id], (error,results) => {
        if (error) throw error;
        res.status(201).send("Comment created");
        console.log("Comment created");
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
};