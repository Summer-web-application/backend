//-----------USERS QUERIES-----------
//get all users
const getUsers = "SELECT * FROM users";
//get user by id
const getUserById = "SELECT * FROM users WHERE id = $1";
//check if email already exists
const checkEmail = "SELECT s FROM users s WHERE s.email = $1";
//create new user
const addUser = "INSERT INTO users (first_name, last_name, email, password, username) VALUES ($1, $2, $3, $4, $5)";
//delete user
const removeUser = "DELETE FROM users WHERE id = $1";
//update user name
const updateUser = "UPDATE users SET first_name = $1 WHERE id = $2";
//get users post likes
const getPostLikes = "SELECT post_id FROM user_post_likes WHERE user_id = $1";
//get users comment likes
const getCommentLikes = "SELECT comment_id from user_comment_likes WHERE user_id = $1";

//----------POSTS QUERIES------------
//get all posts
const getPosts = "SELECT posts.*, users.first_name, users.last_name FROM posts JOIN users ON posts.user_id = users.id";
//get post by id
const getPostById = "SELECT posts.*, users.first_name, users.last_name, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1";
//get all users posts
const getUserPosts = "SELECT * FROM posts WHERE user_id = $1";
// create new post
const createPost = "INSERT INTO posts (text, likes, user_id) VALUES ($1, $2, $3)";
// delete post by id
const deletePostById = "DELETE FROM posts WHERE id = $1";
//like post
const likePost = "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes";

//----------COMMENTS QUERIES---------
//get comments by post
const getCommentsByPost = "SELECT comments.*, users.first_name, users.last_name, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1";
//get all comments
const getAllComments = "SELECT * FROM comments";
//create new comment to post
//const createNewComment = "INSERT INTO comments (text, likes, post_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *, users.first_name, users.last_name, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1";
const createAndReturnComment = "WITH inserted_comment AS(INSERT INTO comments (text, likes, post_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *) SELECT inserted_comment.*, users.first_name, users.last_name, users.username FROM inserted_comment JOIN users ON inserted_comment.user_id = users.id WHERE inserted_comment.post_id = $3";
//delete comment by id
const deleteCommentById  = "DELETE FROM comments WHERE id = $1";
// like comment
//const likeComment = "WITH updated_comment AS (UPDATE comments SET likes = likes + 1 WHERE id = $1 RETURNING likes), inserted_like AS (INSERT INTO user_comment_likes (user_id, comment_id) VALUES ($2, $1) ON CONFLICT (user_id, comment_id) DO NOTHING) SELECT likes from updated_comment";
const likeComment = "INSERT INTO user_comment_likes (user_id, comment_id) VALUES ($2, $1)";
// dislike comment
const dislikeComment = "UPDATE comments SET likes = likes -1 WHERE id = $1 RETURNING likes"
module.exports = {
    getUsers,
    getUserById,
    checkEmail,
    addUser,
    removeUser,
    updateUser,
    getPostLikes,
    getCommentLikes,

    getPosts,
    getPostById,
    getUserPosts,
    createPost,
    deletePostById,
    likePost,

    getCommentsByPost,
    getAllComments,
    createAndReturnComment,
    deleteCommentById,
    likeComment,
    dislikeComment,
};