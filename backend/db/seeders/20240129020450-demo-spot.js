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
          ownerId: 1,
          address: '123 Should Exist Street',
          city: 'San Frangoodtogo',
          state: 'California',
          country: 'United States of Valid Data',
          lat: 37.7645358,
          lng: -122.4730327,
          name: 'The Good Spot',
          description: 'Place where valid data can stay',
          price: 123,
        },
        {
          ownerId: 2, // assuming John Smith has an id of 1
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
          ownerId: 3, // assuming John Smith has an id of 1
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
        {
          ownerId: 1,
          address: '124 Should Exist Street',
          city: 'Sann Frangoodtogo',
          state: 'Californiaa',
          country: 'Uniteda States of Valid Data',
          lat: 38.7645358,
          lng: -121.4730327,
          name: 'Their Good Spot',
          description: 'Places where valid data can stay',
          price: 124,
        },
        {
          ownerId: 2, // assuming John Smith has an id of 1
          address: '124 Disney Lane',
          city: 'Sana Francisco',
          state: 'Californiaa',
          country: 'Uniteda States of America',
          lat: 38.7645358,
          lng: -121.4730327,
          name: 'App Academy',
          description: 'Place where web developers are created',
          price: 123.0,
        },
        {
          ownerId: 3, // assuming John Smith has an id of 1
          address: '124 Netflix Lane',
          city: 'Sana Diego',
          state: 'New Yorka',
          country: 'Uniteda States of America',
          lat: 26.7645358,
          lng: -141.4730327,
          name: 'Apia Consult',
          description: 'Placea where fiction is reality',
          price: 234.0,
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
