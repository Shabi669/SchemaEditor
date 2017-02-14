//================================================== Dependencies ==================================================//
import { Meteor } from 'meteor/meteor';
import utils from '../imports/scripts/utils.js';

//================================================== Collections ==================================================//
import { Entities } from '../collections/entities';
import { Properties } from '../collections/properties';

Meteor.methods({
  test: function (str) 
  {
    return new Promise(function (resolve, reject)
    {
      resolve(str);
    });
  }
});

Meteor.startup(() =>
{
  // code to run on server at startup

});

function exportEntity(entity, properties, parent)
{
  var output = {};

  output.type = 'object';
  output.title = entity.title;

  // Entity inheritance
  if (entity.base)
  {
    var base = Entities.findOne({ _id: entity.base }, { fields: { _id: 0 } });
    output.allOf = [{ $ref: '{0}.schema#'.format(base.title) }];
  }

  // Entity properties
  output.properties = {};

  properties.forEach(function (property)
  {
    output.properties[property.title.camelCase()] = exportProperty(entity, property);
  }, this);

  return output;
}
function exportProperty(entity, property)
{
  var output = {};

  switch (property.type)
  {
    case 'string':
    case 'number':
    case 'boolean':
      if (property.multiple)
        return { title: property.title, type: 'array', items: { type: property.type } };
      else
        return { title: property.title, type: property.type };
    case 'object':
      return { title: 'not implemented' };
    case 'link':
    case 'common':
      var target = Entities.findOne({ _id: property.targetType });
      if (property.multiple)
        return { title: property.title, type: 'array', item: { $ref: 'commonTypes.schema#definitions/{0}'.format(target.title) } };
      else
        return { $ref: 'commonTypes.schema#definitions/{0}'.format(target.title) };
    case 'entity':
      return { title: 'not implemented' };
  }
}

WebApp.connectHandlers.use("/file/", function (req, res, next) 
{
  var parameters = req.url.split('/');

  var id = parameters[1];
  var format = parameters[2];

  var entity = Entities.findOne({ _id: id }, { fields: { _id: 0 } });
  var properties = Properties.find({ entityID: id }, { fields: { _id: 0, entityID: 0 } });

  var output = exportEntity(entity, properties);

  res.end(JSON.stringify(output));
  /*
    if (entity)
    {
      
  
      entity.properties = {};
      properties.forEach(function(item)
      {
        item.key = item.title.camelCase();
        console.log(item.key);
        entity.properties[item.key] = item;
      });
  
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-disposition': 'attachment; filename=' + entity.title + '.schema'
      });
  
      res.end(JSON.stringify(entity));
    }
    else
    {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-disposition': 'attachment; filename=schema not found'
      });
  
      res.end();
    }
    */
});
