const express = require('express');

const reviewRouter = require('./reviewRouter');

const authController = require('../controllers/authController');
const tourController = require('../controllers/tourController');

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

// MIDDLEWARE STACK
// param middlewware
// tourRouter.param('id', tourController.checkId);

// ALIAS ROUTES
tourRouter
  .route('/top-5-best-cheap-tours')
  .get(tourController.getTop5BestCheapTour, tourController.getTours);

// GEOSPATIAL DATA QUERY
// /tour-within/distance/location/lat,long/unit/:unit
tourRouter.get(
  '/tour-within/:distance/location/:location/unit/:unit',
  tourController.getTourWithin
);

tourRouter.get('/distances/:location/unit/:unit', tourController.getDistances);

// ROUTES
tourRouter
  .route('/')
  .get(tourController.getTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourPhotos,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRouter;
