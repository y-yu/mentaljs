const player = require("./player.js");

class Message {
    /**
     * Message constructor
     *
     * @param {string} type
     * @param {string} from - the key that identifies the player
     * @param {Object} body
     */
    constructor(type, from, body) {
        this.type = type;
        this.from = from;
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
                return v.getIdKey();
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

module.exports.Message = Message;
module.exports.ReceivedMessage = ReceivedMessage;
