/**
 * @fileOverview main app
 * @name main.js
 * @author Camilo Quimbayo <vxcamiloxv@openmailbox.org>
 */
(() => {
    "use strict";

    const Vue = require("vue");
    const ld = require("lodash");
    const moment = require("moment");
    const vueResource = require("vue-resource");
    const vueTimepicker = require("vue2-timepicker");

    // Plugins
    Vue.use(vueResource);
    Vue.use(vueTimepicker);

    // Instance
    var vue = new Vue({
        el: "#app",
        components: {vueTimepicker},

        data: {
            user: {id: "", name: "", avatar: "", isAuthenticated: false},
            task: {name: "", end_at: ""},
            taskActive: {},
            error: {},
            total: 0,
            timer: null,
            time: {
                HH: "00",
                mm: "00",
                ss: "00"
            },
            duration: 0,
            tasks: []
        },

        mounted () {
            this.isAuthorized();
            let time = moment();
            time = time.add(20, "minutes").toObject();
            this.time = {
                HH: time.hours,
                mm: time.minutes,
                ss: "00"
            }
        },

        filters: {
            moment: function (date, format) {
                return moment(date).format(format || "MMM DD YYYY, h:mm:ss a");
            },
            duration: function (time, format) {
                return moment.utc(time).format(format || "HH:mm:ss");
            }
        },

        methods: {
            isAuthorized () {
                this.$http.get("api/users/me").then((res) => {
                    this.user.isAuthenticated = true;
                    ld.extend(this.user, res.body);
                    this.listTasks();
                }, (err) => {
                    if (err.status == 401) {
                        this.user.isAuthenticated = false;
                    }
                    this.error = err;
                });
            },

            quickTask () {
                let now = new Date();
                this.error = {};

                this.$http.post("/api/tasks", {
                    active: true,
                    start_at: now,
                    end_at: now,
                    pause_at: now,
                    user_id: this.user.id
                }).then((res) => {
                    this.taskActive = res.body;
                    this.startTimer();
                }, (err) => {
                    this.error = err;
                });
            },

            addTask () {
                let now = new Date();
                let time = this.time || {};

                time = moment(`${time.HH}:${time.mm}:${time.ss}`, "HH:mm:ss");
                if (!time.isValid()) {
                    this.error.message = "Please set end time";
                    return;
                }
                this.$http.post("/api/tasks", {
                    name: this.task.name.trim(),
                    start_at: now,
                    end_at: time.toString(),
                    pause_at: now,
                    active: true,
                    user_id: this.user.id
                }).then((res) => {
                    this.taskActive = res.body;
                    this.startTimer();
                }, (err) => {
                    this.error = err;
                });
            },

            stopTask () {
                let task = this.taskActive;
                let now = new Date();
                this.error = {};

                if (!task.end_at || task.pause_at == task.end_at) {
                    task.end_at = now;
                }
                this.$http.put("/api/tasks/" + task.id, {
                    active: false,
                    pause_at: now,
                    end_at: task.end_at,
                    duration: this.duration
                }).then((res) => {
                    this.taskActive = {};
                    this.listTasks();
                }, (err) => {
                    this.error = err;
                });
            },

            continueTask (id) {
                this.$http.put("/api/tasks/" + id, {
                    active: true
                }).then((res) => {
                    this.taskActive = res.body;
                    this.startTimer();
                }, (err) => {
                    this.error = err;
                });
            },

            listTasks () {
                this.error = {};

                this.$http.get("api/tasks/", {
                    params: {user_id: this.user.id}
                }).then((res) => {
                    this.tasks = ld.reduce(res.body, (result, value) => {
                        if (value.active) {
                            this.taskActive = value;
                            this.startTimer();
                        } else {
                            this.total += value.duration || 0;
                            result.push(value);
                        }
                        return result;
                    }, []);
                }, (err) => {
                    this.error = err;
                });
            },

            startTimer () {
                let hasEnd = this.taskActive.end_at && this.taskActive.end_at != this.taskActive.pause_at;
                if (!this.taskActive.active) {
                    return;
                }
                this.timer = setInterval(() => {
                    let now = moment(new Date());
                    let start = moment(this.taskActive.start_at);
                    let duration = moment.duration(now.diff(start, "seconds"), "seconds")
                    this.duration = duration.asMilliseconds();

                    if (hasEnd && now.diff(moment(this.taskActive.end_at)) > 0) {
                        this.stopTask();
                    }
                }, 1000);
            }

        }
    });

    module.exports = vue;


})();
