const express = require('express');
const { requireAuth } = require('../../utils/auth');
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
              //where: { preview: true },
              //required: false,
            },
          ],
        },
      ],
    });

    const formattedBookings = bookings.map((booking) => {
      const { id, userId, spotId, startDate, endDate, Spot } = booking;

      const newBooking = {
        id,
        spotId,
        Spot: {
          id: Spot.id,
          ownerId: Spot.ownerId,
          address: Spot.address,
          city: Spot.city,
          state: Spot.state,
          country: Spot.country,
          lat: Spot.lat,
          lng: Spot.lng,
          name: Spot.name,
          price: Spot.price,
          previewImage: Spot.previewImage || Spot.SpotImages[0]?.url || null,
        },
        userId,
        startDate,
        endDate,
        createdAt: moment(booking.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(booking.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      };

      return newBooking;
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

      if (moment().isAfter(booking.endDate)) {
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

    if (moment().isAfter(booking.startDate)) {
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
