const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const userRouter = express.Router();

// AUTHENTICATION
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.post('/logout', authController.logout);
userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);
userRouter.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

// AUTHENTICATION GATE
userRouter.use(authController.protect);

// FOR ME
userRouter.get('/get-me', userController.getMe, userController.getUser);
userRouter.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

userRouter.patch('/delete-me', userController.deleteMe);

// RESTRICT TO ROLES
userRouter.route(authController.restrictTo('admin'));

// FOR ADMINIDTRATORS
userRouter.route('/').get(userController.getUsers);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateCheck, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
