const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// router.param(
//   'id',
//   tourController.checkID
// );

router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    tourController.getAllTours
  ); // apply middleware for adding query params to our route (aliasTopTours)

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(
    authController.protect, // middleware for authentication (protect route)
    tourController.getAllTours
  )
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin'), // for more roles authController.restrictTo('admin', 'user')
    tourController.deleteTour
  );

// POST /tour/123124/reviews
// GET  /tour/123124/reviews
// GET  /tour/123124/reviews/2132131
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
