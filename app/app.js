/**
 * @fileOverview main app
 * @name app.js
 * @author Camilo Quimbayo <vxcamiloxv@openmailbox.org>
 */
(function () {
    "use strict";

    var q = require("q");
    var ld = require("lodash");
    var fs = require("fs");
    var path = require("path");
    var http = require("http");
    var boom = require("boom");
    var nunjucks = require("nunjucks");
    var helmet = require("helmet");
    var morgan  = require("morgan");
    var session = require("express-session");
    var SessionStore = require("express-sessions");
    var favicon = require("serve-favicon");
    var useragent = require("express-useragent");
    var bodyParser = require("body-parser");
    var compression = require("compression");
    var express = require("express");
    var routes = require("./routes");
    var passport = require("passport");
    var auth = require("./controllers/auth");
    var logger = require("./helpers/logger.js");
    var database = require("./helpers/database.js");

    function createServer (configData) {
        var deferred = q.defer();
        var app = express();
        var server;
        var log;


        // Define basics
        var port = configData.port;
        var host = configData.host || configData.hostname;
        var address = configData.address || host;
        configData.urlHost = configData.urlHost || address + (port === 443 || port === 80 ? "" : ":" + port);

        log = logger.init(configData);

        // Create server
        configData.urlHost = "http://" + configData.urlHost;
        log.debug("Run over HTTP Server.");
        server = http.createServer(app);

        // Set render engine
        app.set("view engine", "html");
        nunjucks.configure(path.resolve(__dirname, "./views"), {
            autoescape: true,
            express: app,
            tags: {
                variableStart: "{{=",
                variableEnd: "=}}"
            }
        });

        // Static files
        app.use(express.static(path.resolve(__dirname, "../public"), { maxAge: 86400000 }));
        if(fs.existsSync(configData.favicon)) {
            app.use(favicon(configData.favicon));
        }

        // Setup session
        var sessionMiddleware = session({
            secret: configData.secret,
            resave: false,
            saveUninitialized: false,
            store: /redis|mongodb/.test(configData.database.driver) ? new SessionStore({
                storage: configData.database.driver,
                host: configData.database.host,
                port: configData.database.port,
                db: configData.database.database,
                expire: 86400
            }) : null
            // cookie: { secure: true }
        });

        // Acces log
        app.use(logger.logRequest());
        if(logger.logAccess.format) {
            app.use(morgan(logger.logAccess.format, logger.logAccess.streams));
        }
        // Proxy
        app.set("trust proxy", configData.proxy || false);

        // Body parse
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

        // Some middlewares
        app.use(useragent.express());
        app.use(sessionMiddleware);
        if (configData.compression) {
            app.use(compression());
        }

        // Secure policy
        app.use(helmet());

        // Passport
        auth.passportSetup(passport, configData.auth);
        app.use(passport.initialize());
        app.use(passport.session());

        // App locals
        app.locals.site = {
            siteName: configData.siteName
        };
        app.locals.default = {
            customer: {name: configData.siteName}
        };
        app.locals.version = configData.version;

        // Default data
        app.use(function (req, res, next) {
            // Locals by request
            res.locals.page = {url: req.originalUrl};
            res.locals.customer = {name: configData.siteName}; // Default customer
            res.locals.principal = null;

            next();
        });

        // Set config
        app.config = configData;

        // Listen server
        server.listen(port, address, function () {
            // Set instance
            app.address = this.address();
            app.address.port = port;
            app.address.host = host;

            // Load database
            database.init(configData.database).then(function (data) {
                app.database = data.database;

                // load all routes
                app.get("/", function (req, res) {
                    res.render("index");
                });
                app.all("/api/*",function (req, res, next) {
                    if (process.env.NODE_ENV == "test") {
                        return next();
                    }
                    if (ld.has(req.session, "passport.user")) {
                        req.log.debug(req.session.passport, "user has session active");
                        next();
                    } else {
                        next(boom.unauthorized("Please login with twitter"));
                    }
                });
                ld.forEach(routes, function (route, key) {
                    if (ld.has(route, "api")) {
                        app.use("/api/" + key, route.api);
                    } else if (ld.has(route, "root")) {
                        app.use("/", route.root);
                    } else if (ld.has(route, key)) {
                        app.use("/" + key, route[key]);
                    } else {
                        app.use("/" + key, route);
                    }
                });

                // Error Handler
                app.use(error404);
                app.use(errorHandler);

                deferred.resolve({app: app});
            }, deferred.reject);

        });
        /**
         * @private
         */

        function error404 (req, res, next) {
            // Server error and redirect
            next(boom.notFound());
        }

        function errorHandler (err, req, res, next) {
            var code = ld.get(err, "output.statusCode") || err.status || err.code || 500;
            var payload = ld.get(err, "output.payload") || {};
            var msg = payload.message || payload.error || err.message;
            var output = payload || {error: msg, statusCode: code};

            res.status(code);

            if (req.xhr || req.originalUrl.substr(0, 5) === "/api/") {
                res.json(output);
            } else {
                res.render("error", {
                    page: {
                        title: msg
                    }, error: {
                        status: code,
                        message: msg,
                        stack: configData.enviroment == "development" ? err.stack : msg
                    }});
            }
        }

        function removeListeners () {
            server.removeListener("listening", listenSuccessHandler);
            server.removeListener("err", listenErrorHandler);
        }
        function listenErrorHandler (err) {
            removeListeners();
            deferred.reject(err);
        }
        function listenSuccessHandler () {
            removeListeners();
        }

        // Events
        server.on("error", listenErrorHandler);
        server.on("listening", listenSuccessHandler);

        process.on("uncaughtException", function (err) {
            log = log || console;
            log.error(err);
        });
        process.on("exit", function (code) {
            log = log || console;
            log.debug("About to exit process " + process.pid + " with code: " + code);
        });

        // Promise
        return deferred.promise;
    }

    // Exports
    module.exports = {
        createServer: createServer
    };

})();
