import angular from 'angular';
import angularMeteor from 'angular-meteor';

import listTemplateUrl from './list.html';


export default angular.module('components.entities', [angularMeteor])
    .component('entityList', { templateUrl: listTemplateUrl, controller: EntityList, bindings: { entities: '=' } });;


class EntityList
{
    constructor($scope, $reactive)
    {
        'ngInject';
        $reactive(this).attach($scope);
    }
}