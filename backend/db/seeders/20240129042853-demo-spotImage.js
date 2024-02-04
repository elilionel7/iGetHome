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
          spotId: 1,
          url: 'image.url',
          preview: true,
        },
        {
          spotId: 2,
          url: 'image1.url',
          preview: false,
        },
        {
          spotId: 3,
          url: 'image2.url',
          preview: true,
        },
        {
          spotId: 4,
          url: 'image.url',
          preview: true,
        },
        {
          spotId: 5,
          url: 'image1.url',
          preview: true,
        },
        {
          spotId: 6,
          url: 'image2.url',
          preview: true,
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
