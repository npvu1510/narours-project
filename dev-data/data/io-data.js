const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(path.join('dev-data', 'data', 'tours.json'), 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(path.join('dev-data', 'data', 'users.json'), 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(path.join('dev-data', 'data', 'reviews.json'), 'utf-8')
);

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    process.exit(0);
  } catch (err) {
    console.log('ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log(err);
  }
};

const exportData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
  } catch (err) {
    console.log(err);
  }
};

const mongoose = require('mongoose');

const db = mongoose
  .connect(process.env.DB_URI.replace(/<password>/g, process.env.DB_PASSWORD))
  .then(conn => {
    console.log('Connected to MongoDB !');

    if (process.argv[2] === '--i') {
      importData();
    } else if (process.argv[2] === '--d') exportData();

    console.log(process.argv);
  })
  .catch(err => console.log(err.message));
