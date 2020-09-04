'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The inboxIdentityRemoveController', function() {
  var $q, $rootScope, $controller, scope;
  var userId, identity;
  var inboxIdentitiesService;
  var INBOX_IDENTITIES_EVENTS;

  beforeEach(function() {
    userId = 'userId';
    identity = { uuid: 'uuid' };

    angular.mock.module('esn.account-inbox');
    angular.mock.module('linagora.esn.unifiedinbox');

    angular.mock.module(function($provide) {
      $provide.value('asyncAction', function(message, action) {
        return action();
      });
    });

    angular.mock.inject(function(
      _$q_,
      _$rootScope_,
      _$controller_,
      _inboxIdentitiesService_,
      _INBOX_IDENTITIES_EVENTS_
    ) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      scope = $rootScope.$new();
      inboxIdentitiesService = _inboxIdentitiesService_;
      INBOX_IDENTITIES_EVENTS = _INBOX_IDENTITIES_EVENTS_;
    });
  });

  function initController() {
    var controller = $controller('identityRemoveController', {
      $scope: scope,
      userId: userId,
      identity: identity
    });

    controller.init();
    scope.$digest();

    return controller;
  }
  describe('The onRemoveBtnClick function', function() {
    var identity = { foo: 'bar' };

    it('should reject if failed to remove identity', function(done) {
      inboxIdentitiesService.removeIdentity = sinon.stub().returns($q.reject(new Error('something wrong')));

      var controller = initController();

      controller.identity = identity;
      controller.onRemoveBtnClick()
        .then(function() {
          done(new Error('should not resolve'));
        })
        .catch(function(err) {
          expect(inboxIdentitiesService.removeIdentity).to.have.been.calledWith(identity.uuid, userId);
          expect(err.message).to.equal('something wrong');
          done();
        });

      $rootScope.$digest();
    });

    it('should broadcast the updated identities event if success to remove identity', function(done) {
      var updatedIdentities = [{ baz: 'baz' }];

      inboxIdentitiesService.removeIdentity = sinon.stub().returns($q.resolve(updatedIdentities));
      $rootScope.$broadcast = sinon.spy();

      var controller = initController();

      controller.identity = identity;
      controller.onRemoveBtnClick()
        .then(function() {
          expect(inboxIdentitiesService.removeIdentity).to.have.been.calledWith(identity.uuid, userId);
          expect($rootScope.$broadcast).to.have.been.calledWith(INBOX_IDENTITIES_EVENTS.UPDATED, updatedIdentities);
          done();
        })
        .catch(function(err) {
          done(err || new Error('should resolve'));
        });

      $rootScope.$digest();
    });
  });
});
