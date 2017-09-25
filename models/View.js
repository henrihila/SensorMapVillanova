var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * View Model
 * =============
 */
var View = new keystone.List('View');

View.add({
    name: { type: String, required: true },
    description: { type: Types.Html, wysiwyg: true },
    site: { type: Types.Relationship, ref: 'Site', required: true, initial: true, noedit: true },
    viewType: { type: Types.Select, required: true, initial: true, options: 'HTML Content, Data from Sensors', emptyOption: false },
    pageSection: { type: Types.Select, required: true, initial: true, options: 'Marker, About, Data Viewer', emptyOption: false },
    content: { type: Types.Html, wysiwyg: true , dependsOn: { viewType: 'HTML Content' } },
    sensors: { type: Types.Relationship, ref: 'Sensor', many: true, filters: { site: ':site' }, dependsOn: { viewType: 'Data from Sensors' } },
    advancedToolbar: { type: Types.Boolean, dependsOn: { viewType: 'Data from Sensors' } },
    priority: { type: Types.Number, format: '0' },
    createdAt: { type: Date, default: Date.now, hidden: true }
});

View.relationship({ path: 'sensors', ref: 'Sensor', refPath: 'View' });

View.schema.pre('save', function (next) {

    var index = this;

    if (index.isNew) {
        keystone.list('Site').model.findOne({_id: index.site}).exec(function (err, site) {

            if (err) {
                console.error("===== Error finding site =====");
                console.error(err);
                next(err);
            }

            if (!site) next(err);

            site.views.addToSet(index._id); // TODO: Check performance
            site.save();

            next();
        });
    } else {
        next();
    }

});

View.schema.pre('remove', function(next) {

    var index = this;

    keystone.list('Site').model.findOne({_id: index.site}).exec(function (err, site) {

        if (err) {
            console.error("===== Error finding site =====");
            console.error(err);
            next(err);
        }

        if (!site) next(err);

        site.views.pull(index._id);
        site.save();

        next();
    });

});

View.defaultSort = '-createdAt';
View.defaultColumns = 'name, overview, createdAt';
View.register();