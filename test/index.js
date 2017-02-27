(function () {
    "use strict";

    var ld = require("lodash");
    var sinon = require("sinon");
    var chai = require("chai");
    var models = require("./models");
    var routes = require("./routes");
    var defaults = require("../app/helpers/defaults");
    var config = require("../config.example");

    var testQueryCache = [];
    var oldIt = it;

    // Configuration
    var configData = ld.clone(config);
    configData = ld.defaults(configData, defaults);

    // Env
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = "test";
    }
    // Databases
    configData.database = configData.database &&
        configData.database[configData.enviroment] || configData.database || {};

    it = function () {
        testQueryCache = [];
        return oldIt.apply(this, arguments);
    };

    // Events
    process.on("unhandledRejection", function (reason, promise) {
        console.error(reason);
    });


    // chai.use(require('chai-as-promised'));
    chai.use(require("sinon-chai"));
    chai.use(require("dirty-chai"));
    chai.should();

    global.config = configData;
    global.sinon = sinon;
    global.chai = chai;
    global.expect = chai.expect;
    global.AssertionError = chai.AssertionError;
    global.Assertion = chai.Assertion;
    global.assert = chai.assert;
    global.testQueryCache = testQueryCache;

    // Unit test all of the abstract base interfaces
    describe("Unit Tests", function () {
        models();
        routes();
    });

})();
