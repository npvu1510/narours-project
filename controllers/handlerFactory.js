const ApiFilter = require('../utils/AppFilter');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const result = new ApiFilter(req.query, Model.find(filter))
      .filter()
      .sort()
      .select()
      .pageLimit();

    const docs = await result.queryResult;

    return res
      .status(200)
      .json({ status: 'success', result: docs.length, data: { docs } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    console.log('getOne');
    console.log(req.params);
    let result = Model.findById(req.params.id);

    if (popOptions) result = result.populate({ path: 'reviews' });

    const doc = await result;

    if (!doc) return next(new AppError(404, 'Invalid ID !!!'));

    return res.status(201).json({ status: 'success', data: { doc } });
  });

exports.createOne = Model =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    return res.status(200).json({ status: 'success', data: { doc } });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const updateData = req.body;

    const updatedDoc = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) return next(new AppError(404, 'Invalid ID !'));

    return res.status(200).json({ status: 'success', data: { updatedDoc } });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError(404, 'Invalid ID !'));

    return res.status(204).json({ status: 'success', data: null });
  });
