const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      },
      {
        $group: {
          _id: {
            $toUpper: '$difficulty',
          },
          // _id: '$ratingsAverage', // 'null' calculate average for all groups
          numTours: { $sum: 1 }, // for each document which will go through pipeline 1 will be added to this numTours counter
          numRatings: {
            $sum: '$ratingsQuantity',
          },
          avgRating: {
            $avg: '$ratingsAverage',
          }, // calculate average rating

          avgPrice: { $avg: '$price' }, // calculate average price
          minPrice: { $min: '$price' }, // calculate minimum price
          maxPrice: { $max: '$price' }, // calculate maximum price
        },
      },
      {
        $sort: {
          avgPrice: 1, // 1 is ascending (avgPrice name we took from above)
        },
      },
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' }, // exclude all tours which are not 'EASY' , prof that we can match twice
      //   },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', // restructure startDates for each document, so we have only one startDate per document instead of array of dates
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: '$startDates',
          },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }, // make array of tour names
        },
      },
      {
        $addFields: { month: '$_id' }, // add field to show month
      },
      {
        $project: {
          _id: 0, // don't show _id field
        },
      },
      {
        $sort: { numTourStarts: -1 }, // sort descending
      },
      {
        $limit: 12, // allow only 12 outputs
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  }
);
