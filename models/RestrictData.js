var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Sensor Model
 * =============
 */
var RestrictData = new keystone.List('RestrictData');

RestrictData.add({
    sensorID: { type: Types.Relationship, ref: 'Sensor', required: true, initial: true },
    from: { type: Types.Datetime, default: Date.now, required: true, initial: true },
    to: { type: Types.Datetime, default: Date.now, required: true, initial: true },
    createdAt: { type: Date, default: Date.now },
});

RestrictData.defaultSort = '-createdAt';
RestrictData.defaultColumns = 'sensorID, from, to';
RestrictData.register();