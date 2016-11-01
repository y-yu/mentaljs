const Peerjs = require("peerjs");
const Bacon = require("baconjs");

class WebRTC {
    /**
     * Constructor of WebRTC Client
     *
     * @param {string} k - API key
     * @constructor
     */
    constructor(k) {
        this.peer = new Peerjs({key: k});
    }

    /**
     * Set connection open handler
     *
     * @returns {EventStream.<string>}
     */
    peerOpen() {
        return Bacon.fromCallback((cb) => {
            this.peer.on("open", (key) => {
                cb(key)
            });
        });
    }

    /**
     * Set peer connect handler
     *
     * @returns {EventStream.<DataConnection>}
     */
    peerConnect() {
        return Bacon.fromBinder((cb) => {
            const f = (conn) => {
                cb(conn)
            };
            this.peer.on("connection", f);

            return () => {
                that.peer.removeListener("connection", f);
            };
        });
    }

    /**
     * Set connection open handler
     *
     * @param {DataConnection} conn
     * @return {EventStream.<DataConnection>}
     */
    connectionOpen(conn) {
        return Bacon.fromCallback(function (cb) {
            conn.on("open", () => {
                cb(conn)
            });
        });
    }

    /**
     * Set data receive handler
     *
     * @param {DataConnection} conn
     * @return {EventStream.<string>}
     */
    connectionReceive(conn) {
        return Bacon.fromBinder((cb) => {
            const f = (data) => {
                cb(data)
            };
            conn.on("data", f);

            return () => {
                conn.removeListener("data", f);
            };
        });
    }

    /**
     * Connect a peer
     *
     * @param {string} key
     */
    connect(key) {
        return this.peer.connect(key);
    }

    /**
     * Send data
     *
     * @param {DataConnection} conn
     * @param {string} data
     */
    send(conn, data) {
        conn.send(data);
    }
}

module.exports = WebRTC;
