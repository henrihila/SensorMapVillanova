/**
 * Created by enea on 12/12/16.
 */

var keystone = require('keystone'),
    Site = keystone.list('Site'),
    Sensor = keystone.list('Sensor'),
    Datapoint = keystone.list('Datapoint');

var Promise = require('promise');
var https = require('https');
var async = require('async');

/**
 * Calls the OPTI api and requests for sensor data.
 * @param sensorId: The sensor id as stored in the local db.
 * @param dataStreamId
 * @param period: {from: Date, to: Date} The requested data period.
 */
var _fetchAndUpdateSensorsData = function (sensorId, dataStreamId, period) {

    var options = {
        hostname: 'public.optirtc.com',
        path: '/api/datapoint' + '?key=z5ywCWZ4rLh3lu*3i234StqF' + '&dataStreamId=' + dataStreamId + '',
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'cache-control' : 'no-cache'
        }
    };

    return new Promise(function (resolve, reject) {

        var req = https.request(options, function (res) {

            res.setEncoding('utf8');

            var points = [];

            res.on('data', function (data) {

                points.push(data);

            });

            res.on('end', function () {

                points = JSON.parse(points.join(''));

                async.each(points.Items, function (point, callback) {

                    var p = {
                        sensorID: sensorId,
                        timeValue: point.timeValue,
                        value: point.value[0].value
                    };

                    var newDatapoint = new Datapoint.model(p);

                    newDatapoint.save(function (err, doc) {

                        if (err || !doc) {
                            console.log('Failed to create datapoint because of ', err);
                            callback(err);
                        }
                        else {
                            callback();
                        }

                    });

                }, function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(points);
                });

            });

        });

        req.on('error', function (err) {
            reject(err);
        });

        req.end();

    });

};

var fetchAndUpdateSensorsData = function (req, res) {

    console.log(req.param('sensorId'));

    if (req.param('sensorId') && req.param('dataStreamId')) {

        _fetchAndUpdateSensorsData(req.param('sensorId'), req.param('dataStreamId')).then(function (d) {
            console.log('res', d);
            return res.status(200).json({success: true, message: 'Fetched and updated sensors data', data: d});
        }).catch(function (err) {
            console.log('err', err);
            return res.status(400).json({success: false, message: 'Failed to fetch and update sensors data', data: err});
        });

    } else {
        return res.status(400).json({success: false, message: 'Bad input'});
    }

};

exports.fetchAndUpdateSensorsData = fetchAndUpdateSensorsData;