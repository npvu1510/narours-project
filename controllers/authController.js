const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const User = require('../models/userModel');

const AppError = require('../utils//AppError');
const catchAsync = require('../utils/CatchAsync');
const createSendToken = require('../utils/createSendToken');
const Email = require('../utils/Email');

exports.protect = catchAsync(async (req, res, next) => {
  // Input check (headers)
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : req.cookies?.jwt;

  if (!token) return next(new AppError(401, 'You are not logged in'));

  // Get token and payload
  if (!token) return next(new AppError(401, 'You are not logged in'));

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  // Token expired check
  if (parseInt(Date.now() / 1000) > payload.exp)
    return next(new AppError(401, 'Your token expired'));

  // User exist check
  const user = await User.findById(payload.id);
  if (!user) return next(new AppError(401, 'User does not exist'));

  // User change password check
  if (user.isPasswordChangedAfter(payload.iat))
    return next(new AppError(401, 'The user recently changed their password'));

  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const token = req?.cookies?.jwt;
  let payload;
  if (!token) return next();
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next();
  }
  // Token expired check
  if (parseInt(Date.now() / 1000) > payload.exp) return next();

  // User exist check
  const user = await User.findById(payload.id);
  if (!user) return next();

  // User change password check
  if (user.isPasswordChangedAfter(payload.iat)) return next();

  res.locals.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(401, 'You are not authorized to perform this action')
      );
    next();
  };

exports.signup = catchAsync(async (req, res) => {
  const newUser = await new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  }).save();

  await new Email(
    newUser,
    `${req.protocol}://${req.get('host')}/me`
  ).sendWelcome();

  createSendToken(res, 201, newUser);
});

exports.login = catchAsync(async (req, res, next) => {
  // check input (body)
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError(400, 'Email and password is required'));

  // check email or password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isPasswordCorrect(password)))
    return next(new AppError(404, 'Email or password is invalid'));

  // sign token
  createSendToken(res, 200, user);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // check request
  const email = req.body.email;
  if (!email) return next(new AppError(400, 'Email is required'));
  if (!validator.isEmail(email))
    return next(new AppError(400, 'Email is invalid'));

  // get user by email
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(404, "User doesn't exist"));

  // generate reset token
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // send mail attach token
    // await sendMail({
    //   from: '"NATOURS SERVICE" <npvu1510@gmail.com>',
    //   to: email,
    //   subject: 'Reset Password on Natours',
    //   text: `You recently requested a password recovery. To recover your password, click the link below:
    //   ${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/users/reset-password/${resetToken}
    //   If you don't do this then skip it.`,
    // });

    await new Email(
      user,
      `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/users/reset-password/${resetToken}`
    ).sendResetPassword();

    return res.status(200).json({
      status: 'success',
      message: 'Password reset request has been sent to your email',
    });
  } catch (error) {
    user.clearResetToken();
    await user.save({ validateBeforeSave: false });
    // Nếu sendMail thất bại, lỗi sẽ được bắt ở đây và chuyển đến global error handler
    return next(error);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // check input
  const resetToken = req.params.token;

  if (!resetToken) return next(new AppError(400, 'Request is invalid'));
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log(hashedToken);

  const password = req.body.password;
  if (!password) return next(new AppError(400, 'Password is required'));
  const passwordConfirm = req.body.passwordConfirm;
  if (!passwordConfirm)
    return next(new AppError(400, 'Password confirm is required'));

  // get user by reset token
  const user = await User.findOne({ resetToken: hashedToken });
  if (!user) return next(new AppError(400, 'Request is invalid'));
  console.log(user);

  // reset token expire check
  if (user.isResetTokenExpired())
    return next(new AppError(400, 'Request expired'));

  // reset password
  user.changePassword(password, passwordConfirm);
  user.clearResetToken();
  await user.save();

  return res.status(200).json({ status: 'success' });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get current user
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check current password
  if (!req.body.currentPassword)
    return next(new AppError(400, 'Current password is required'));

  if (!(await user.isPasswordCorrect(req.body.currentPassword)))
    return next(new AppError(400, 'Current password is wrong'));

  // 3. Change password
  user.changePassword(req.body.password, req.body.passwordConfirm);
  await user.save();

  // 4. Send token and login
  createSendToken(res, 200, user);
});
