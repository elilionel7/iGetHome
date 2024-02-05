// backend/routes/api/reviews.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { literal } = require('sequelize');
const { validateReview } = require('../../utils/validateSomeRoutes');

const {
  Spot,
  Review,
  SpotImage,
  User,
  ReviewImage,
} = require('../../db/models');

const router = express.Router();

// Get All Reviews of the Current User
//
router.get('/current', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id; // The authenticated user's ID should be set on the request object

    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'User', // Replace with your actual alias if different
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Spot,
          as: 'Spot',
          attributes: [
            'id',
            'ownerId',
            'address',
            'city',
            'state',
            'country',
            'lat',
            'lng',
            'name',
            'price',
          ],
          // No include here for ReviewImage, because it's not associated with Spot directly
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url'],
          as: 'ReviewImages', // Replace with your actual alias if different
        },
      ],
    });

    res.status(200).json({ Reviews: reviews });
  } catch (error) {
    next(error);
  }
});

//Add an Image to a Review
router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { url } = req.body;

    const review = await Review.findOne({
      where: { id: reviewId, userId: req.user.id },
    });
    if (!review) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }

    const maxNumImage = await ReviewImage.count({ where: { reviewId } });
    if (maxNumImage >= 10) {
      return res.status(403).json({
        message: 'Maximum number of images for this resource was reached',
      });
    }

    const reviewImage = await ReviewImage.create({ reviewId, url });
    const resData = {
      id: reviewImage.id,
      url: reviewImage.url,
    };

    res.status(200).json(resData);
  } catch (error) {
    next(error);
  }
});

// Edit a review
router.put(
  '/:reviewId',
  requireAuth,
  validateReview,
  async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { review, stars } = req.body;

      const reviewToEdit = await Review.findOne({
        where: { id: reviewId, userId: req.user.id },
      });
      if (!reviewToEdit) {
        return res.status(404).json({
          message: "Review couldn't be found",
        });
      }

      await reviewToEdit.update({ review, stars });
      res.status(200).json(reviewToEdit);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a Review

router.delete('/:reviewId', requireAuth, async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      where: { id: reviewId, userId: req.user.id },
    });
    if (!review) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }

    await review.destroy();
    res.status(200).json({ message: 'Successfully deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
