'use strict';
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const async = require('async');
const formidable = require('formidable');
const fs = require('fs');
const alert = require('alert-node');
const app = express();

const port = 4001;
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
 *  @description to delete uploaded files from the uploads folder
 *  If we have ten files in the folder, we are deleting all of them
 *  while the user performing the eleventh upload
 *  also we throw a warning when user performed the tenth upload
 *  @param {Object[]} res - response object
 *  @param {string} cityName - input to implement into request
 */
const deleteUploads = () => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      console.log(err);
    }
    if (files.length === 2) {
      alert(
        "Your uploaded files' history will be deleted after the next uploading perform!"
      );
    } else if (files.length === 3) {
      files.map(file => {
        try {
          fs.unlinkSync(`./uploads/${file}`);
        } catch (err) {
          console.error(err);
        }
      });
    }
  });
};

/**
 *  @description to perform a request to openweathermap api
 *  print out weather forecast and current time.
 *  @param {Object[]} item - expexted object from uploaded JSON file.
 *  @param {function} sendData - callback function to pass to the async map.
 */
const getDataForBulkInputs = (item, sendData) => {
  let weatherForecast;
  let detailedDescription;
  let convertDate;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${
    item.locationName
  }&appid=${apiKey}`;
  request(url, function(err, response, body) {
    let dataPackage = JSON.parse(body);
    if (dataPackage.cod === '404') {
      weatherForecast = `Please re-check your input; ${dataPackage.message}`;
    } else {
      convertDate = new Date(dataPackage.dt * 1000).toISOString();
      detailedDescription = dataPackage.weather[0].description;
      weatherForecast = `Current Date and Time is ${convertDate} in ${
        dataPackage.name
      };There is ${detailedDescription} and It is ${
        dataPackage.main.temp
      } degrees`;
    }
    sendData(err, weatherForecast);
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
  res.sendFile(__dirname + '/views/index.html');
});

/**
 *  @description defining the path for static assests,
 *  For this app we have only css stylesheet
 */
app.use(express.static(__dirname + '/public'));

/**
 *  @description print out single city weather forecast and current time
 *  also sending a json with the same data
 *  we are geting our input from html
 *  @param {Object[]} req - request object
 *  @param {Object[]} res - response object
 */
app.post('/result', (req, res) => {
  const cityName = req.body.city;
  getDataFromApi(res, cityName);
});

app.post('/multi-results', (req, res) => {
  let form = new formidable.IncomingForm();
  form
    .parse(req)
    .on('fileBegin', (name, file) => {
      deleteUploads();
      file.path = __dirname + '/uploads/' + file.name;
    })
    .on('file', (name, file) => {
      let dataPackage;
      fs.readFile(`./uploads/${file.name}`, 'utf8', function(error, data) {
        if (error) {
          console.log('Whoops! File not found!');
        }
        try {
          dataPackage = JSON.parse(data);
        } catch (e) {
          console.log(e.message);
          return res.json({ Error: 'Uploaded file must be in JSON format' });
        }
        const results = (err, results) => {
          if (err) {
            console.log(err);
          } else {
            console.log(results);
            res.json({ 'Here is the list of all cities': results });
          }
        };
        async.map(dataPackage, getDataForBulkInputs, results);
      });
    })
    .on('aborted', () => {
      console.error('Request aborted by the user');
    })
    .on('error', err => {
      console.error('Error', err);
      throw err;
    });
});

module.exports = app;
