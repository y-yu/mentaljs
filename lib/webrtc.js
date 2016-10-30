(function () {
    'use strict';

    var Peerjs = require("peerjs");
    var Bacon = require("baconjs");

    /**
     * Constructor of WebRTC Client
     *
     * @param {string} k - API key
     * @constructor
     */
    var WebRTC = function (k) {
        this.peer = new Peerjs({key : k});
    };

    /**
     * Set connection open handler
     *
     * @returns {EventStream.<string>}
     */
    WebRTC.prototype.peerOpen = function () {
        var that = this;
        return Bacon.fromBinder(function (cb) {
            var f = function (key) { cb(key) };
            that.peer.on("open", f);

            return function () {
                that.peer.removeListener("open", f);
            };
        });
    };

    /**
     * Set peer connect handler at once
     *
     * @returns {EventStream.<DataConnection>}
     */
    WebRTC.prototype.peerConnectOnce = function () {
        var that = this;
        return Bacon.fromBinder(function (cb) {
            var f = function (conn) { cb(conn) };
            that.peer.once("connection", f);

            return function () {
                that.peer.removeListener("connection", f);
            };
        });
    };

    /**
     * Set connection open handler
     *
     * @param {DataConnection} conn
     * @return {EventStream.<DataConnection>}
     */
    WebRTC.prototype.connectionOpen = function (conn) {
        return Bacon.fromBinder(function (cb) {
            var f = function () { cb(conn) };
            conn.on("open", f);

            return function () {
                conn.removeListener("open", f);
            };
        });
    };

    /**
     * Set data connection handler
     *
     * @param {DataConnection} conn
     * @return {EventStream.<string>}
     */
    WebRTC.prototype.connectionReceive = function (conn) {
        return Bacon.fromBinder(function (cb) {
            var f = function (data) { cb(data) };
            conn.on("data", f);

            return function () {
                conn.removeListener("data", f);
            };
        });
    };

    /**
     * Connect a peer
     *
     * @param {string} key
     */
    WebRTC.prototype.connect = function (key) {
        return this.peer.connect(key);
    };

    /**
     * Send data
     *
     * @param {DataConnection} conn
     * @param {string} data
     */
    WebRTC.prototype.send = function (conn, data) {
        conn.send(data);
    };

    module.exports = WebRTC;
})();
