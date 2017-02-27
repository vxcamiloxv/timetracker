(function () {
    "use strict";

    var path = require("path"),
        cpsPackage = require("../../package");

    module.exports = {
        siteName: "Time Tracker",
        version: cpsPackage.version,
        database: {},
        session: {},
        host: "127.0.0.1",
        port: 2705,
        urlPort: null,
        secret: null,
        enviroment: "development",
        nologger: false,
        logFile: null,
        logLevel: "info",
        serverUser: null,
        compression: true,
        favicon: path.resolve(__dirname, "../../public/static/favicon.ico")
    };

})();
