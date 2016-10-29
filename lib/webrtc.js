(function () {
    'use strict';

    /**
     * Constructor of WebRTC Client
     *
     * @param {string} k - API key
     * @constructor
     */
    var WebRTC = function (k) {
        var Peerjs = require("peerjs");
        this.peer = new Peerjs({key : k});
    };

    /**
     * Set connection open handler
     *
     * @returns {Promise.<string>}
     */
    WebRTC.prototype.onPeerOpen = function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.peer.on(
                "open",
                function (key) {
                    resolve(key);
                },
                function (e) {
                    reject(e);
                }
            );
        });
    };

    /**
     * Set connection connect handler
     *
     * @returns {Promise.<DataConnection>}
     */
    WebRTC.prototype.onPeerConnect = function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.peer.on(
                "connection",
                function (conn) {
                    resolve(conn);
                },
                function (e) {
                    reject(e);
                }
            );
        });
    };

    /**
     * Set connection open handler
     *
     * @param {DataConnection} conn
     * @return {Promise.<DataConnection>}
     */
    WebRTC.prototype.onConnectionOpen = function (conn) {
        return new Promise(function (resolve, reject) {
            conn.on(
                "open",
                function () {
                    resolve(conn);
                },
                function (e) {
                    reject(e);
                }
            );
        });
    };

    /**
     * Set data connection handler
     *
     * @param {DataConnection} conn
     * @return {Promise.<string>}
     */
    WebRTC.prototype.onReceive = function (conn) {
        return new Promise(function (resolve, reject) {
            conn.on(
                "data",
                function (data) {
                    resolve(data);
                },
                function (e) {
                    reject(e);
                }
            );
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
