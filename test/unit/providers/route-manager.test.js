describe('Providers', function () {
    var RouteManagerProvider,
        locationProvider,
        routeProvider,
        $window;

    beforeEach(function () {
        angular.module('test-module', function(){})
            .config(function(_RouteManagerProvider_, $routeProvider, $locationProvider) {
                RouteManagerProvider = _RouteManagerProvider_;
                routeProvider = $routeProvider;
                locationProvider = $locationProvider;
                locationProvider.html5Mode(true);
            });

        module(function($provide) {
            $provide.provider('$window', function() {
                this.$get = function() {
                    $window = {
                        location: {
                            href: '',
                            pathname: ''
                        }
                    };
                    return $window;
                };
            });
        });

        angular.mock.module('cfx.routeManager', 'test-module');

        inject(function () {});
    });

    describe('RouteManagerProvider', function () {
        var whenSpy;

        beforeEach(function() {
            whenSpy = spyOn(routeProvider, 'when');
        });

        describe('setBase()', function() {
            it('should return the RouteManagerProvider', function() {
                var actual = RouteManagerProvider.setBase('');

                expect(actual).toEqual(RouteManagerProvider);
            });
        });

        describe('appendToBase()', function() {
            it('should prevent a double slash', function() {
                RouteManagerProvider.setBase('/base/path/');
                var path = '/a/path';

                var newPath = RouteManagerProvider.appendToBase(path);

                expect(newPath).toEqual('/base/path/a/path');
            });

            it('should add slashes when not given one', function() {
                RouteManagerProvider.setBase('/base/path/');
                var path = 'a/path';

                var newPath = RouteManagerProvider.appendToBase(path);

                expect(newPath).toEqual('/base/path/a/path');
            });
        });

        describe('when()', function() {
            it('should call routeProvider.when() with expected parameters', function() {
                RouteManagerProvider.when('test/path', { foo: 'bar' });

                expect(whenSpy).toHaveBeenCalledWith('/test/path', { foo: 'bar' });
            });

            it('should call routeProvider.when() with the basePath prepended', function() {
                var basePath = '/base/path';
                RouteManagerProvider.setBase(basePath);

                RouteManagerProvider.when('test/path', { foo: 'bar' });

                expect(whenSpy).toHaveBeenCalledWith(basePath + '/test/path', { foo: 'bar' });
            });

            it('should call routeProvider.when() with the baseTemplateUrl prepended', function() {
                var baseTemplateUrl = '/base/path';
                RouteManagerProvider.setBase({ templateUrl: baseTemplateUrl });

                RouteManagerProvider.when('test/path', { templateUrl: 'bar' });

                expect(whenSpy).toHaveBeenCalledWith('/test/path', { templateUrl: baseTemplateUrl + '/bar' });
            });

            it('should join the path with the base path', function() {
                RouteManagerProvider.setBase('/base');

                RouteManagerProvider.when('/a/path', {});

                expect(whenSpy).toHaveBeenCalledWith('/base/a/path', {});
            });

            it('should return the RouteManagerProvider', function() {
                var actual = RouteManagerProvider.when('test/path', {});

                expect(actual).toEqual(RouteManagerProvider);
            });
        });

        describe('addRoute()', function() {
            var route;

            beforeEach(function() {
                route = { name: 'Home', path: '/home' };
            });

            it('should add the route to RouteManager.routes', function() {
                RouteManagerProvider.addRoute(route);

                inject(function(RouteManager) {
                    expect(RouteManager.routes.Home).toEqual(route);
                });
            });

            it('should call RouteManagerProvider.when() with expected parameters', function() {
                var whenSpy = spyOn(RouteManagerProvider, 'when');
                route.foo = 'bar';

                RouteManagerProvider.addRoute(route);

                expect(whenSpy).toHaveBeenCalledWith(route.path, {foo: 'bar'});
            });

            it('should return the RouteManagerProvider', function() {
                var actual = RouteManagerProvider.addRoute(route);

                expect(actual).toEqual(RouteManagerProvider);
            });

            it('should append the basePath if the path is a string', function() {
                RouteManagerProvider.setBase('/base');

                RouteManagerProvider.addRoute(route);

                expect(whenSpy).toHaveBeenCalledWith('/base' + route.path, {});
            });
        });

        describe('otherwise()', function() {
            it('should redirect to home on unknown route', function() {
                RouteManagerProvider
                    .setBase('/landing/service-history/:foobar')
                    .addRoute({ name: 'Home', path: '/service-history' });
                var redirect = RouteManagerProvider.otherwise('Home');

                // Simulates browser hitting '/landing/service-history/123456'
                var result = redirect({}, '/landing/service-history/123456');

                expect(result).toEqual('/landing/service-history/123456/service-history');
            });

            it('should not remove trailing slash from just "/"', function() {
                RouteManagerProvider
                    .setBase('/landing/service-history/:foobar')
                    .addRoute({ name: 'Home', path: '/' });
                var redirect = RouteManagerProvider.otherwise('Home');

                // Simulates browser hitting '/landing/service-history/123456/wrong-path'
                var result = redirect({}, '/landing/service-history/123456/wrong-path');

                expect(result).toEqual('/landing/service-history/123456/');
            });

            it('should move the hash when not in html5 mode', function() {
                locationProvider.html5Mode(false);

                RouteManagerProvider
                    .setBase('/landing/service-history/:foobar')
                    .addRoute({ name: 'Home', path: '/service-history' })
                    .addRoute({ name: 'Record', path: '/service-record' });
                var redirect = RouteManagerProvider.otherwise('Home');

                $window.location.pathname = '/landing/service-history/123456/service-record';
                redirect({}, '');

                expect($window.location.href).toEqual('/landing/service-history/123456#/service-record');
            });

            it('should still redirect to the given route in html5mode after adjusting the hash', function() {
                locationProvider.html5Mode(false);

                RouteManagerProvider
                    .setBase('/landing/service-history/:foobar')
                    .addRoute({ name: 'Home', path: '/service-history' });
                var redirect = RouteManagerProvider.otherwise('Home');

                // Simulates browser hitting '/landing/service-history/123456#/service-thing'
                $window.location.pathname = '/landing/service-history/123456';
                var result = redirect({}, '/service-thing');

                expect(result).toEqual('/service-history');
            });

            it('should not remove trailing slash from just "/" in non-html5Mode', function() {
                locationProvider.html5Mode(false);

                RouteManagerProvider
                    .setBase('/landing/service-history/:foobar')
                    .addRoute({ name: 'Home', path: '/' });
                var redirect = RouteManagerProvider.otherwise('Home');

                // Simulates browser hitting '/landing/service-history/123456/wrong-path'
                $window.location.pathname = '/landing/service-history/123456';
                var result = redirect({}, '/wrong-path');

                expect(result).toEqual('/');
            });
        });
    });
});

