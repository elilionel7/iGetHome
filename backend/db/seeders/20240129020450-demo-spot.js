'use strict';
const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot.bulkCreate(
      [
        {
          ownerId: 1, // assuming John Smith has an id of 1
          address: '123 Disney Lane',
          city: 'San Francisco',
          state: 'California',
          country: 'United States of America',
          lat: 37.7645358,
          lng: -122.4730327,
          name: 'App Academy',
          description: 'Place where web developers are created',
          price: 123.0,
        },
        {
          ownerId: 2, // assuming John Smith has an id of 1
          address: '123 Netflix Lane',
          city: 'San Diego',
          state: 'New York',
          country: 'United States of America',
          lat: 27.7645358,
          lng: -142.4730327,
          name: 'Api Consult',
          description: 'Place where fiction is reality',
          price: 233.0,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: {
          [Op.in]: ['App Academy', 'Api Consult'],
        },
      },
      {}
    );
  },
};
