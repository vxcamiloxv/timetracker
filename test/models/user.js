/**
 *  User Integration Test
 **/
(function () {
    "use strict";

    var caminte = require("caminte");
    var Schema = caminte.Schema;
    var userModel = require("../../app/models/user");

    function userTest () {
        var config = global.config;
        config.host = process.env.DB_HOST || config.database.host;
        var schema = new Schema(config.database.driver, config.database);
        var User = userModel(schema);

        describe("User model:", function () {
            var id;

            before(function (done) {
                schema.autoupdate(done);
            });

            after(function (done) {
                User.destroyAll(done);
            });

            it("#create", function (done) {
                User.create(function (err, created) {
                    expect(err).not.exist();
                    created.should.be.have.property("id");
                    created.id.should.not.eql(null);
                    id = created.id;
                    done();
                });
            });

            it("#exists", function (done) {
                User.exists(id, function (err, exists) {
                    expect(err).not.exist();
                    expect(exists).to.be.true();
                    done();
                });
            });

            it("#findById", function (done) {
                User.findById(id, function (err, found) {
                    expect(err).not.exist();
                    found.id.should.eql(id);
                    done();
                });
            });

            it("#findOne", function (done) {
                User.findOne({
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
                User.find({}, function (err, founds) {
                    expect(err).not.exist();
                    expect(founds).to.be.an("array");
                    done();
                });
            });

            it("#all", function (done) {
                User.all({}, function (err, founds) {
                    expect(err).not.exist();
                    expect(founds).to.be.an("array");
                    done();
                });
            });


            it("#destroyById", function (done) {
                User.destroyById(id, function (err) {
                    expect(err).not.exist();
                    User.findById(id, function (err, found) {
                        expect(err).not.exist();
                        expect(err).not.exist();
                        done();
                    });
                });
            });

            it("#destroyAll", function (done) {
                User.destroyAll(function (err) {
                    expect(err).not.exist();
                    User.find({}, function (err, founds) {
                        expect(err).not.exist();
                        founds.should.length(0);
                        done();
                    });
                });
            });
        });
    }
    module.exports = userTest;
})();
