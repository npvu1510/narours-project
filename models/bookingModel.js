const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A booking must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A booking must belong to a user'],
    },

    price: {
      type: Number,
      required: [true, 'A booking must have a price'],
    },

    bookedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toJSON: { virtuals: true }, toJSON: { virtuals: true } }
);

// MIDDLEWARES
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name price' });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
