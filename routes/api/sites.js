var keystone = require('keystone'),
    Site = keystone.list('Site');

exports = module.exports = function (req, res) {

    Site.model.find().populate('sensors views').exec(function (err, sites) {

        if (err) {
            console.log('[api.sites] - Error getting existing sites.', err);
            console.log('------------------------------------------------------------');
            return res.apiResponse({
                success: false,
                message: 'Sorry, there was an error processing your information, please try again.'
            });
        }

        if (!sites) {
            console.log('[api.sites] - Error getting existing sites.', err);
            console.log('------------------------------------------------------------');
            return res.apiResponse({
                success: false,
                message: 'Sorry, there was an error processing your information, please try again.'
            });
        }

        console.log(sites);
        res.send(sites);

    });

};