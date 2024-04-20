const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must have a name'],

      minLength: [10, 'A name must have length greater than 10 characters'],
      maxLength: [20, 'A name must have length less than 20 characters'],
      validate: {
        validator: function () {
          console.log('TOUR VALIDATE');
          return true;
        },
      },
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],

      // min: [2, 'A tour must have the number of members greater than 2'],
      // max: [20, 'A tour must have the number of members less than 20'],
    },

    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be easy or medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,

      min: [1.0, 'A tour rating must be greater than 1'],
      max: [5.0, 'A tour rating must be less than or equal 5'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],

      // min: [20, 'A price of tours must be greater than 20 dollars'],
      // max: [500, 'A price of tours must be less than 100 dollars'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (discount) {
          return discount < 70 && discount > 5;
        },
        message:
          'A discount of ({VALUE}) must be greater than 5% and less than 70%',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },

    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },

    images: [String],
    startDates: [Date],
    createdAt: { type: Date, default: Date.now(), select: false },
    secret: { type: Boolean, default: false },

    // geoJSON
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },

      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// VIRTUAL PROPERTIES
// tourSchema.virtual('slug').get(function () {
//   return slugify(this.name, { lower: true });
// });

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

// PRE, POST HOOKS
// document middleware
tourSchema.pre('save', function (next) {
  console.log('TOUR PRE SAVE');
  this.slug = slugify(this.name, { lower: true });
  next();
});

// TOUR GUIDE EMBEDDING
// tourSchema.pre('save', async function (next) {
//   const promises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(promises);
// });

// tourSchema.pre('save', function (next) {
//   console.log('PRE SAVE: ', this.name);
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log('SAVE POST', doc);
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log('The last post hook save middleware !');
//   next();
// });

// tourSchema.pre('init', function (doc) {
//   console.log('INIT:', doc.name);
// });

// tourSchema.pre('init', function (doc) {
//   console.log('THE LAST INIT MIDDLEWARE (WITHOUT NEXT)!');
// });

// query middleware
// tourSchema.pre(/^find/, function (next) {
//   console.log('Pre Find');
//   this.find({ secret: true });
//   next();
// });

// TOUR GUIDE REFERENCING
tourSchema.pre(/^find/, function (next) {
  console.log('TOUR PRE FIND');

  this.populate({ path: 'guides', select: 'name photo' });

  next();
});

// tourSchema.pre(/^find/, function (next) {
//   this.populate({ path: 'reviews', select: 'review rating -tour' });

//   next();
// });

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(docs);
//   next();
// });

// index
tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ price: -1, ratingsAverage: 1 });
tourSchema.index({ startLocation: '2dsphere' });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
