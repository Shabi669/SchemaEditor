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
                console.log('table link');
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
                //scope.properties = [];

                console.log('table body link');

                scope.renderProperties = function (entity)
                {
                    if (!entity) return;

                    console.log(entity.title);

                    if (!scope.base || scope.base._id != entity.base);
                    scope.base = Entities.findOne({ _id: entity.base });

                    //scope.properties = Properties.find();
                    //scope.properties = Properties.find({ entityID: entity._id }).fetch();

                }
                scope.$watch('entity', function () 
                {
                    console.log('entity changed');
                    scope.renderProperties(scope.entity)
                });
            }
        };
    }]);