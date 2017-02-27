/**
 *  User Functional Test
 **/
(function () {
    "use strict";

    var request = require("supertest");
    var server = require("../../app/app");
    var id, user, app;

    function usersRoutes (app) {
        describe("User routes:", function () {

            before(function (done) {
                done();
            });

            after(function (done) {
                done();
            });

            it("users#create", function (done) {
                request(app)
                    .post("/api/users")
                    .field("name", "Test user")
                    .set("Accept", "application/json")
                    .expect(201)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body).to.be.an("object");
                        id = res.body.id;
                        done();
                    });
            });


            it("users#index", function (done) {
                request(app)
                    .get("/api/users")
                    .set("Accept", "application/json")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body).to.be.an("array");
                        done();
                    });
            });

            it("users#show", function (done) {
                request(app)
                    .get("/api/users/" + id)
                    .set("Accept", "application/json")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body).to.be.an("object");
                        user = res.body;

                        done();
                    });
            });

            it("users#update", function (done) {
                request(app)
                    .put("/api/users/" + id)
                    .set("Accept", "application/json")
                    .field("name", "Test name")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body).to.be.an("object");
                        done();
                    });
            });

            it("users#delete", function (done) {
                request(app)
                    .delete("/api/users/" + id)
                    .set("Accept", "application/json")
                    .expect(204)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body).to.be.an("object");
                        done();
                    });
            });

        });
    }

    module.exports = usersRoutes;
})();
