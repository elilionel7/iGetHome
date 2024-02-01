const { check, body } = require('express-validator');
const moment = require('moment');

const { handleValidationErrors } = require('./validation');

const validateSpotCreation = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city').exists({ checkFalsy: true }).withMessage('City is required'),
  check('state').exists({ checkFalsy: true }).withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude is not valid'),
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude is not valid'),
  check('name')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price per day is required'),
  handleValidationErrors,
];

const validateSpotEdit = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city').exists({ checkFalsy: true }).withMessage('City is required'),
  check('state').exists({ checkFalsy: true }).withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude is not valid'),
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude is not valid'),
  check('name')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price per day is required'),
  handleValidationErrors,
];

const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors,
];

const validateBooking = [
  body('startDate').not().isEmpty().withMessage('Start date is required'),
  body('endDate')
    .not()
    .isEmpty()
    .withMessage('End date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date cannot be on or before start date');
      }
      return true;
    }),

  handleValidationErrors,
];

const validateBookingDates = [
  check('startDate', 'Start date is required').not().isEmpty(),
  check('endDate', 'End date is required').not().isEmpty(),
  check('endDate').custom((endDate, { req }) => {
    const startDate = req.body.startDate;
    if (moment(startDate).isAfter(endDate)) {
      throw new Error('endDate cannot come before startDate');
    }
    return true;
  }),
  handleValidationErrors,
];
module.exports = {
  validateSpotCreation,
  validateSpotEdit,
  validateBooking,
  validateReview,
  validateBookingDates,
};
