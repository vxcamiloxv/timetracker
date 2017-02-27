/**
 *  Task Integration Test
 **/
(function () {
    "use strict";

    var caminte = require("caminte");
    var Schema = caminte.Schema;
    var taskModel = require("../../app/models/task");

    function taskTest () {
        var config = global.config;
        config.host = process.env.DB_HOST || config.database.host;
        var schema = new Schema(config.database.driver, config.database);
        var Task = taskModel(schema);

        describe("Task model:", function () {
            var id;

            before(function (done) {
                schema.autoupdate(done);
            });

            after(function (done) {
                Task.destroyAll(done);
            });

            it("#create", function (done) {
                Task.create(function (err, created) {
                    expect(err).not.exist();
                    created.should.be.have.property("id");
                    created.id.should.not.eql(null);
                    id = created.id;
                    done();
                });
            });

            it("#exists", function (done) {
                Task.exists(id, function (err, exists) {
                    expect(err).not.exist();
                    expect(exists).to.be.true();
                    done();
                });
            });

            it("#findById", function (done) {
                Task.findById(id, function (err, found) {
                    expect(err).not.exist();
                    found.id.should.eql(id);
                    done();
                });
            });

            it("#findOne", function (done) {
                Task.findOne({
                    where: {
                        id: id
                    }
                }, function (err, found) {
                    expect(err).not.exist();
                    found.id.should.eql(id);
                    done();
                });
            });

            it("#find", function (done) {
                Task.find({}, function (err, founds) {
                    expect(err).not.exist();
                    expect(founds).to.be.an("array");
                    done();
                });
            });

            it("#all", function (done) {
                Task.all({}, function (err, founds) {
                    expect(err).not.exist();
                    expect(founds).to.be.an("array");
                    done();
                });
            });


            it("#destroyById", function (done) {
                Task.destroyById(id, function (err) {
                    expect(err).not.exist();
                    Task.findById(id, function (err, found) {
                        expect(err).not.exist();
                        expect(err).not.exist();
                        done();
                    });
                });
            });

            it("#destroyAll", function (done) {
                Task.destroyAll(function (err) {
                    expect(err).not.exist();
                    Task.find({}, function (err, founds) {
                        expect(err).not.exist();
                        founds.should.length(0);
                        done();
                    });
                });
            });
        });
    }
    module.exports = taskTest;
})();
