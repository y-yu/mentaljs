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
    Message.prototype.stringify = () => {
        const replacer = (k, v) => {
            if (v instanceof player.Player) {
                return v.stringify();
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
     * @return {EventStream.<Array.<Bus.<Room>, Message>>}
     */
    Core.prototype.makeRoom = () => {
        const roomStream = webRTC.peerOpen().map((key) => {
            logger.log("receive a owner key", key);
            const p = playerService.createPlayer(0, key, true);

            const room = roomService.createRoomAsOwner(p);
            logger.log("create a room", room);

            return room;
        });

        const roomBus = new Bacon.Bus();
        roomBus.plug(roomStream);

        return roomBus.flatMap((room) => {
            logger.log("the room is ", room);

            return webRTC.peerConnect().flatMap((conn) => {
                logger.log("connect a peer in makeRoom", conn);

                return webRTC.connectionReceive(conn).map((data) => {
                    logger.log("come data from a peer", data);

                    const message = JSON.parse(data);

                    if (message.type === "playerHello") {
                        const newRoom = roomService.addNewPlayer(room, message.body.key, conn);

                        logger.log("new room is created", newRoom);
                        roomBus.push(newRoom);

                        webRTC.send(conn, messages.ownerHello(newRoom).stringify());
                    }

                    return [roomBus, message];
                })
            });
        });
    };

    /**
     * Join the room
     * (This function should be in RoomService?)
     *
     * @param {string} ownerKey
     * @returns {EventStream.<Array.<Bus.<Room>, Message>>}
     */
    Core.prototype.joinRoom = (ownerKey) => {
        const roomBus = new Bacon.Bus();

        return webRTC.peerOpen().flatMap((myKey) => {
            logger.log("receive a participant's key", myKey);

            const conn = webRTC.connect(ownerKey);

            return webRTC.connectionOpen(conn).flatMap((conn) => {
                logger.log("cennect the owner", conn);

                webRTC.send(conn, messages.playerHello(myKey).stringify());
                webRTC.send(conn, messages.playerHello(myKey).stringify());
                logger.log("send a message to the owner in joinRoom", messages.playerHello(myKey));

                return webRTC.connectionReceive(conn).map((data) => {
                    const message = JSON.parse(data);

                    if (message.type === "ownerHello") {
                        const room = roomService.createRoomAsCommon(message.body.players, conn);
                        roomBus.push(room);
                    }

                    return [roomBus, message];
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
