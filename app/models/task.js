/**
 *  Task schema
 *
 **/
(function () {
    "use strict";

    function taskModel (schema) {
        var Task = schema.define("Task", {
            name : { type: schema.String, "null": false },
            user_id: {type: schema.Number, "null": false, index: true},
            active: {type: schema.Integer,  default: false, index: true},
            duration: {type: schema.Number },
            start_at : { type : schema.Date, default: Date.now },
            pause_at : { type : schema.Date, default: Date.now },
            end_at : { type : schema.Date, default: Date.now }
        },{
        });
        return Task;
    }

    module.exports = taskModel;

})();
