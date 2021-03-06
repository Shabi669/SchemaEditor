//================================================== Dependencies ==================================================//
import angular from 'angular';

//================================================== Collections ==================================================//
import { Entities } from '/collections/entities';
import { Properties } from '/collections/properties';

//================================================== Templates ==================================================//
import table from '/imports/components/properties/table/table.ng.html';
import tableBody from '/imports/components/properties/table/table-body.ng.html';

export default angular.module('propertyTable', [])
    .directive('propertyTable', ['$compile', function ($compile)
    {
        return {
            restirct: 'E',
            replace: true,
            scope: { entity: '=', filter: '=', api: '=' },
            templateUrl: table,
            link: function (scope, element, controller)
            {
                
            }
        };
    }])
    .directive('propertyTableBody', ['$compile', function ($compile)
    {
        return {
            restirct: 'E',
            replace: true,
            scope: { entity: '=', filter: '=', api: '=', type: '@' },
            templateUrl: tableBody,
            link: function (scope, element, controller)
            {
                // Collections
                scope.helpers({
                    entities() { return Entities.find({}); },
                    properties() { return Properties.find({}); }
                });

                scope.renderProperties = function (entity)
                {
                    if (!entity) return;

                    console.log(entity.title);

                    if (!scope.base || scope.base._id != entity.base);
                    scope.base = Entities.findOne({ _id: entity.base });
                }
                scope.$watch('entity', function () { scope.renderProperties(scope.entity) });
                scope.$watch('entity.base', function () { scope.renderProperties(scope.entity) });
            }
        };
    }]);