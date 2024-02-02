const express = require('express');
const { SpotImage, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// Delete a spot image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
  try {
    const imageId = req.params.imageId;
    const spotImage = await SpotImage.findByPk(imageId);

    if (!spotImage) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    }

    const spot = await Spot.findByPk(spotImage.spotId);
    if (!spot || spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized user' });
    }

    await spotImage.destroy();
    res.json({ message: 'Successfully deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
