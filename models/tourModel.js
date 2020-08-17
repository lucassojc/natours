const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equal 40 characters!',
      ],
      minlength: [
        10,
        'A tour name must have at least 10 characters!',
      ],
      // validate: [
      //   validator.isAlpha,
      //   'A tour name must only contain characters.',
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'The tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty is either "easy", "medium" or "difficult".',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0!'],
      max: [5, 'Rating must be below 5.0!'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // this only points to the current document on NEW document creation
          return value < this.price;
        }, // custom validator for checking if price discount is lower then price
        message:
          'Discount price ({VALUE}) should be below regular price.',
      },
    },
    summary: {
      type: String,
      trim: true, //cut white space
      required: [true, 'A tour must have a description!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image!'],
    },
    images: [String], //array of strings for more image paths
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // always hide this field from output (disable selection in Controller)
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], // set to only point
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  } // set these two if we have virtuals
); // second object in mongoose Schema is reserved for options

// VIRTUAL properties - when we don't need it in database.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
}); // we use normal function , because arrow function don't have this keyword, here this is pointing to the current document

// DOCUMENT Middleware: runs before .save() and .create() *********************************************************************
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  }); // .this is the currently processed document
  next();
}); // save point to the current document

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (
//   doc,
//   next
// ) {
//   console.log(doc);
//   next();
// }); // runs after .save()

// QUERY Middleware : runs before find()
tourSchema.pre(/^find/, function (next) {
  //with regular expression we are handling find() and findOne(), so user can't get secret tour with findById
  // tourSchema.pre('find', function (next) {
  this.find({
    secretTour: { $ne: true },
  });

  this.start = Date.now();
  next();
}); // find point to the current query

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Query took ${
      Date.now() - this.start //measure time from pre to post middleware
    } milliseconds`
  );
  next();
});

// AGGREGATION Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    }, // exclude secret tour from aggregation
  });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
