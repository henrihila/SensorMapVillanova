var keystone = require('keystone');

exports = module.exports = function (req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    // Set locals
    // locals.section = 'map';
    // Load the galleries by sortOrder

    // Render the view
    view.render('test');

};