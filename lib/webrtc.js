'use strict';

/**
 * Constructor of WebRTC Client
 *
 * @param {string} k
 */
var webRTC = function (window, k) {
    window = window || {};

    console.log(window);
    var Peerjs = require("peerjs");
    this.peer = new Peerjs({key : k})
};

/**
 * Set connection open handler
 *
 * @param {function} cb
 */
webRTC.prototype.onOpen = function (cb) {
    this.peer.on("open", function (id) { cb(id); });
};

/**
 * Set connection connect handler
 *
 * @param {function} cb
 */
webRTC.prototype.onConnect = function (cb) {
    this.peer.on("connection", function (conn) { cb(conn); });
};

/**
 * Connect a peer
 *
 * @param key
 */
webRTC.prototype.connect = function (key) {
    return this.peer.connect(key);
};

/**
 * Send data
 *
 * @param conn
 * @param data
 */
webRTC.prototype.send = function (conn, data) {
    conn.send(data);
};

module.exports = webRTC;
