const express = require('express');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');
const { check } = require('express-validator');

const {
  Spot,
  Review,
  SpotImage,
  User,
  ReviewImage,
} = require('../../db/models');
const Sequelize = require('sequelize');

const router = express.Router();
//get all spot
router.get('/', async (req, res, next) => {
  try {
    const spots = await Spot.findAll({
      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          as: 'previewImage',
          attributes: ['url'],
          where: { preview: true },
          limit: 1,
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating'],
        ],
      },
      group: ['Spot.id'],
    });

    const Spots = spots.map((spot) => {
      let spotData = spot.get({ plain: true });
      spotData.avgRating = spot.dataValues.avgRating;
      spotData.previewImage =
        spot.previewImage.length > 0 ? spot.previewImage[0].url : null;
      return spotData;
    });

    res.status(200).json({ Spots: Spots });
  } catch (error) {
    next(error);
  }
});

// Get spot by current user
router.get('/current', restoreUser, requireAuth, async (req, res, next) => {
  try {
    const curUserId = req.user.id;

    const spots = await Spot.findAll({
      where: { ownerId: curUserId },
      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          as: 'previewImage',
          attributes: ['url'],
          where: { preview: true },
          limit: 1,
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating'],
        ],
      },
      group: ['Spot.id'],
    });

    const curSpots = spots.map((spot) => {
      let spotData = spot.get({ plain: true });
      spotData.avgRating = spot.dataValues.avgRating;
      spotData.previewImage =
        spot.previewImage.length > 0 ? spot.previewImage[0].url : null;
      return spotData;
    });

    res.status(200).json({ Spots: curSpots });
  } catch (error) {
    next(error);
  }
});

// Spot by id
router.get('/:spotId', async (req, res, next) => {
  try {
    const spotId = req.params.spotId;

    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          as: 'SpotImages',
          attributes: ['id', 'url', 'preview'],
        },
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('Reviews.id')), 'numReviews'],
          [
            Sequelize.fn('AVG', Sequelize.col('Reviews.stars')),
            'avgStarRating',
          ],
        ],
      },
      group: ['Spot.id', 'SpotImages.id', 'Owner.id'],
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const spotData = spot.get({ plain: true });

    if (spotData.avgStarRating) {
      spotData.avgStarRating = parseFloat(spotData.avgStarRating.toFixed(1));
    }

    res.status(200).json(spotData);
  } catch (error) {
    next(error);
  }
});

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
// create spot
router.post('/', requireAuth, validateSpotCreation, async (req, res, next) => {
  try {
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;
    const ownerId = req.user.id;
    const newSpot = await Spot.create({
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
    res.status(201).json(newSpot);
  } catch (error) {
    next(error);
  }
});

// Add image to spot
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newImage = await SpotImage.create({
      spotId,
      url,
      preview,
    });
    const resBoby = {
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    };

    res.status(200).json(resBoby);
  } catch (error) {
    next(error);
  }
});

// Edit a Spot
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
// Edit a Spot
router.put(
  '/:spotId',
  requireAuth,
  validateSpotEdit,
  async (req, res, next) => {
    try {
      const spotId = req.params.spotId;
      const spot = await Spot.findByPk(spotId);

      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      } = req.body;
      await spot.update({
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      });
      res.status(200).json(spot);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a spot

router.delete('/:spotId', requireAuth, async (req, res, next) => {
  try {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await spot.destroy();
    res.status(200).json({ message: 'Successfully deleted' });
  } catch (error) {
    next(error);
  }
});

// Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res, next) => {
  const { spotId } = req.params;
  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
    const reviews = await Review.findAll({
      where: { spotId: spotId },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName'],
        },
        { model: ReviewImage, attributes: ['id', 'url'] },
      ],
    });
    res.status(200).json({ Reviews: reviews });
  } catch (error) {
    next(error);
  }
});

const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors,
];

// Create a Review for a Spot based on the Spot's id
router.post(
  '/:spotId/reviews',
  validateReview,
  requireAuth,
  async (req, res, next) => {
    try {
      const { spotId } = req.params;
      const { review, stars } = req.body;

      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      const existingReview = await Review.findOne({
        where: { spotId, userId: req.user.id },
      });
      if (existingReview) {
        return res
          .status(500)
          .json({ message: 'User already has a review for this spot' });
      }

      const newReview = await Review.create({
        userId: req.user.id,
        spotId,
        review,
        stars,
      });
      res.status(201).json(newReview);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
