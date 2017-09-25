var keystone = require('keystone');
var Types = keystone.Field.Types;
var async = require('async');


/**
 * Site Model
 * =============
 */
var Site = new keystone.List('Site');

Site.add({
    name: {type: String, required: true},
    overview: {type: Types.Html, wysiwyg: true},
    description: {type: Types.Html, wysiwyg: true},
    location: {type: Types.Location, defaults: {country: 'Unites States'}, required: true, initial: true},
    sensors: {type: Types.Relationship, ref: 'Sensor', many: true, hidden: true},
    views: {type: Types.Relationship, ref: 'View', many: true, hidden: true},
    createdAt: {type: Date, default: Date.now, hidden: true }
});

Site.relationship({path: 'sensors', ref: 'Sensor', refPath: 'site'});

Site.schema.pre('remove', function (next) {

    var index = this;

    async.parallel([
            // Remove associated Sensors
            function (cb) {
                keystone.list('Sensor').model.find({_id: {$in: index.sensors}}).remove(cb);
            },
            function (cb) {
                keystone.list('View').model.find({site: index._id}).remove(cb);
            }
        ],
        // Remove associated Views
        function (err, results) {
            if (err) {
                console.error("===== Error when removing site =====");
                console.error(err);
                next(err);
            }
            next();
        });

});


Site.defaultSort = '-createdAt';
Site.defaultColumns = 'name|10%, overview, createdAt|15%';
Site.register();