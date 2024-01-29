'use strict';

const { ReviewImage } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ReviewImage.bulkCreate(
      [
        {
          reviewId: 1, // assuming the first review has an id of 1
          url: 'http://example.com/review_image_1.jpg',
        },
        {
          reviewId: 2,
          url: 'http://example.com/review_image_2.jpg',
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        reviewId: {
          [Op.in]: [1, 2],
        },
      },
      {}
    );
  },
};
