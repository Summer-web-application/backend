const {Router} = require('express');
const controller = require('./controller');
const router = Router();

//---------USER ROUTES-----------
router.get('/users', controller.getUsers);
router.get('/user/:id', controller.getUserById);
router.post('/register', controller.addUser);
router.post('/login', controller.loginUser);
router.delete('/users/:id', controller.removeUser);
router.put('/users/:id', controller.updateUser);

//---------POSTS ROUTES----------
router.get('/posts', controller.getPosts);
router.get('/posts/:id', controller.getPostById);
router.get('/user/posts/:id', controller.getUserPosts)
router.post('/user/posts', controller.createNewPost);
router.delete('/posts/:id',controller.deletePostById);

//---------COMMENTS ROUTES-------
router.get('/posts/:id/comments',controller.getCommentsByPost);
router.get('/comments', controller.getAllComments);
router.post('/comment', controller.createNewComment);
router.delete('/posts/comments/:id', controller.deleteCommentById);

//---------LIKES ROUTES----------
router.get('/user/posts/likes/:id', controller.userPostsLikes);
router.get('/user/comments/likes/:id', controller.userCommentsLikes);
router.put('/post/like', controller.likePost);
router.put('/comment/like', controller.likeComment);
module.exports = router;