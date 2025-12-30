

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'mezbaani',
  'admin',
  'Poonam#@#1988',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
