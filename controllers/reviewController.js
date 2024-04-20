const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.createReviewBody = (req, res, next) => {
  req.body.tour = req.params.tourId ? req.params.tourId : req.body.tour;
  req.body.user = req.user.id;

  next();
};

exports.getReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
