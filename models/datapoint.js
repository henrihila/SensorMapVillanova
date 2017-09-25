var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Datapoint Model
 * =============
 */
var Datapoint = new keystone.List('Datapoint');

Datapoint.add({
    sensorID: { type: Types.Relationship, ref: 'Sensor' },
    timeValue: { type: Types.Datetime, required: true, initial: true },
    value: { type: Types.Number, required: true, initial: true }
});

Datapoint.defaultSort = '-createdAt';
Datapoint.defaultColumns = 'sensorID, timeValue, value';
Datapoint.register();