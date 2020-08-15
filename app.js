const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (
  process.env.NODE_ENV === 'development' //log only if we are in development mode
) {
  app.use(morgan('dev')); //HTTP request logger middleware
}
app.use(express.json()); //middleware for converting body to json
app.use(
  express.static(`${__dirname}/public`)
);

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

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // next();

  const err = new Error(
    `Can't find ${req.originalUrl} on this server!`
  );
  err.status = 'fail';
  err.statusCode = 404;

  next(err); // whatever we pass into next express will know that this is an error, this will skip all middlewares between and go straight to error middleware
}); // handling unhandled routes

app.use((err, req, res, next) => {
  err.statusCode =
    err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
}); //error handling middleware

module.exports = app;
