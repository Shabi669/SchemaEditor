import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Entities } from '../collections/entities';

import { name as EntityList } from '../imports/components/entities/list';


var ngApplication = angular.module('ngApplication', [angularMeteor, EntityList]);
var ngPageController = ngApplication.controller('ngPageController', ['$scope', '$timeout', function ($scope, $timeout)
{
  $scope.helpers({
    entities() { return Entities.find({}); }
  });

  $scope.addEntity = function ()
  {
    console.log('adding entity');
    Entities.insert({ title: 'test' });
  }
  $scope.selectEntity = function (entity)
  {
    console.log('selecting entity');
    $scope.selectedEntity = entity;
  }
  $scope.itemEdit = function (entity)
  {
    console.log('edit entity - ' + entity.title);

    $("#editEntityModal").modal();
  }
  $scope.submitEntity = function (entity)
  {
    console.log('submit entity - ' + entity.title);

    Entities.update(entity._id, { $set: { title: entity.title, metaType: entity.metaType } });
  }
}]);

$(document).ready(function()
{
    $(".modal").on('shown.bs.modal', function()
    {
        // $("#editEntityModal input").focus();
        $(this).find("input:eq(0)").focus();
    });
    $(".modal").on('hidden.bs.modal', function()
    {
        $("body .top-bar input:eq(0)").focus();
    });
});