const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/CatchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. Get tours
  const tours = await Tour.find();

  // 2. Build template

  // 3. Render that template using tour data from

  return res.status(200).render('overview', { title: 'All tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get tour by slug
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) return next(new AppError(404, 'Invalid tour'));

  return res.status(200).render('tour', { title: tour.name, tour });
});

exports.getLogin = (req, res, next) => {
  return res.status(200).render('login', { title: 'Login' });
};

exports.getMe = (req, res) => {
  return res.status(200).render('account', { title: 'My account' });
};

exports.updateUser = catchAsync(async (req, res) => {
  const newUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { runValidators: true, new: true }
  );

  return res
    .status(200)
    .render('account', { title: 'My account', user: newUser });
});

exports.getMyBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map(booking => booking.tour.id);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  return res.status(200).render('overview', { title: 'My bookings', tours });
});
