const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    trim: true,

    required: true,
    minlength: 3,

    validate: {
      validator: function (val) {
        console.log('REVIEW VALIDATE');
        return true;
      },
    },
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },

  createdAt: { type: Date, default: Date.now() },

  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  },
});

// Middleware
// document
reviewSchema.pre('save', function (next) {
  console.log('REVIEW PRE SAVE');
  next();
});

reviewSchema.post('save', async function (doc, next) {
  console.log('REVIEW POST SAVE');
  console.log(this === doc);

  await doc.constructor.calcAverage(doc.tour);
  next();
});

// query
reviewSchema.pre(/^find/, function (next) {
  console.log('REVIEW PRE FIND');

  this.populate({ path: 'user', select: 'name email photo' });
  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  await doc.constructor.calcAverage(doc.tour);

  next();
});

// static method
reviewSchema.statics.calcAverage = async function (tour) {
  const result = await this.aggregate([
    { $match: { tour } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tour, {
    ratingsAverage: result[0].avgRating,
    ratingsQuantity: result[0].nRating,
  });
};

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
