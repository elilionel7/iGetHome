const express = require('express');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { Booking, Spot, SpotImage } = require('../../db/models');
const moment = require('moment');
const { Op } = require('sequelize');

const { validateBookingDates } = require('../../utils/validateSomeRoutes');

const router = express.Router();

router.get('/current', requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Spot,
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
            {
              model: SpotImage,
              as: 'SpotImages',
              attributes: ['url'],
              where: { preview: true },
              required: false, // query does not fail if no SpotImages are found
            },
          ],
        },
      ],
    });

    const formattedBookings = bookings.map((booking) => {
      const spotDetails = booking.Spot
        ? {
            id: booking.Spot.id,
            ownerId: booking.Spot.ownerId,
            address: booking.Spot.address,
            city: booking.Spot.city,
            state: booking.Spot.state,
            country: booking.Spot.country,
            lat: booking.Spot.lat,
            lng: booking.Spot.lng,
            name: booking.Spot.name,
            price: booking.Spot.price,
            previewImage:
              booking.Spot.SpotImages && booking.Spot.SpotImages[0]
                ? booking.Spot.SpotImages[0].url
                : null,
          }
        : {}; //if there are no spot

      return {
        id: booking.id,
        spotId: booking.spotId,
        Spot: spotDetails,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

    res.json({ Bookings: formattedBookings });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:bookingId',
  requireAuth,
  validateBookingDates,
  async (req, res, next) => {
    try {
      const { bookingId } = req.params;
      const { startDate, endDate } = req.body;
      const booking = await Booking.findByPk(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
      }

      if (new Date(booking.endDate) < new Date()) {
        return res
          .status(403)
          .json({ message: "Past bookings can't be modified" });
      }

      const conflictingBooking = await Booking.findOne({
        where: {
          spotId: booking.spotId,
          id: { [Op.ne]: bookingId },
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              endDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              [Op.and]: [
                { startDate: { [Op.lt]: startDate } },
                { endDate: { [Op.gt]: endDate } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        return res.status(403).json({
          message: 'Sorry, this spot is already booked for the specified dates',
          errors: {
            startDate: 'Start date conflicts with an existing booking',
            endDate: 'End date conflicts with an existing booking',
          },
        });
      }
      booking.startDate = startDate;
      booking.endDate = endDate;
      await booking.save();

      res.json(booking);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a booking
router.delete('/:bookingId', requireAuth, async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId, {
      include: {
        model: Spot,
        attributes: ['ownerId'],
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (new Date(booking.startDate) <= new Date()) {
      return res
        .status(403)
        .json({ message: "Bookings that have been started can't be deleted" });
    }

    await booking.destroy();
    res.json({ message: 'Successfully deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
