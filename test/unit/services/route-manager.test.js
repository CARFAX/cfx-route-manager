describe('Services', function () {
    var RouteManager,
        basePath = '/test/:vehicleId';

    describe('RouteManager', function () {

        beforeEach(function () {
            angular.module('test-module', function(){})
                .config(function(RouteManagerProvider, $locationProvider) {
                    RouteManagerProvider.setBase(basePath);
                    $locationProvider.html5Mode(true);
                });

            angular.mock.module('cfx.routeManager', 'test-module');
        });

        describe('formatBasePath()', function() {
            it('should replace route variables with correct values', inject(function(RouteManager, $routeParams) {
                $routeParams.vehicleId = 'abc123';
                var expectedPath = '/test/' + $routeParams.vehicleId;

                var actual = RouteManager.formatBasePath();

                expect(actual).toEqual(expectedPath);
            }));
        });

        describe('path()', function() {
            it('should call RouteManager.formatBasePath()', inject(function(RouteManager) {
                var formatSpy = spyOn(RouteManager, 'formatBasePath');

                RouteManager.path('/a/path');

                expect(formatSpy).toHaveBeenCalled();
            }));

            it('should append the path to the base path', inject(function(RouteManager, $location) {
                var pathSpy = spyOn($location, 'path');

                RouteManager.path('/a/path');

                expect(pathSpy).toHaveBeenCalledWith(basePath + '/a/path');
            }));

            it('should call $location.path() with expected parameters', inject(function(RouteManager, $location) {
                var pathSpy = spyOn($location, 'path');

                RouteManager.path('/');

                expect(pathSpy).toHaveBeenCalledWith(basePath + '/');
            }));

            it('should return $location.path()', inject(function(RouteManager, $location) {
                spyOn($location, 'path').andCallFake(function() {
                    return '/fake/path';
                });

                var path = RouteManager.path();

                expect(path).toEqual('/fake/path');
            }));

            it('should return $location.path() without the base path', inject(function(RouteManager, $location, $routeParams) {
                $routeParams.vehicleId = 123;
                spyOn($location, 'path').andCallFake(function() {
                    return '/test/123/fake/path';
                });

                var path = RouteManager.path();

                expect(path).toEqual('/fake/path');
            }));
        });

        describe('currentRoute()', function() {
            it('should return the current route', inject(function(RouteManager) {
                var route = { name: 'Home', path: '/foo/bar' };
                RouteManager.routes.Home = route;
                spyOn(RouteManager, 'path').andCallFake(function() {
                    return route.path;
                });

                var currentRoute = RouteManager.currentRoute();

                expect(currentRoute).toEqual(route);
            }));

            it('should return null if not found', inject(function(RouteManager) {
                RouteManager.routes.Home = { name: 'Home', path: '/foo/bar' };
                spyOn(RouteManager, 'path').andCallFake(function() {
                    return '/fake/path';
                });

                var currentRoute = RouteManager.currentRoute();

                expect(currentRoute).toBe(null);
            }));
        });

        describe('routeTo()', function() {
            it('should call RouteManager.formatBasePath()', inject(function(RouteManager) {
                var formatSpy = spyOn(RouteManager, 'formatBasePath');

                RouteManager.routeTo('Home');

                expect(formatSpy).toHaveBeenCalled();
            }));

            it('should call RouteManager.path() with the correct path', inject(function(RouteManager) {
                var route = { name: 'Home', path: '/foo/bar' },
                    pathSpy = spyOn(RouteManager, 'path');
                RouteManager.routes.Home = route;

                RouteManager.routeTo(route.name);

                expect(pathSpy).toHaveBeenCalledWith(route.path);
            }));

            it('should return RouteManager.path()', inject(function(RouteManager) {
                var fakePath = '/fake/path';
                RouteManager.routes.Home = { name: 'Home', path: '/foo/bar' };
                spyOn(RouteManager, 'path').andCallFake(function() {
                    return fakePath;
                });

                var path = RouteManager.routeTo();
                expect(path).toEqual(fakePath);

                path = RouteManager.routeTo('Home');
                expect(path).toEqual(fakePath);
            }));

            describe('parameter formatting', function() {

                it('should format any parameters passed', inject(function(RouteManager) {
                    var route = { name: 'Home', path: '/foo/:bar' },
                        pathSpy = spyOn(RouteManager, 'path');
                    RouteManager.routes.Home = route;

                    RouteManager.routeTo(route.name, { bar: 'abc123' });

                    expect(pathSpy).toHaveBeenCalledWith('/foo/abc123');
                }));

                it('should remove the ? from optional parameters', inject(function(RouteManager) {
                    var route = { name: 'Home', path: '/foo/:bar?' },
                        pathSpy = spyOn(RouteManager, 'path');
                    RouteManager.routes.Home = route;

                    RouteManager.routeTo(route.name, { bar: 'abc123' });

                    expect(pathSpy).toHaveBeenCalledWith('/foo/abc123');
                }));

                it('should remove unused optional parameters', inject(function(RouteManager) {
                    var route = { name: 'Home', path: '/foo/:bar?' },
                        pathSpy = spyOn(RouteManager, 'path');
                    RouteManager.routes.Home = route;

                    RouteManager.routeTo(route.name, {});

                    expect(pathSpy).toHaveBeenCalledWith('/foo');
                }));
            });
        });
    });
});