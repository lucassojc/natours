const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
    console.log(
      'DB connection established!'
    );
  });

// START SERVER

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `App running on port ${port}`
  );
});
