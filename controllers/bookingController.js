const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

exports.createSession = catchAsync(async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}`;

  // 1. Get tour
  const tour = await Tour.findById(req.params.tourId);

  // 2. Create session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${url}?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${url}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tour.id,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  return res.status(200).json({ status: 'success', session });
});

exports.checkedout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });
  return res.redirect(req.originalUrl.split('?')[0]);
});

// CRUD
exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
