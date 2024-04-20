const signToken = require('./signToken');

const createSendToken = (res, statusCode, user) => {
  const token = signToken({ id: user._id });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  return res
    .status(statusCode)
    .json({ status: 'success', token, data: { user } });
};

module.exports = createSendToken;
