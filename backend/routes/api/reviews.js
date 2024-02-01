// backend/routes/api/reviews.js
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

const router = express.Router();

const validateReview = [
  check('review').not().isEmpty().withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors,
];

// Get All Reviews of the Current User
router.get('/current', restoreUser, requireAuth, async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'User',
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
          include: [
            { model: SpotImage, attributes: ['url'], as: 'previewImage' },
          ],
        },
        { model: ReviewImage, attributes: ['id', 'url'] },
      ],
    });
    res.json({ Reviews: reviews });
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
    if (maxNumImage > 10) {
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
  restoreUser,
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