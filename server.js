'use strict';
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();

const port = 4000;
const apiKey = '82ff927a912991c4d8f66fd6d3d3bd25';

/**
 *  @description to perform a request to openweathermap api
 *  print out weather forecast and current time.
 *  @param {Object[]} res - response object
 *  @param {string} cityName - input to implement into request
 */
const getDataFromApi = (res, cityName) => {
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${
    cityName}&appid=${apiKey}`;
  request(url, (err, response, body) => {
    console.log(err);
    let dataPackage = JSON.parse(body);
    if (dataPackage.cod === '404') {
      let error = `Please re-check your input; ${dataPackage.message}`;
      console.log('error:', error);
      return res.json({
        error,
      });
    } else {
      console.log('body:', body);
      let convertDate = new Date(dataPackage.dt * 1000).toISOString();
      let detailedDescription = dataPackage.weather[0].description;
      let currentTime = `Current Date and Time is ${convertDate} in ${
        dataPackage.name
      }.`;
      let weatherForecast = `There is ${detailedDescription} and It is ${
        dataPackage.main.temp
      } degrees`;
      console.log(weatherForecast);
      res.json([currentTime, weatherForecast]);
    }
  });
};
/**
 *  @description listening the port.
 *  @param {number} port
 */
app.listen(port, () => {
  console.log(`${port} listening`);
});

/**
 *  @description using bodyParser to decode incoming data from post requests
 */
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

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
app.post('/result', (req, res) => {
  const cityName = req.body.city;
  getDataFromApi(res, cityName);
});

module.exports = app;
