angular.module('cfx.routeManager').provider('RouteManager', [
    '$routeProvider', '$locationProvider', '$windowProvider',
function ($routeProvider, $locationProvider, $windowProvider) {

    // === Private Variables ===
    var provider = this,
        basePath = '',
        baseTemplateUrl = '',
        basePathFormatted = false,
        routes = {},
        $window = $windowProvider.$get();

    // === Private Functions ===
    var formatPath = function(path, params){
        if(!params || path == '/') return path;

        for(var param in params) {
            if(!params.hasOwnProperty(param)) continue;
            path = path.replace(new RegExp(':'+param+'([\\?]*)', 'gi'), params[param]);
        }

        // Removes any optional parameters (:name?, :name?/)
        path = path.replace(/(:)[^\/]*(\?)(\/*)/g, '');

        // Remove trailing slash
        path = path.replace(/(\/+)$/, '');

        return path;
    };

    var joinPaths = function(basePath, path) {
        // Remove starting and trailing slashes
        var base = basePath.replace(/^(\/+)/, '').replace(/(\/+)$/, '');

        // Remove starting slash
        path = path.replace(/^(\/+)/, '');

        return (base ? '/' : '') + base + '/' + path;
    };

    var fillBasePath = function(path) {
        var basePathArray = basePath.split('/'),
            pathArray = path.split('/');

        // Replace basePath with the actual path (should replace any path variables with their values)
        basePathArray = pathArray.slice(0, basePathArray.length);

        return basePathArray.join('/');
    };

    var routeNotFound = function(routeName, routes) {
        var routeNames = Object.keys(routes);
        console.error("Route '%s' not found", routeName);
        console.info('Available routes: %o', routeNames);
    };

    // === Public Provider Functions ===
    /**
     * Sets the base path for all routes. If an object is given, it takes:
     * - path: <i>base path for all routes</i>
     * - templateUrl: <i>base path for all Angular templateUrls</i>
     * @param {(Object|string)} bases
     * @returns {Object} RouteManagerProvier
     */
    this.setBase = function(bases) {
        // If only a string is given, it should be basePath
        if(typeof bases === 'string') {
            bases = {
                path: bases
            }
        }

        if(bases.path)
            basePath = bases.path;

        if(bases.templateUrl)
            baseTemplateUrl = bases.templateUrl;

        return this;
    };

    this.addRoute = function(route) {
        var to = {};

        for(var k in route) {
            if(!route.hasOwnProperty(k) || k == 'name' || k == 'path') continue;
            to[k] = route[k];
        }

        routes[route.name] = route;
        this.when(route.path, to);

        return this;
    };

    this.when = function(path, to) {
        path = this.appendToBase(path);

        if(typeof to.templateUrl === 'string')
            to.templateUrl = joinPaths(baseTemplateUrl, to.templateUrl);

        $routeProvider.when(path, to);
        return this;
    };

    /**
     * Wraps $routeProvider.otherwise(), passing in the path for the given route
     * @param routeName Name of the Route
     * @returns {redirect} The function that determines the url to be redirected to
     */
    this.otherwise = function(routeName) {
        var route = routes[routeName];

        var redirect = function(routeParams, path) {
            if($locationProvider.html5Mode()) {
                return fillBasePath(path) + formatPath(route.path, routeParams);
            } else {
                // html5 not supported - insert # after the basepath, then replace route path after
                var pathName = $window.location.pathname,
                    pathArray = pathName.split('/'),
                    actualBasePath = fillBasePath(pathName),
                    basePathSegmentCount = basePath.split('/').length,
                    requestedPath = pathArray.slice(basePathSegmentCount).join('/');  // Get everything after the basePath

                // Move the # to just after the basePath if a longer (html5) path was given
                // else redirect as normal
                if(requestedPath)
                    $window.location.href = actualBasePath + '#/' + requestedPath;
                else
                    return formatPath(route.path, routeParams);
            }
        };

        if(route) {
            $routeProvider.otherwise({ redirectTo: redirect });
        } else {
            routeNotFound(routeName, routes);
        }

        return redirect;
    };

    this.appendToBase = function(path) {
        // If false - do not prepend the basePath. IE9 sucks.
        return $locationProvider.html5Mode() ? joinPaths(basePath, path) : path;
    };

    // === Service ===
    this.$get = function ($location, $routeParams) {
        return {
            routes: routes,
            formatBasePath: function() {
                if(basePathFormatted) return basePath; //TODO: can we test this path?
                var path = formatPath(basePath, $routeParams);

                basePathFormatted = true;
                return basePath = path;
            },
            path: function(path) {
                this.formatBasePath();

                if(path) {
                    path = provider.appendToBase(path);
                    $location.path(path);
                } else {
                    path = ($location.path() || '').replace(basePath, '');
                }

                return path;
            },
            currentRoute: function() {
                var currentPath = this.path();

                for(var name in this.routes) {
                    if(!this.routes.hasOwnProperty(name)) continue;
                    var route = this.routes[name];
                    if(currentPath == route.path) {
                        return route;
                    }
                }

                return null;
            },

            /**
             * Routes are defined in <code>/:module-name/routes.js</code>
             * @param routeName The name of the route
             * @returns {string} $location.path()
             */
            routeTo: function(routeName, params) {
                this.formatBasePath();

                var route = this.routes[routeName];

                if(route) {
                    var path = formatPath(route.path, params);

                    return this.path(path);
                } else {
                    routeNotFound(routeName, this.routes);
                    return this.path();
                }
            }
        };
    }
}]);