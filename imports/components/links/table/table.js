//================================================== Dependencies ==================================================//
import angular from 'angular';

//================================================== Collections ==================================================//
import { Entities } from '/collections/entities';
import { Properties } from '/collections/properties';

//================================================== Templates ==================================================//
import table from '/imports/components/links/table/table.ng.html';
import tableBody from '/imports/components/links/table/table-body.ng.html';

export default angular.module('linksTable', [])
    .directive('linksTable', ['$compile', function ($compile)
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
    .directive('linksTableBody', ['$compile', function ($compile)
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

                scope.render = function (entity)
                {
                    if (!entity) return;

                    console.log('link - ' + entity.title);

                    if (!scope.base || scope.base._id != entity.base);
                    scope.base = Entities.findOne({ _id: entity.base });
                }
                scope.$watch('entity', function () { scope.render(scope.entity) });
                scope.$watch('entity.base', function () { scope.render(scope.entity) });
            }
        };
    }]);