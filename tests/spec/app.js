'use strict';

describe('Module: app', function () {

	// load the service's module
	beforeEach(module('ionPress'));

	var $httpBackend, wpApi;
	beforeEach(inject(function (_$httpBackend_, _wpApi_) {
        $httpBackend = _$httpBackend_;
        wpApi = _wpApi_;

        /**
         * Application Route makes requests to categories and posts before loading views
         * Even during our unit testing - set the expectations here so they don't affect our actual tests
         */
        $httpBackend.when('GET', wpApi.baseUrl + wpApi.category.endpoint).respond(200, JSON.stringify([{
            id : 'abcde',
            name : 'test'
        }]));

        $httpBackend.when('GET', wpApi.baseUrl + wpApi.post.endpoint).respond(200, JSON.stringify([{
            id : 1,
            name : 'test'
        }]));

        $httpBackend.expect('GET', wpApi.baseUrl + wpApi.category.endpoint);
        $httpBackend.expect('GET', wpApi.baseUrl + wpApi.post.endpoint);
	}));

    var $state, $injector, rootScope;
    beforeEach(inject(function (_$state_, _$rootScope_, _$injector_) {
        $state = _$state_;
        $injector = _$injector_;
        rootScope = _$rootScope_;
    }));

    afterEach(inject(function($httpBackend){
        //These two calls will make sure that at the end of the test, all expected http calls were made
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    describe('State: app', function () {
        var state;
        beforeEach(function () {
            state = $state.get('app');
        });

        it('should use the MainCrl', function () {
            expect(state.controller).toBe('MainCtrl')
        });

        it('should be an abstract view', function () {
            expect(state.abstract).toBe(true)
        });

        it('should resolve categories', function () {
            expect(state.resolve.categories).toBeDefined();

            $injector.invoke(state.resolve.categories).then(function (categories) {
                expect(Array.isArray(categories));
            });
        });
    });

    describe('State: app.category', function () {
        var state;
        beforeEach(function () {
            state = $state.get('app.category', {id: 1});
        });

        it('should use the ArticlesCtrl', function () {
            expect(state.views.content.controller).toBe('ArticlesCtrl')
        });

        it('should resolve a category for id:1', function () {
            expect(state.resolve.category).toBeDefined();

            $httpBackend.when('GET', wpApi.baseUrl + wpApi.category.endpoint + '/1').respond(200, JSON.stringify({
                id : 1,
                name : 'test'
            }));

            // Invoke resolve function and pass $stateParams.id
            $injector.invoke(state.resolve.category, {} , {
                $stateParams: {id: 1}
            }).then(function (category) {
                expect(category).toBeDefined();
                expect(category.id).toBe(1);
            });
        });

        it('should resolve articles for category id:1', function () {
            expect(state.resolve.articles).toBeDefined();

            $httpBackend.when('GET', wpApi.baseUrl + wpApi.post.endpoint + '?filter[cat]=1').respond(200, JSON.stringify([{
                id : 1,
                name : 'test'
            }]));

            // Invoke resolve function and pass $stateParams.id
            $injector.invoke(state.resolve.articles, {} , {
                $stateParams: {id: 1}
            }).then(function (articles) {
                expect(articles).toBeDefined();
                expect(Array.isArray(articles)).toBe(true);
            });
        });
    });
});
