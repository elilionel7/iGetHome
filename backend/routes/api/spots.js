const express = require('express');
const moment = require('moment');
const { restoreUser, requireAuth } = require('../../utils/auth');
// const { handleValidationErrors } = require('../../utils/validation');
const { check, body } = require('express-validator');
const {
  validateSpotCreation,
  validateSpotEdit,
  validateBooking,
  validateReview,
} = require('../../utils/validateSomeRoutes');

const {
  Spot,
  Review,
  SpotImage,
  User,
  ReviewImage,
  Booking,
} = require('../../db/models');
const { Op, fn, col } = require('sequelize');

const router = express.Router();
//get all spot
router.get('/', async (_req, res, next) => {
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
        include: [[fn('AVG', col('Reviews.stars')), 'avgRating']],
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
router.get('/current', requireAuth, async (req, res, next) => {
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
        include: [[fn('AVG', col('Reviews.stars')), 'avgRating']],
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
          [fn('COUNT', col('Reviews.id')), 'numReviews'],
          [fn('AVG', col('Reviews.stars')), 'avgStarRating'],
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

// Get all Bookings for a Spot based on the Spot's id

router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
  try {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const bookings = await Booking.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    const resBookings = bookings.map((booking) => {
      return {
        User: booking.User,
        id: booking.id,
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: moment(booking.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(booking.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    if (req.user.id === spot.ownerId) {
      res.json({ Bookings: resBookings });
    } else {
      const bookingsWithoutUser = resBookings.map(
        ({ spotId, startDate, endDate }) => ({
          spotId,
          startDate,
          endDate,
        })
      );
      res.json({ Bookings: bookingsWithoutUser });
    }
  } catch (error) {
    next(error);
  }
});

// Create a booking for a spot
router.post(
  '/:spotId/bookings',
  requireAuth,
  validateBooking,
  async (req, res, next) => {
    const { startDate, endDate } = req.body;
    const spotId = req.params.spotId;
    const userId = req.user.id;

    try {
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({
          message: "Spot couldn't be found",
        });
      }

      // Check for booking conflicts
      const existingBookings = await Booking.findAll({
        where: {
          spotId,
          [Op.or]: [
            { startDate: { [Op.between]: [startDate, endDate] } },
            { endDate: { [Op.between]: [startDate, endDate] } },
          ],
        },
      });

      if (existingBookings.length > 0) {
        return res.status(403).json({
          message: 'Sorry, this spot is already booked for the specified dates',
          errors: {
            startDate: 'Start date conflicts with an existing booking',
            endDate: 'End date conflicts with an existing booking',
          },
        });
      }

      // Create the booking
      const newBooking = await Booking.create({
        spotId,
        userId,
        startDate,
        endDate,
      });

      return res.status(200).json(newBooking);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
