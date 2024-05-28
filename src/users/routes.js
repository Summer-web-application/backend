const {Router} = require('express');
const controller = require('./controller');
const router = Router();

//---------USER ROUTES-----------
router.get('/users', controller.getUsers);
router.get('/user/:id', controller.getUserById);
router.post('/users', controller.addUser);
router.delete('/users/:id', controller.removeUser);
router.put('/users/:id', controller.updateUser);

//---------POSTS ROUTES----------
router.get('/posts', controller.getPosts);
router.get('/posts/:id', controller.getPostById);
router.get('/user/posts/:id', controller.getUserPosts)
router.post('/user/posts', controller.createNewPost);
router.delete('posts/:id',controller.deletePostById);

//---------COMMENTS ROUTES-------
router.get('/posts/:id/comments',controller.getCommentsByPost);
router.post('/posts/comments', controller.createNewComment);
router.delete('/posts/comments/:id', controller.deleteCommentById);

module.exports = router;