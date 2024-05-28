//-----------USERS QUERIES-----------
//get all users
const getUsers = "SELECT * FROM users";
//get user by id
const getUserById = "SELECT * FROM users WHERE id = $1";
//check if email already exists
const checkEmail = "SELECT s FROM users s WHERE s.email = $1";
//create new user
const addUser = "INSERT INTO users (first_name, last_name, email, password, age, dob) VALUES ($1, $2, $3, $4, $5, $6)";
//delete user
const removeUser = "DELETE FROM users WHERE id = $1";
//update user name
const updateUser = "UPDATE users SET first_name = $1 WHERE id = $2";

//----------POSTS QUERIES------------
//get all posts
const getPosts = "SELECT posts.*, users.first_name, users.last_name FROM posts JOIN users ON posts.user_id = users.id";
//get post by id
const getPostById = "SELECT * FROM posts WHERE id = $1";
//get all users posts
const getUserPosts = "SELECT * FROM posts WHERE user_id = $1";
// create new post
const createPost = "INSERT INTO posts (header, text, likes, user_id) VALUES ($1, $2, $3, $4)";
// delete post by id
const deletePostById = "DELETE FROM posts WHERE id = $1";

//----------COMMENTS QUERIES---------
//get comments by post
const getCommentsByPost = "SELECT * FROM comments WHERE post_id = $1";
//create new comment to post
const createNewComment = "INSERT INTO comments (text, likes, post_id, user_id) VALUES ($1, $2, $3, $4)";
//delete comment by id
const deleteCommentById  = "DELETE FROM comments WHERE id = $1";

module.exports = {
    getUsers,
    getUserById,
    checkEmail,
    addUser,
    removeUser,
    updateUser,

    getPosts,
    getPostById,
    getUserPosts,
    createPost,
    deletePostById,

    getCommentsByPost,
    createNewComment,
    deleteCommentById,
};