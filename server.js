'use strict';
const express = require('express');
const app = express();

const port = 4000;

/**
 *  @description listening the port.
 *  @param {number} port
 */
app.listen(port, () => {
  console.log(`${port} listening`);
});

/**
 *  @description serving index.html
 *  @param {Object[]} req - request object
 *  @param {Object[]} res - response object
 */
app.get('/', (req, res) => {
  console.log(typeof res);
  res.sendFile(__dirname + '/views/index.html');
});

/**
 *  @description defining the path for static assests,
 *  For this app we have only css stylesheet
 */
app.use(express.static(__dirname + '/public'));

/**
 *  @description print out single city weather forecast and current time
 * also sending a json with the same data
 * we are geting our input from html
 *  @param {Object[]} req - request object
 *  @param {Object[]} res - response object
 */

module.exports = app;
