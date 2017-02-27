(function () {
    "use strict";

    var auth = require("./auth");
    var users = require("./users");
    var tasks = require("./tasks");

    // Exports all routes as module way
    module.exports = {
        auth: auth,
        users: users,
        tasks: tasks
    };

})();
