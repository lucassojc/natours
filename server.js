const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(
    'UNHANDLED EXCEPTION! Shutting down...'
  );
  console.log(err.name, err.message);
  process.exit(1); // shut down app
});

dotenv.config({ path: './config.env' }); //read our configuration files and save them to NODE.js

const app = require('./app');
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection established!');
  });

// START SERVER

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(
    'UNHANDLED REJECTION! Shutting down...'
  );
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // shut down app
  });
});
