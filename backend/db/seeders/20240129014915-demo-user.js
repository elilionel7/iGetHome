'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await User.bulkCreate(
      [
        {
          firstName: 'FirstTest',
          lastName: 'AATester',
          email: 'first.test@gmail.com',
          username: 'firstaatester',
          hashedPassword: bcrypt.hashSync('secret password'),
        },
        {
          firstName: 'SecondTest',
          lastName: 'AATester',
          email: 'second.test@gmail.com',
          username: 'secondaatester',
          hashedPassword: bcrypt.hashSync('secret password'),
        },
        {
          firstName: 'ThirdTest',
          lastName: 'AATester',
          email: 'third.test@gmail.com',
          username: 'thirdaatester',
          hashedPassword: bcrypt.hashSync('secret password'),
        },
        {
          firstName: 'Demo2',
          lastName: 'User2',
          email: 'user2@user.io',
          username: 'FakeUser2',
          hashedPassword: bcrypt.hashSync('password3'),
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        username: {
          [Op.in]: [
            'firstaatester',
            'secondaatester',
            'thirdaatester',
            'FakeUser2',
          ],
        },
      },
      {}
    );
  },
};
