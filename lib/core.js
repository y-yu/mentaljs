const Bacon = require("baconjs");
const message = require("./message.js");

class Core {
    /**
     * @param {WebRTC} webRTC
     * @param {Crypto} crypto
     * @param {PlayerService} playerService
     * @param {RoomService} roomService
     * @param {Logger} logger
     */
    constructor(webRTC, crypto, playerService, roomService, logger) {
        this.webRTC = webRTC;
        this.crypto = crypto;
        this.playerService = playerService;
        this.roomService = roomService;
        this.logger = logger;

        this.messages = {
            /**
             * Player hello message
             *
             * @param {string} k - key
             * @return {Message}
             */
            playerHello: (k) => {
                return new message.Message("playerHello", k, {key: k});
            },

            /**
             * Owner hello message
             *
             * @param {Room} room - the room that new player was joined
             * @return {Message}
             */
            ownerHello: (room) => {
                return new message.Message("ownerHello", room.owner.key, {
                    id: (room.players.length - 1),
                    players: room.players
                });
            },

            /**
             * Start shuffle the deck
             *
             * @param {Array.<number>} d - the deck to shuffle
             * @param {Player} sender
             * @returns {Message}
             */
            startShuffle: (d, sender) => {
                return new message.Message("startShuffle", sender.key, {deck: d});
            },

            /**
             * Accept shuffle the deck
             *
             * @param {Player} sender
             * @returns {Message}
             */
            okShuffle: (sender) => {
                return new message.Message("okShuffle", sender.key, {});
            }
        };
    }


    /**
     * Exceptions
     */
    // var exceptions = {
    //     invalidOwnerHello: function (data) {
    //         this.message = "the given data is not owner hello";
    //         this.data = data;
    //     }
    // };

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
    makeRoom() {
        const roomStreamOne = this.webRTC.peerOpen().map((key) => {
            this.logger.log("receive a owner key", key);
            const p = this.playerService.createPlayer(0, key, true);

            const room = this.roomService.createRoomAsOwner(p);
            this.logger.log("create a room", room);

            return room;
        });

        const messageStream = this.webRTC.peerConnect().flatMap((conn) => {
            this.logger.log("connect a peer in makeRoom", conn);

            return this.webRTC.connectionReceive(conn).map((data) => {
                this.logger.log("come data from a peer", data);

                return new message.ReceivedMessage(JSON.parse(data), conn);
            })
        });

        const roomBus = new Bacon.Bus();
        roomBus.plug(roomStreamOne);

        const roomStream = Bacon.zipAsArray(roomBus, messageStream).map(([room, receivedMessage]) => {
            const [message, conn] = [receivedMessage.message, receivedMessage.conn];

            if (message.type === "playerHello") {
                const newRoom = this.roomService.addNewPlayer(room, message.body.key, conn);
                this.logger.log("new room is created", newRoom);

                this.webRTC.send(conn, this.messages.ownerHello(newRoom).stringify());
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
    joinRoom(ownerKey) {
        const roomBus = new Bacon.Bus();

        return this.webRTC.peerOpen().flatMap((myKey) => {
            this.logger.log("receive a participant's key", myKey);

            const conn = this.webRTC.connect(ownerKey);

            return this.webRTC.connectionOpen(conn).flatMap((conn) => {
                this.logger.log("cennect the owner", conn);

                this.webRTC.send(conn, this.messages.playerHello(myKey).stringify());
                this.logger.log("send a message to the owner in joinRoom", this.messages.playerHello(myKey));

                return this.webRTC.connectionReceive(conn).map((data) => {
                    const m = JSON.parse(data);
                    this.logger.log("receive the massage from owner", data);

                    if (m.type === "ownerHello") {
                        const room = this.roomService.createRoomAsCommon(m.body.players, conn);

                        return [new message.ReceivedMessage(m, conn), room]
                    } else {
                        return [new message.ReceivedMessage(m, conn), null]
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
    //Core.prototype.startShuffle = (deck) => {
    //};
}

module.exports = Core;
