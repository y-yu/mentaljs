const player = require("./player");

class Message {
    /**
     * Message constructor
     *
     * @param {string} type
     * @param {Object} body
     */
    constructor(type, body) {
        this.type = type;
        this.body = body;
    }

    /**
     * Make string
     *
     * @returns {string}
     */
    stringify() {
        const replacer = (k, v) => {
            if (v instanceof player.Player) {
                return v.getKey();
            } else {
                return v;
            }
        };

        return JSON.stringify(this, replacer);
    }
}

class ReceivedMessage {
    /**
     * Received message constructor
     *
     * @param {Message} message
     * @param {DataConnection} conn
     */
    constructor(message, conn) {
        this.message = message;
        this.conn = conn;
    }
}

class MessageService {
    /**
     *
     * @param {WebRTCService} webRTCService
     */
    constructor(webRTCService) {
        /** @private */
        this.webRTCService = webRTCService;

        this.messages = {
            firstHello: (key) => {
                return new Message("firstHello", { key: key });
            },

            firstReply: () => {
                return new Message("firstReply", {});
            }
        }
    }

    /**
     * Make message stream from peer connections and messages
     *
     * @returns {EventStream.<ReceivedMessage>}
     */
    makeMessageStreamFromPeerConnect() {
        return this.webRTCService.peerConnect().flatMap((conn) => {
            this.webRTCService.connectionOpen(conn).onValue((conn) => {
                this.sendMessage(conn, this.messages.firstReply());
                console.log(this.messages.firstReply());
            });

            return this.webRTCService.connectionReceive(conn).map((data) => {
                return new ReceivedMessage(JSON.parse(data), conn);
            });
        });
    }

    /**
     * Make message stream from the key that has the peer
     *
     * @param {string} toKey
     * @param {string} myKey
     * @returns {EventStream.<ReceivedMessage>}
     */
    makeMessageStreamFromKey(toKey, myKey) {
        const conn = this.webRTCService.connect(toKey);
        return this.webRTCService.connectionOpen(conn).flatMap((conn) => {
            this.sendMessage(conn, this.messages.firstHello(myKey));

            return this.webRTCService.connectionReceive(conn).map((data) => {
                return new ReceivedMessage(JSON.parse(data), conn);
            });
        })
    }

    /**
     * Make message stream from the connection
     *
     * @param {DataConnection} conn
     * @param {string} myKey
     * @returns {EventStream.<ReceivedMessage>}
     */
    makeMessageStreamFromConnection(conn, myKey) {
        return this.webRTCService.connectionOpen(conn).flatMap((conn) => {
            this.sendMessage(conn, this.messages.firstHello(myKey));

            return this.webRTCService.connectionReceive(conn).map((data) => {
                return new ReceivedMessage(JSON.parse(data), conn);
            });
        })
    }

    /**
     * Send a message to the peer that has the connection
     *
     * @param {DataConnection} conn
     * @param {Message} message
     */
    sendMessage(conn, message) {
        this.webRTCService.send(conn, message.stringify());
    }
}

module.exports.Message = Message;
module.exports.ReceivedMessage = ReceivedMessage;
module.exports.MessageService = MessageService;
