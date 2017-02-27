(function () {
    "use strict";

    var User = require("./user");
    var Task = require("./task");

    // Exports all modules as module way
    module.exports = {
        User: User,
        Task: Task
    };

})();
