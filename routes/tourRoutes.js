const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param(
//   'id',
//   tourController.checkID
// );

router.use('/:tourId/reviews', reviewRouter); // router is just middleware so we can use(), on this specific route reviewRouter (exactly the same we did in app.js)

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

module.exports = router;
