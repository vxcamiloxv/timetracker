/**
 *  Task Functional Test
 **/
(function () {
    "use strict";

    var request = require("supertest");
    var id, task;

    function tasksRoutes (app) {

        describe("Task routes:", function () {

            before(function (done) {
                done();
            });

            after(function (done) {
                done();
            });

            it("tasks#create", function (done) {
                request(app)
                    .post("/api/tasks")
                    .field("name", "Test task")
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


            it("tasks#index", function (done) {
                request(app)
                    .get("/api/tasks")
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

            it("tasks#show", function (done) {
                request(app)
                    .get("/api/tasks/" + id)
                    .set("Accept", "application/json")
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body).to.be.an("object");
                        task = res.body;

                        done();
                    });
            });

            it("tasks#update", function (done) {
                request(app)
                    .put("/api/tasks/" + id)
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

            it("tasks#delete", function (done) {
                request(app)
                    .delete("/api/tasks/" + id)
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

    module.exports = tasksRoutes;
})();