/**
 * Second module
 * This time with html5mode disabled
 */
describe('Providers', function() {
    var RouteManagerProvider,
        routeProvider;
    describe('RouteManagerProvider', function() {
        describe('appendToBase()', function() {
            beforeEach(function () {
                angular.module('test-module', function(){})
                    .config(function(_RouteManagerProvider_, $routeProvider, $locationProvider) {
                        RouteManagerProvider = _RouteManagerProvider_;
                        routeProvider = $routeProvider;
                        $locationProvider.html5Mode(false);
                    });

                angular.mock.module('cfx.routeManager', 'test-module');
                inject(function () {});
            });

            it('should not prepend basePath if html5Mode is disabled', function() {
                var basePath = '/base/path',
                    path = 'a/path';
                RouteManagerProvider.setBase(basePath);

                var newPath = RouteManagerProvider.appendToBase(path);

                expect(newPath).toEqual('a/path');
            });

            it('should still prepend baseTemplateUrl if html5Mode is disabled', function() {
                var baseTemplateUrl = '/base/path',
                    path = '/path',
                    templateUrl = '/a/path',
                    whenSpy = spyOn(routeProvider, 'when');
                RouteManagerProvider.setBase({ templateUrl: baseTemplateUrl });

                var newPath = RouteManagerProvider.when(path, { templateUrl: templateUrl });

                expect(whenSpy).toHaveBeenCalledWith(path, { templateUrl: baseTemplateUrl + templateUrl });
            });
        })
    })
});