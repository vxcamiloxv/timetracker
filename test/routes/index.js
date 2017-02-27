(function () {
    "use strict";

    var users = require("./users");
    var tasks = require("./tasks");
    var server = require("../../app/app");
    // Unit test all routes
    function routesTest () {
        describe("Modules Unit Tests", function () {
            server.createServer(global.config).then(function (res) {
                var app = res.app;
                users(app);
                tasks(app);
            });
        });
    }

    module.exports = routesTest;
})();
