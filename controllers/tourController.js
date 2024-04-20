const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');

const factory = require('./handlerFactory');

const AppError = require('../utils/AppError');
const ApiFilter = require('../utils/AppFilter');
const catchAsync = require('../utils/CatchAsync');

// exports.checkId = (req, res, next, val) => {
//   const tour = tours.find((tour) => tour.id === val * 1);

//   if (!tour)
//     return res.status(400).json({ status: 'fail', message: 'Invalid ID !' });

//   next();
// };

// exports.bodyValidation = (req, res, next) => {
//   const data = req.body;

//   if (!data?.name)
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'A tour must have a name' });

//   if (!data?.price)
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'A tour must have a price' });

//   next();
// };

// ALIAS
exports.getTop5BestCheapTour = (req, res, next) => {
  req.query.sort = '-ratingsAverage price';
  req.query.page = 1;
  req.query.limit = 5;

  next();
};

exports.createTour = catchAsync(async (req, res) => {
  const tour = await Tour.create(req.body);

  return res.status(200).json({ status: 'success', data: { tour } });
});

exports.getTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { select: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// GEOSPATIAL
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, location, unit } = req.params;

  const [lat, long] = location.split(',');

  if (!lat || !long)
    return next(
      new AppError(400, 'Please provide a valid location (lat,long format)')
    );

  const radDistance = unit === 'mi' ? distance / 3959 : distance / 6371;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lat, long], radDistance] },
    },
  }).explain();

  return res
    .status(200)
    .json({ status: 'success', result: tours.length, data: { tours } });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { location, unit } = req.params;
  const [lng, lat] = location.split(',');

  if (!lng || !lat)
    return next(
      new AppError(400, 'Please provide a valid location (lat,long format)')
    );

  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  const result = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
  ]);

  return res.status(200).json({ status: 'success', data: { result } });
});

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] !== 'image')
    return cb(
      new AppError(
        400,
        `Just image is acceptable (not ${file.mimetype.split('/')[0]})`
      ),
      false
    );

  cb(null, true);
};

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // 1. Image cover
  const extension = req.files.imageCover[0].mimetype.split('/')[1];
  const imageCoverFileName = `tour-${
    req.params.id
  }-${Date.now()}-cover.${extension}`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFileName}`);

  req.body.imageCover = imageCoverFileName;

  // 2. Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (image, idx) => {
      const extension = image.mimetype.split('/')[1];
      const filename = `tour-${req.params.id}-${Date.now()}-${
        idx + 1
      }.${extension}`;

      req.body.images.push(filename);

      return typeof (await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`));
    })
  );

  next();
});

const uploader = multer({ fileFilter, storage });
exports.uploadTourPhotos = uploader.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
