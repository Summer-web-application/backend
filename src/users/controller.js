const pool = require('../../db');
const queries = require('./queries');

//----------USER HANDLER FUNCTIONS----------
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
const addUser = (req, res) => {
    const { first_name, last_name, email, password, age, dob} = req.body;
    pool.query(queries.checkEmail, [email], (error,results) => {
        if(results.rows.length){
            res.send("Email already exists.");
        }
        pool.query(queries.addUser, [first_name, last_name, email, password, age, dob], (error, results) => {
            if(error) throw error;
            res.status(201).send("User created");
            console.log("User created");
        })
    });
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
    const id = (req.body.id);
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
    removeUser,
    updateUser,

    getPosts,
    getPostById,
    getUserPosts,
    createNewPost,
    deletePostById,

    getCommentsByPost,
    createNewComment,
    deleteCommentById,
};