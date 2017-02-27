(function () {
    "use strict";

    var logger = require("./logger");
    var database = require("./database");
    var config = require("../../config");


  // Export
    module.exports = {
        config: config,
        logger: logger,
        database: database
    };

})();
