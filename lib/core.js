const Bacon = require("baconjs");
const player = require("./player.js");

/**
 *
 * @param {WebRTC} webRTC
 * @param {Crypto} crypto
 * @param {PlayerService} playerService
 * @param {RoomService} roomService
 * @param {Logger} logger
 */
module.exports = (webRTC, crypto, playerService, roomService, logger) => {
    /**
     * @constructor
     */
    const Core = function () { };

    /**
     * Message constructor
     *
     * @param {string} type
     * @param {string} from - the key that identifies the player
     * @param {Object} body
     * @constructor
     */
    const Message = function (type, from, body) {
        this.type = type;
        this.from = from;
        this.body = body;
    };

    /**
     * Make string
     *
     * @returns {string}
     */
    Message.prototype.stringify = function () {
        const replacer = (k, v) => {
            if (v instanceof player.Player) {
                return v.idKey();
            } else {
                return v;
            }
        };

        return JSON.stringify(this, replacer);
    };

    var messages = {
        /**
         * Player hello message
         *
         * @param {string} k - key
         * @return {Message}
         */
        playerHello: (k) => {
            return new Message("playerHello", k, {key: k});
        },

        /**
         * Owner hello message
         *
         * @param {Room} room - the room that new player was joined
         * @return {Message}
         */
        ownerHello: (room) => {
            return new Message("ownerHello", room.owner.key, {id: (room.players.length - 1), players: room.players});
        },

        /**
         * Start shuffle the deck
         *
         * @param {Array.<number>} d - the deck to shuffle
         * @param {Player} sender
         * @returns {Message}
         */
        startShuffle: (d, sender) => {
            return new Message("startShuffle", sender.key, {deck: d});
        },

        /**
         * Accept shuffle the deck
         *
         * @param {Player} sender
         * @returns {Message}
         */
        okShuffle: (sender) => {
            return new Message("okShuffle", sender.key, {});
        }
    };

    /**
     * Received message constructor
     *
     * @param {Message} message
     * @param {DataConnection} conn
     * @constructor
     */
    const ReceivedMessage = function (message, conn) {
        this.message = message;
        this.conn = conn;
    };

    /**
     * Exceptions
     */
    var exceptions = {
        invalidOwnerHello: function (data) {
            this.message = "the given data is not owner hello";
            this.data = data;
        }
    };

    /**
     * Router of receiving messages
     *
     * @param {DataConnection} conn
     * @param {Message} json
     */
    // Core.prototype._handler = (conn, json) => {
    //     var that = this;

    //     /**
    //      * A player joined the room
    //      *
    //      * @param {Object} key
    //      */
    //     var playerJoin = function (key) {
    //         roomService.addNewPlayer(that._room, key.key);

    //         webRTC.send(conn, messages.ownerHello(that._room).stringify());
    //         logger.log("send a message in playerJoin", messages.ownerHello(that._room).stringify());
    //     };

    //     /**
    //      * Join the room
    //      *
    //      * @param {Room} room
    //      */
    //     var enterRoom = function (room) {
    //         logger.log("enter the room", room);

    //         that.room = room;
    //     };

    //     if (json.type === "playerHello") {
    //         playerJoin(json.body);
    //     } else if (json.type === "ownerHello") {
    //         enterRoom(json.body.room);
    //     } else if (json.type === "startShuffle") {

    //     }
    // };

    /**
     * Create a room
     * (This function should be in RoomService?)
     *
     * @return {EventStream.<Array.<ReceivedMessage, Room>>}
     */
    Core.prototype.makeRoom = () => {
        const roomStreamOne = webRTC.peerOpen().map((key) => {
            logger.log("receive a owner key", key);
            const p = playerService.createPlayer(0, key, true);

            const room = roomService.createRoomAsOwner(p);
            logger.log("create a room", room);

            return room;
        });

        const messageStream = webRTC.peerConnect().flatMap((conn) => {
            logger.log("connect a peer in makeRoom", conn);

            return webRTC.connectionReceive(conn).map((data) => {
                logger.log("come data from a peer", data);

                return new ReceivedMessage(JSON.parse(data), conn);
            })
        });

        const roomBus = new Bacon.Bus();
        roomBus.plug(roomStreamOne);

        const roomStream = Bacon.zipAsArray(roomBus, messageStream).map(([room, receivedMessage]) => {
            const [message, conn] = [receivedMessage.message, receivedMessage.conn];

            if (message.type === "playerHello") {
                const newRoom = roomService.addNewPlayer(room, message.body.key, conn);
                logger.log("new room is created", newRoom);

                webRTC.send(conn, messages.ownerHello(newRoom).stringify());
                roomBus.push(newRoom);

                return newRoom;
            } else {
                return room;
            }
        });

        return Bacon.zipAsArray(messageStream, roomStream);
    };

    /**
     * Join the room
     * (This function should be in RoomService?)
     *
     * @param {string} ownerKey
     * @returns {EventStream.<Array.<ReceivedMessage, Room>>}
     */
    Core.prototype.joinRoom = (ownerKey) => {
        const roomBus = new Bacon.Bus();

        return webRTC.peerOpen().flatMap((myKey) => {
            logger.log("receive a participant's key", myKey);

            const conn = webRTC.connect(ownerKey);

            return webRTC.connectionOpen(conn).flatMap((conn) => {
                logger.log("cennect the owner", conn);

                webRTC.send(conn, messages.playerHello(myKey).stringify());
                logger.log("send a message to the owner in joinRoom", messages.playerHello(myKey));

                return webRTC.connectionReceive(conn).map((data) => {
                    const message = JSON.parse(data);
                    logger.log("receive the massage from owner", data);

                    if (message.type === "ownerHello") {
                        const room = roomService.createRoomAsCommon(message.body.players, conn);

                        return [new ReceivedMessage(message, conn), room]
                    } else {
                        return [new ReceivedMessage(message, conn), null]
                    }
                });
            });
        });
    };

    /**
     * Start shuffle the deck
     *
     * @param {Array.<number>} deck
     * @returns {Promise}
     */
    Core.prototype.startShuffle = (deck) => {
    };

    return new Core();
};
