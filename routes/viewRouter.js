const express = require('express');

const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');
const bookingController = require('../controllers/bookingController');

const viewRouter = express.Router();

// routes
viewRouter.get(
  '/',
  bookingController.checkedout,
  authController.isLoggedIn,
  viewController.getOverview
);
viewRouter.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTour
);
viewRouter.get('/login', authController.isLoggedIn, viewController.getLogin);

viewRouter.get('/me', authController.protect, viewController.getMe);

// viewRouter.post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUser
// );

viewRouter.get(
  '/my-bookings',
  authController.protect,
  viewController.getMyBookings
);

module.exports = viewRouter;
