const express = require('express');

const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const bookingRouter = express.Router();

bookingRouter
  .route('/')
  .get(bookingController.getBookings)
  .post(bookingController.createBooking);

bookingRouter
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

bookingRouter.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.createSession
);

module.exports = bookingRouter;
