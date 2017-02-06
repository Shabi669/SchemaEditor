import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Entities } from '/collections/entities';

import templateUrl from './list.html';

const name = 'entityList';

class EntityList {
  constructor($scope, $reactive) {
    'ngInject';
 
    $reactive(this).attach($scope);
 
    this.helpers({
      entities() {
        return Entities.find({});
      }
    });
  }
}
 

 
// create a module
export default angular.module(name, [angularMeteor])
.component(name, {
  templateUrl,
  controllerAs: name,
  controller: EntityList
});