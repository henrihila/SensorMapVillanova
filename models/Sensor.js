var keystone = require('keystone');
var Types = keystone.Field.Types;


/**
 * Sensor Model
 * =============
 */
var Sensor = new keystone.List('Sensor');

Sensor.add({
    sensorID: { type: Types.Key, required: true, initial: true },
    name: { type: String, required: true },
    description: { type: Types.Html, wysiwyg: true },
    units: { type: Types.TextArray },
    site: { type: Types.Relationship, ref: 'Site', required: true, initial: true },
    createdAt: { type: Date, default: Date.now, hidden: true }
});

Sensor.schema.pre('save', function(next) {

    var index = this;

    if (index.isNew) {
        keystone.list('Site').model.findOne({_id: index.site}).exec(function (err, site) {

            if (err) {
                console.error("===== Error finding site =====");
                console.error(err);
                next(err);
            }

            if (!site) next(err);

            site.sensors.addToSet(index._id); // TODO: Check performance
            site.save();

            next();
        });
    } else {
        next();   
    }

});

Sensor.schema.pre('remove', function(next) {

    var index = this;

    keystone.list('Site').model.findOne({_id: index.site}).exec(function (err, site) {

        if (err) {
            console.error("===== Error finding site =====");
            console.error(err);
            next(err);
        }

        if (!site) next(err);

        site.sensors.pull(index._id);
        site.save();

        next();
    });
    
});


Sensor.defaultSort = '-createdAt';
Sensor.defaultColumns = 'name, description, createdAt';
Sensor.register();