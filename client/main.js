//================================================== Dependencies ==================================================//
import angular from 'angular';
import { Meteor } from 'meteor/meteor';
import angularMeteor from 'angular-meteor';
import utils from '../imports/scripts/utils.js';

//================================================== Collections ==================================================//
import { Entities } from '../collections/entities';
import { Properties } from '../collections/properties';

//================================================== Components ==================================================//
import { name as entityComponents } from '/imports/components/entities/components';
// import { name as EntityEdit } from '../imports/components/entities/edit';
import { name as linksTable } from '/imports/components/links/table/table';
import { name as propertyTable } from '/imports/components/properties/table/table';

//================================================== Application Module ==================================================//
var ngApplication = angular.module('ngApplication', [angularMeteor, propertyTable, linksTable, entityComponents]);

//================================================== Page Controller ==================================================//
var ngPageController = ngApplication.controller('ngPageController', ['$scope', '$timeout', '$http', '$filter', function ($scope, $timeout, $http, $filter)
{
  // Collections
  $scope.helpers({
    entities() { return Entities.find({}, { fields: { "$$hashKey": 0 } }); },
    properties() { return Properties.find({}); }
  });

  // Application
  $scope.app = {};
  $scope.app.filter = {};

  $scope.app.keydown = function (event)
  {
    console.log(event.keyCode);

    var index = $scope.filteredEntities.indexOf($scope.entity.selected);

    // if (event.altKey) 
    if (event.ctrlKey) 
    {
      console.log(event.keyCode);
      switch (event.keyCode)
      {
        // up arrow navigation
        case 38:
          if (index > 0)
            $scope.entity.select($scope.filteredEntities[index - 1]);
          break;
        // down arrow navigation
        case 40:
          if (index < $scope.filteredEntities.length - 1)
            $scope.entity.select($scope.filteredEntities[index + 1]);
          break;
        // i for new item
        case 73:
          $scope.entity.edit();
          break;
        // m for new memebr
        case 77:
          $scope.property.edit($scope.entity.selected);
          break;
      }
    }
  }
  $scope.app.filter.change = function ()
  {
    var filter = $scope.app.filter;

    if (filter.text)
    {
      var parts = filter.text.split('.');

      $scope.entity.filter.title = parts.length > 0 ? parts[0] : '';
      $scope.property.filter.title = parts.length > 1 ? parts[1] : '';
    }
    else
    {
      $scope.entity.filter.title = '';
      $scope.property.filter.title = '';
    }

    $scope.entity.selectFirst();
  }

  // Entity
  $scope.entity = {};
  $scope.entity.filter = {};
  $scope.entity.selected = null;
  $scope.entity.properties = [];

  $scope.entity.create = function ()
  {
    return {
      title: '',
      metaType: 'entity'
    }
  }
  $scope.entity.selectFirst = function ()
  {
    $timeout(function ()
    {
      $scope.entity.select($scope.filteredEntities.length > 0 ? $scope.filteredEntities[0] : null);
    }, 1)
  }
  $scope.entity.edit = function (entity)
  {
    if (!entity) entity = $scope.entity.create();

    if ($scope.category.selected.name != 'all')
      entity.metaType = $scope.category.selected.name;

    console.log('edit entity - ' + entity.title);

    $scope.entity.select(angular.copy(entity));

    $("#editEntityModal").modal();

    $timeout(function(){console.log($scope.entity.selected)}, 1000);
  }
  $scope.entity.remove = function (entity, confirm)
  {
    if (!entity) return;

    console.log('remove entity - ' + entity.title);

    $scope.entity.pending = entity;

    if (confirm)
    {
      Entities.remove({ _id: entity._id });
      $scope.entity.selectFirst();
    }
    else
      $("#removeEntityModal").modal();
  }
  $scope.entity.select = function (entity)
  {
    console.log('selecting entity');

    $scope.entity.selected = entity;
    
    $scope.entity.properties = $scope.property.getDerived(entity);
  }
  $scope.entity.submit = function (entity)
  {
    if (!entity) return;
    if (!entity.title) return;

    console.log('submit entity - ' + entity.title);

    if (entity._id)
    {
      var temp = angular.copy(entity);
      delete temp._id;
      Entities.update({ _id: entity._id }, { $set: temp });
    }
    else
    {
      entity._id = Entities.insert(entity);
    }

    $('#editEntityModal').modal('hide');

    $scope.entity.select(entity);
  }
  $scope.entity.download = function (entity, isFlat)
  {
    // Meteor.call('test', '123', function(err, response) 
    // {
    //   console.log(response);
    // });

    console.log('download entity - ' + entity.title);

    $http.get('/file/' + entity._id);
  }
  $scope.entity.keyDown = function (event)
  {
    if (event.keyCode == 13)
    {
      $scope.entity.submit($scope.entity.selected);
    }
  }
  $scope.entity.byID = function (id)
  {
    return Entities.findOne({ _id: id });
  }
  $scope.entity.validation = {};
  $scope.entity.validation.title = function ()
  {
    return $scope.entity.selected && $scope.entity.selected.title;
  }
  $scope.entity.filters = {};
  $scope.entity.filters.linkable = function(item)
  {
      var flag = item.metaType == 'entity';
      return flag;
  }
  $scope.entity.filters.inheritance = function(type)
  {
    return function (item)
    {
      var flag = item._id != $scope.entity.selected._id;

      switch  (type)
      {
        case 'link':
          return flag && item.metaType == 'link' || item.metaType == 'base';
        case 'entity':
          return flag && item.metaType == 'entity' || item.metaType == 'base';
      }
      
      return flag;
    }
  }

  // Property
  $scope.property = {};
  $scope.property.filter = {};
  $scope.property.selected = null;
  $scope.property.validation = {};

  $scope.property.create = function (entity)
  {
    return {
      entityID: entity._id,
      type: 'string',
      ref: {}
    }
  }
  $scope.property.edit = function (entity, property)
  {
    if (!entity) return;
    if (!property) property = $scope.property.create(entity);

    console.log('edit property for entity - ' + entity.title);

    $scope.property.selected = angular.copy(property);

    $("#editPropertyModal").modal();
  }
  $scope.property.remove = function (entity, property, confirm)
  {
    if (!entity) return;
    if (!property) return;

    console.log('remove property for entity - ' + entity.title);

    $scope.property.pending = property;

    if (confirm)
    {
      Properties.remove({ _id: property._id });
      $scope.entity.properties = $scope.property.getDerived(entity);
    }
    else
      $("#removePropertyModal").modal();
  }
  $scope.property.submit = function (entity, property)
  {
    if (!entity || !property) return;
    if (!property.title || !property.type) return;

    console.log('submit property for entity - ' + entity.title);

    var temp = angular.copy(property);
    delete temp._id;

    if (property._id)
      Properties.update({ _id: property._id }, temp);
    else
    {
      property._id = Properties.insert(property);
      $scope.entity.properties = $scope.property.getDerived(entity);
    }

    $('#editPropertyModal').modal('hide');
  }
  $scope.property.keyDown = function (event)
  {
    if (event.keyCode == 13)
    {
      $scope.property.submit($scope.entity.selected, $scope.property.selected);
    }
  }
  $scope.property.getDerived = function (entity)
  {
    var list = [];
    if (!entity) return list;

    if (entity.base)
      list = $scope.property.getDerived($scope.entity.byID(entity.base));

    var properties = Properties.find({ entityID: entity._id });
    properties.forEach(function (item) 
    {
      list.push(item);
    }, this);

    return list;
  }
  $scope.property.validation.title = function ()
  {
    return $scope.property.selected && $scope.property.selected.title;
  }
  $scope.property.validation.common = function ()
  {
    return $scope.property.selected && $scope.property.selected.targetType;
  }

  // Category
  $scope.category = {};
  $scope.category.list = [];
  $scope.category.selected = 'Entities';

  $scope.category.init = function ()
  {
    $scope.category.list.push({ name: 'all', title: 'All' });
    $scope.category.list.push({ name: 'link', title: 'Links' });
    $scope.category.list.push({ name: 'entity', title: 'Entities' });
    $scope.category.list.push({ name: 'common', title: 'Common Types' });

    $scope.category.set($scope.category.list[0]);
  }
  $scope.category.set = function (category)
  {
    $scope.category.selected = category;
    $scope.entity.filter.metaType = category.name == 'all' ? '' : category.name;

    $scope.entity.selectFirst();
  }

  //================================================== Startup Script ==================================================//
  $scope.category.init();
  $scope.entity.selectFirst();
}]);

//================================================== JQuery UI Ducktape ==================================================//
$(document).ready(function ()
{
  $("#tbxSearch").focus();

  $(".modal").on('shown.bs.modal', function ()
  {
    $(this).find("input:eq(0)").focus();
  });
  $(".modal").on('hidden.bs.modal', function ()
  {
    $("body .top-bar input:eq(0)").focus();
  });
});