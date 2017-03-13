//================================================== Dependencies ==================================================//
import { Meteor } from 'meteor/meteor';
import utils from '../imports/scripts/utils.js';
import schema from '../imports/scripts/schema.js';

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

WebApp.connectHandlers.use("/file/", function (req, res, next) 
{
  var parameters = req.url.split('/');

  var id = parameters[1];
  var format = parameters[2];

  var entity = Entities.findOne({ _id: id });
  // var properties = Properties.find({ entityID: id }, { fields: { _id: 0, entityID: 0 } });

  // var output = exportEntity(entity, properties);

  var output = {};
  var filename = 'temp.txt';

  switch (format)
  {
    case 'schema':
    output = schema.getEntity(id);
    filename =  entity.title + '.schema';
    break;
    case 'flat':
    output = schema.getEntityFlat(id);
    filename =  entity.title + '.flat.schema';
    break;
    case 'json':
    output = schema.getEntityJson(id);
    filename =  entity.title + '.json';
    break;
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-disposition': 'attachment; filename=' + filename
  });

  res.end(JSON.stringify(output));
});
