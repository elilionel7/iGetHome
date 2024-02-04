const express = require('express');
const { ReviewImage, Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// Delete a review image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
  try {
    const imageId = req.params.imageId;
    const reviewImage = await ReviewImage.findByPk(imageId);
    if (!reviewImage) {
      return res
        .status(404)
        .json({ message: "Review Image couldn't be found" });
    }

    const review = await Review.findByPk(reviewImage.reviewId);
    if (!review || review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized user' });
    }

    await reviewImage.destroy();
    res.json({ message: 'Successfully deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
