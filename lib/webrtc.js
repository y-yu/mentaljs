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
     * @returns {Promise}
     */
    WebRTC.prototype.onPeerOpen = function () {
        return new Promise(function (resolve, reject) {
            this.peer.on(
                "open",
                function (id) {
                    resolve(id);
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
     * @returns {Promise}
     */
    WebRTC.prototype.onPeerConnect = function () {
        return new Promise(function (resolve, reject) {
            this.peer.on(
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
     * @param conn
     * @return {Promise}
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
     * @param conn
     * @return {Promise.<string>}
     */
    WebRTC.prototype.onReceive = function (conn) {
        return new Promise(function (resolve, reject) {
            conn.on(
                "data",
                function (data) {
                    resolve(conn, data);
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
     * @param conn
     * @param {string} data
     */
    WebRTC.prototype.send = function (conn, data) {
        conn.send(data);
    };

    module.exports = WebRTC;
})();
