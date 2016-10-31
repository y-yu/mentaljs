const Peerjs = require("peerjs");
const Bacon = require("baconjs");

/**
 * Constructor of WebRTC Client
 *
 * @param {string} k - API key
 * @constructor
 */
const WebRTC = function (k) {
    this.peer = new Peerjs({key : k});
};

/**
 * Set connection open handler
 *
 * @returns {EventStream.<string>}
 */
WebRTC.prototype.peerOpen = function () {
    return Bacon.fromCallback((cb) => {
        this.peer.on("open", (key) => { cb(key) });
    });
};

/**
 * Set peer connect handler
 *
 * @returns {EventStream.<DataConnection>}
 */
WebRTC.prototype.peerConnect = function () {
    return Bacon.fromBinder((cb) => {
        const f = (conn) => { cb(conn) };
        this.peer.on("connection", f);

        return () => {
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
    return Bacon.fromCallback(function (cb) {
        conn.on("open", () => { cb(conn) });
    });
};

/**
 * Set data receive handler
 *
 * @param {DataConnection} conn
 * @return {EventStream.<string>}
 */
WebRTC.prototype.connectionReceive = (conn) => {
    return Bacon.fromBinder((cb) => {
        const f = (data) => { cb(data) };
        conn.on("data", f);

        return () => {
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
WebRTC.prototype.send = (conn, data) => {
    conn.send(data);
};

module.exports = WebRTC;
