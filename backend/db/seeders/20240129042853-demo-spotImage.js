'use strict';

const { SpotImage } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await SpotImage.bulkCreate(
      [
        {
          spotId: 1, // assuming the first spot has an id of 1
          url: 'http://example.com/spot_image_1.jpg',
          preview: true,
        },
        {
          spotId: 2, // assuming the first spot has an id of 1
          url: 'http://example.com/spot_image_2.jpg',
          preview: false,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        spotId: {
          [Op.in]: [1, 2],
        },
      },
      {}
    );
  },
};
