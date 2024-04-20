const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');

const factory = require('./handlerFactory');

const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

exports.updateCheck = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError(400, 'Password cannot update by this route !'));
  next();
};

// Only for administrators
exports.getUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// Only for me
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const filterBody = (body, allowFields) => {
  const newObj = {};
  Object.keys(body).forEach(field => {
    if (allowFields.includes(field)) newObj[field] = body[field];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // 1. Prevent change password
  if (req.body.password)
    return next(
      new AppError(
        400,
        'You cannot change password like this. Please use /update-password'
      )
    );

  // 2. Filter body
  const newBody = filterBody(req.body, ['name', 'email']);

  if (req.file) newBody.photo = req.file.filename;

  // 3. Update
  const updatedUser = await User.findByIdAndUpdate(req.user.id, newBody, {
    runValidators: true,
    new: true,
  });

  return res
    .status(200)
    .json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  return res.status(204).json({ status: 'success', data: null });
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log('STORAGE');
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     const fullname = `${req.user.id}-${Date.now()}.${extension}`;
//     return cb(null, fullname);
//   },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('FILTER');

  if (file.mimetype.split('/')[0] !== 'image')
    return cb(new AppError(400, 'Please provide a image'));
  else return cb(null, true);
};

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const extension = req.file.mimetype.split('/')[1];
  const filename = `user-${req.user.id}-${Date.now()}.${extension}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${filename}`);

  req.file.filename = filename;
  next();
});

const uploader = multer({ storage, fileFilter });
exports.uploadUserPhoto = uploader.single('photo');
