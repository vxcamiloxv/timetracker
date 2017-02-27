(function () {
    "use strict";

    module.exports = {
        port: 3030,
        hostname: "localhost",
        secret: "hsh#456&&",
        database: {
            driver     : "redis",
            host       : "localhost",
            port       : "6379"
        },
        auth: {
            twitter: {
                key: "Tos4cKkrKNiqyqhogfwZ",
                secret: "0A9VZyO2tZ3vYlLElh1CZcx5us5WCAI6oHYy1"
            }
        },
        logPath: "/tmp/logs/",
        logLevel: "debug"
    };

})();
