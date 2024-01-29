'use strict';

const { Booking } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Booking.bulkCreate(
      [
        {
          userId: 1, // assuming John Smith has an id of 1
          spotId: 1, // assuming the first spot has an id of 1
          startDate: new Date('2022-11-19'),
          endDate: new Date('2022-11-20'),
        },
        {
          userId: 2,
          spotId: 2,
          startDate: new Date('2022-11-21'),
          endDate: new Date('2022-11-22'),
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        userId: {
          [Op.in]: [1, 2],
        },
      },
      {}
    );
  },
};
