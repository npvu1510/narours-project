const express = require('express');

const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .get(reviewController.getReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.createReviewBody,
    reviewController.createReview
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = reviewRouter;
