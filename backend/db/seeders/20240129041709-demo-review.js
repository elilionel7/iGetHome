'use strict';

const { Review } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Review.bulkCreate(
      [
        {
          userId: 1, // assuming John Smith has an id of 1
          spotId: 1, // assuming the first spot has an id of 1
          review: 'This was an awesome spot!',
          stars: 5,
        },
        {
          userId: 2, // assuming John Smith has an id of 1
          spotId: 2, // assuming the first spot has an id of 1
          review: 'This was an awesome spot!',
          stars: 5,
        },
        {
          userId: 3,
          spotId: 3,
          review: 'This was an good spot!',
          stars: 5,
        },
        {
          userId: 1, // assuming John Smith has an id of 1
          spotId: 4, // assuming the first spot has an id of 1
          review: 'This was an awesome spot!',
          stars: 4,
        },
        {
          userId: 2, // assuming John Smith has an id of 1
          spotId: 5, // assuming the first spot has an id of 1
          review: 'This was an awesome spot!',
          stars: 3,
        },
        {
          userId: 3,
          spotId: 6,
          review: 'This was an good spot!',
          stars: 5,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews';
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
