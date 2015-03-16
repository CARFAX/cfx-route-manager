cfx-route-manager.js
=====

A CARFAX Angular library that provides advanced Routing, with support for backwards-compatible html5 mode.


### Simultaneous Hashless and Hashed Routes

`cfx-route-manager` allows you to set up routes that can run normally (/path#/to/place) and in html5 mode (eg. /path/to/place).

This makes supporting older browsers easier, but still promotes clean routes on modern browsers.

This also means that users arriving to your site from a clean URL (/path/to/place) will be redirected to (/path#/to/place) in older browsers without html5 mode.


Installation
-----

This library can be installed via bower

    bower install cfx-js

or npm, for use with software like Browserify

    npm install cfx-js

To include the code, either

    var cfx = require('cfx-route-manager')

or

    <script src='bower_components/cfx-js/dist/cfx.js'></script>

Then add `cfx.routeManager` as a dependency to your Angular app

    angular.module('yourModule', ['cfx.routeManager'])

Usage
-----

`cfx.routeManager` ships with one Provider, `RouteManagerProvider`, which also has an attached Service `RouteManager`.

### RouteManagerProvider

Used in the `config` block to set up routes for your application.

#### html5 and hash mode simultaneous usage

It is possible to set up your application to accept both html5 routes (domain.com/path/to/state) and also hashed routes (domain.com/path#/to/state)

If you want this functionality, please enable html5 mode before you set up any routes

    // If html5 mode can be enabled - enable it.
    if(window.history && history.pushState)
        $locationProvider.html5Mode(true)

#### Adding Routes

Routes are named, and paths should be declared in their entirety (ie, the whole pathname after the domain)

    RouteManagerProvider
        .addRoute({
            name: 'Home',
            path: '/path',
            templateUrl: '/html/templates/home.html',
            controller: 'HomeController'
        })
        .addRoute({
            name: 'List',
            path: '/path/list',
            templateUrl: 'templates/list.html',
            controller: 'ListController'
        })

#### Base Paths

You may declare a base url for the browser path and also templates.

    RouteManagerProvider
        .setBase({
            path: '/path',
            templateUrl: '/html/templates'
        })
        .addRoute({
            name: 'Home',
            path: '/',
            templateUrl: 'home.html',
            controller: 'HomeController'
        })
        .addRoute({
            name: 'List',
            path: '/list',
            templateUrl: 'list.html',
            controller: 'ListController'
        })

#### Redirecting

You may declare a route to redirect to, if none of the declared routes are hit.

    RouteManagerProvider
        .otherwise('Home')

### RouteManager (Service)

Used in your Controllers, Services, and Factories to manage the state of the app.

#### Changing the Route

You can redirect to another declared route with

    RouteManager.routeTo('List')

#### Changing the Path Manually

`RouteManager.path` will act exactly like `$location.path`, except that it takes into account the Base Path.

    RouteManagerProvider.setBase({
         path: '/path'
    })

    RouteManager.path('list')

    >> /path/list

#### Getting the Current Route

Returns the current Route object

    RouteManager.currentRoute()

    >> {
    >>     name: 'List',
    >>     path: '/list',
    >>     templateUrl: 'list.html',
    >>     controller: 'ListController'
    >> }

Documentation
-----

Documented examples can be found at [carfax.github.io/cfx-route-manager](http://carfax.github.io/cfx-route-manager/)

Contact & License Info
-----

Author: CARFAX First-Class Frontend Team
Email: opensource@carfax.com
License: MIT