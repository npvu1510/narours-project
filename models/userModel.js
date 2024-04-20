const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide us your name'],
      validate: {
        validator: function (val) {
          console.log('USER VALIDATE');
          return true;
        },
      },
    },
    role: {
      type: String,
      default: 'user',
      enum: { values: ['admin', 'vip-user', 'user'] },
    },
    email: {
      type: String,
      trim: true,
      lower: true,
      unique: true,
      required: [true, 'Please provide us your email'],
      validate: [validator.isEmail, 'Email is invalid'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },

    password: {
      type: String,
      select: false,
      required: [true, 'Please provide us you password'],

      minLength: [6, 'A password must have a length >= 6'],
    },

    passwordConfirm: {
      type: String,
      select: false,
      required: [true, 'Please confirm your password'],

      // CREATE, SAVE, NOT UPDATE (THIS undefined)
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password and password confirm don't match",
      },
    },

    lastPasswordChangedAt: { type: Date, default: Date.now() },

    resetToken: { type: String },
    resetTokenExp: { type: Date },

    active: { type: Boolean, default: true, select: false },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// VIRTUAL PROPERTIES
userSchema.virtual('upperCaseName').get(function () {
  return this.name.toUpperCase();
});

// ################# MIDDLEWARE #################
// document middleware (pre, post hooks)
// create, save not update
userSchema.pre('save', async function (next) {
  console.log('USER PRE SAVE');

  if (!this.isModified('password')) return next();

  const hashedPassword = await bcrypt.hash(this.password, 12);

  this.password = hashedPassword;
  this.passwordConfirm = null;
  this.lastPasswordChangedAt = Date.now();

  next();
});

// query middleware
userSchema.pre(/^find/, function (next) {
  console.log('USER PRE FIND');

  this.find({ active: { $ne: false } });

  next();
});

// ################# METHODS #################
userSchema.methods.isPasswordCorrect = async function (password) {
  console.log(password, this.password);
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isPasswordChangedAfter = function (issueAt) {
  return parseInt(this.lastPasswordChangedAt / 1000) > issueAt;
};

userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  this.resetToken = hashedToken;
  this.resetTokenExp = Date.now() + 10 * 60 * 1000;

  return token;
};

userSchema.methods.isResetTokenExpired = function () {
  //   console.log(Date.now(), this.resetTokenExp.getTime());
  return Date.now() > this.resetTokenExp.getTime();
};

userSchema.methods.changePassword = function (newPassword, passwordConfirm) {
  this.password = newPassword;
  this.passwordConfirm = passwordConfirm;
};

userSchema.methods.clearResetToken = function () {
  this.resetToken = null;
  this.resetTokenExp = null;
};

const User = mongoose.model('User', userSchema);

// KIỂM TRA MIDDLEWARE 'SAVE' và bcrypt
// const newUser = new User({
//   name: 'Nguyen Phan Vu',
//   email: 'npvu1510@gmail.com',
//   password: 'Phanvu2001',
//   passwordConfirm: 'Phanvu2001',
//   test: 'abc',
// });

// newUser
//   .save()
//   .then(user => console.log(user))
//   .catch(err => console.log(err));

// ################# KIỂM TRA UPDATE THÌ MIDDLEWARE 'SAVE' CÓ CHẠY KHÔNG ? KHÔNG
// ################# KIỂM TRA UPDATE THÌ VALIDATOR CÓ DÙNG ĐƯỢC THIS KHÔNG ? KHÔNG
// User.findByIdAndUpdate(
//   '655d92d48e241f48c802e7a7',
//   { email: 'pvudevil@gmail.com', password: 'npvu1510', test: 'test' },
//   { new: true, runValidators: true }
// )
//   .then(user => console.log('success'))
//   .catch(err => console.log(err));

// ################# KIỂM TRA INSERT MANY THÌ MIDDLEWARE 'SAVE' CÓ CHẠY KHÔNG ? KHÔNG
// User.insertMany([
//   {
//     name: 'Nguyen Phan Vu',
//     email: 'npvu1510@gmail.com',
//     password: 'Phanvu2001',
//     passwordConfirm: 'Phanvu2001',
//     test: 'abc',
//   },
//   {
//     name: 'Nguyen Phan Vu 1',
//     email: 'npvu1511@gmail.com',
//     password: 'Phanvu2001',
//     passwordConfirm: 'Phanvu2001',
//     test: 'abc',
//   },
//   {
//     name: 'Nguyen Phan Vu 2',
//     email: 'npvu1512@gmail.com',
//     password: 'Phanvu2001',
//     passwordConfirm: 'Phanvu2001',
//     test: 'abc',
//   },
// ])
//   .then(users => console.log(users))
//   .catch(err => console.log(err));

// KIỂM TRA SELECT: FALSE
// User.find({})
//   .then(users => console.log(users))
//   .catch(err => console.log(err));

module.exports = User;
