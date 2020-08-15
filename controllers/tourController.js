const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (
  req,
  res,
  next
) => {
  req.query.limit = '5';
  req.query.sort =
    '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (
  req,
  res
) => {
  try {
    console.log(req.query);

    // EXECUTE QUERY
    const features = new APIFeatures(
      Tour.find(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate(); // this chaining works only because after each method we returned 'this'

    const tours = await features.query;
    // query.sort().select().skip().limit() // example of one query

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(
      req.params.id
    ); // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.createTour = async (
  req,
  res
) => {
  try {
    const newTour = await Tour.create(
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.updateTour = async (
  req,
  res
) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // return newly created document
        runValidators: true, // run validators when updating
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid data sent!',
    });
  }
};

exports.deleteTour = async (
  req,
  res
) => {
  try {
    await Tour.findByIdAndDelete(
      req.params.id
    );

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid data sent!',
    });
  }
};

exports.getTourStats = async (
  req,
  res
) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async (
  req,
  res
) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', // destracture startDates for each document, so we have only one startDate per document instead of array of dates
      },
      {
        $match: {
          startDates: {
            $gte: new Date(
              `${year}-01-01`
            ),
            $lte: new Date(
              `${year}-12-31`
            ),
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
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message,
    });
  }
};
