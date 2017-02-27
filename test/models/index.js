(function () {
    "use strict";

    var user = require("./user");
    var task = require("./task");

    // Unit test all modules
    function modelsTest () {
        describe("Models Unit Tests", function () {
            user();
            task();
        });
    }

    module.exports = modelsTest;
})();
