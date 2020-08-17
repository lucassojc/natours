const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (
  process.env.NODE_ENV === 'development' //log only if we are in development mode
) {
  app.use(morgan('dev')); //HTTP request logger middleware
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, please try again in an hour.',
}); // allow 100 request form the same IP per hour
app.use('/api', limiter); // apply to all routs that start with /api

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' })); // if we have body larger than 10kb it will not be accepted

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // remove all $ and . from req.body and req.params

// Data sanitization against XSS attacks
app.use(xss()); // remove all user input with html code with attached js

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ], // white list of properties that we allow to be polluted
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTE HANDLERS

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  ); // whatever we pass into next express will know that this is an error, this will skip all middlewares between and go straight to error middleware
}); // handling unhandled routes

app.use(globalErrorHandler); //error handling middleware

module.exports = app;
