var keystone = require('keystone'),
    Datapoint = keystone.list('Datapoint');

exports = module.exports = function (req, res) {

    console.log(req.param('dataStreamId'));

    Datapoint.model.find().where('sensorID', req.param('dataStreamId')).limit(10).exec(function (err, datapoints) {

        if (err) {
            console.log('[api.datapoints] - Error getting existing datapoints.', err);
            console.log('------------------------------------------------------------');
            return res.apiResponse({
                success: false,
                message: 'Sorry, there was an error processing your information, please try again.'
            });
        }

        if (!datapoints) {
            console.log('[api.Datapoints] - Error getting existing Datapoints.', err);
            console.log('------------------------------------------------------------');
            return res.apiResponse({
                success: false,
                message: 'Sorry, there was an error processing your information, please try again.'
            });
        }

        console.log(datapoints);
        data = [];

        datapoints.forEach(function(dp) {
            data.push({"timeValue": dp['timeValue'], "value": dp["value"]});
        });

        console.log(data);
        res.send(data);

    });

};