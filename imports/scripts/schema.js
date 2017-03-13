//================================================== Dependencies ==================================================//
import { Meteor } from 'meteor/meteor';
import faker from 'json-schema-faker';
import utils from './utils.js';

//================================================== Collections ==================================================//
import { Entities } from '/collections/entities';
import { Properties } from '/collections/properties';

faker.option({
    alwaysFakeOptionals: true
});

function exportEntity(entity, parent)
{
    var output = {};
    var properties = Properties.find({ entityID: entity._id });

    output.type = 'object';
    output.properties = {};
    output.title = entity.title;
    output.allOf = [{ $ref: '../base/EntitBase.schema#' }];

    // Entity inheritance
    if (entity.base)
    {
        var base = Entities.findOne({ _id: entity.base }, { fields: { _id: 0 } });
        output.allOf = [{ $ref: '{0}.schema#'.format(base.title) }];
    }

    // Entity properties
    properties.forEach(function (property)
    {
        var value = exportProperty(entity, property);

        if (value !== null)
            output.properties[property.title.camelCase()] = value;
    }, this);

    return output;
}
function exportProperty(entity, property)
{
    var target = {};
    var output = {};

    switch (property.type)
    {
        case 'enum':
            target = Entities.findOne({ _id: property.targetType });
            if (property.multiple)
            {
                return { type: 'array', items: { $ref: '../common/Enum.schema#', metadata: { enumList: target.title.camelCase() } } };
            }
            else
            {
                return { $ref: '../common/Enum.schema#', metadata: { enumList: target.title.camelCase() } };
            }
        case 'string':
        case 'number':
        case 'boolean':
            if (property.multiple)
                return { type: 'array', items: { type: property.type } };
            else
                return { type: property.type };
        case 'object':
            return { title: 'not implemented' };
        case 'link':
            return null;
        case 'common':
            target = Entities.findOne({ _id: property.targetType });
            if (property.multiple)
            {
                return { type: 'array', items: { $ref: '../common/{0}.schema#'.format(target.title.camelCase()) } };
            }
            else
            {
                return { $ref: '../common/{0}.schema#'.format(target.title.camelCase()) };
            }
        case 'entity':
            return { title: 'not implemented' };
    }
}

function exportEntityFlat(entity, parent, withFaker)
{
    var output = {};
    var properties = Properties.find({ entityID: entity._id });

    output.type = 'object';
    output.properties = {};
    output.title = entity.title;

    // Entity inheritance
    if (entity.base)
    {
        var base = exportEntityFlat(Entities.findOne({ _id: entity.base }));

        for (var key in base.properties)
        {
            var property = base.properties[key];
            var value = exportPropertyFlat(entity, property, withFaker);

            if (value !== null)
                output.properties[key] = value;
        }
    }

    // Entity properties
    properties.forEach(function (property)
    {
        var value = exportPropertyFlat(entity, property, withFaker);

        if (value !== null)
            output.properties[property.title.camelCase()] = value;
    }, this);

    return output;
}
function exportPropertyFlat(entity, property, withFaker)
{
    var target = {};
    var output = {};

    switch (property.type)
    {
        case 'enum':
            target = Entities.findOne({ _id: property.targetType });
            if (property.multiple)
            {
                return { type: 'array', items: { type: 'string', metadata: { enumList: target.title.pascalCase(true) } } };
            }
            else
            {
                return { type: 'string', metadata: { enumList: target.title.pascalCase(true) } };
            }
        case 'string':
        case 'number':
        case 'boolean':
            output = { type: property.type };

            if (withFaker) output.faker = property.faker;
            if (property.multiple) output = { type: 'array', items: output };

            return output;
        case 'object':
            return { title: 'not implemented' };
        case 'link':
            return null;
        case 'common':
            target = Entities.findOne({ _id: property.targetType });
            if (property.multiple)
            {
                return { type: 'array', items: exportEntityFlat(target) };
            }
            else
            {
                return exportEntityFlat(target);
            }
        case 'entity':
            return { title: 'not implemented' };
    }
}

function exportEntityJson(entity, parent)
{
    var output = exportEntityFlat(entity, parent, true);

    console.log(output)
    output = faker(output);
    console.log(output)
    return output   ;
}

export default {
    getEntity: function (id)
    {
        var entity = Entities.findOne({ _id: id });

        return exportEntity(entity);
    },
    getEntityFlat: function (id)
    {
        var entity = Entities.findOne({ _id: id });

        return exportEntityFlat(entity);
    },
    getEntityJson: function (id)
    {
        var entity = Entities.findOne({ _id: id });

        return exportEntityJson(entity);
    }
}