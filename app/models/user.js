/**
 *  User schema
 *
 **/
(function () {
    "use strict";

    function userModel (schema) {
        var User = schema.define("User", {
            name : { type : schema.String, "null": false },
            email : { type : schema.String },
            avatar : { type : schema.String },
            provider : { type : schema.String },
            provider_id : { type : schema.Number },
            token : { type : schema.String },
            secret : { type : schema.String },
            created_at : { type : schema.Date, default: Date.now },
            update_at : { type : schema.Date }
        },{});
        return User;
    }

    module.exports = userModel;

})();
