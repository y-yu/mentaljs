(function () {
    'use strict';

    var Bacon = require("baconjs");
    var player = require("./player.js");

    /**
     *
     * @param {WebRTC} webRTC
     * @param {Crypto} crypto
     * @param {PlayerService} playerService
     * @param {RoomService} roomService
     * @param {Logger} logger
     */
    module.exports = function (webRTC, crypto, playerService, roomService, logger) {
        /**
         * @constructor
         */
        var Core = function () { };

        /**
         * Message constructor
         *
         * @param {string} type
         * @param {string} from - the key that identifies the player
         * @param {Object} body
         * @constructor
         */
        var Message = function (type, from, body) {
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
            var replacer = function (k, v) {
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
            playerHello: function (k) {
                return new Message("playerHello", k, {key: k});
            },

            /**
             * Owner hello message
             *
             * @param {Room} room - the room that new player was joined
             * @return {Message}
             */
            ownerHello: function (room) {
                return new Message("ownerHello", room.owner.key, {id: (room.players.length - 1), players: room.players});
            },

            /**
             * Start shuffle the deck
             *
             * @param {Array.<number>} d - the deck to shuffle
             * @param {Player} sender
             * @returns {Message}
             */
            startShuffle: function (d, sender) {
                return new Message("startShuffle", sender.key, {deck: d});
            },

            /**
             * Accept shuffle the deck
             *
             * @param {Player} sender
             * @returns {Message}
             */
            okShuffle: function (sender) {
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
        Core.prototype._handler = function (conn, json) {
            var that = this;

            /**
             * A player joined the room
             *
             * @param {Object} key
             */
            var playerJoin = function (key) {
                roomService.addNewPlayer(that._room, key.key);

                webRTC.send(conn, messages.ownerHello(that._room).stringify());
                logger.log("send a message in playerJoin", messages.ownerHello(that._room).stringify());
            };

            /**
             * Join the room
             *
             * @param {Room} room
             */
            var enterRoom = function (room) {
                logger.log("enter the room", room);

                that.room = room;
            };

            if (json.type === "playerHello") {
                playerJoin(json.body);
            } else if (json.type === "ownerHello") {
                enterRoom(json.body.room);
            } else if (json.type === "startShuffle") {

            }
        };

        /**
         * Create a room
         * (This function should be in RoomService?)
         *
         * @return {EventStream.<Array.<Bus.<Room>, Message>>}
         */
        Core.prototype.makeRoom = function () {
            var roomStream = webRTC.peerOpen().map(function (key) {
                logger.log("receive a owner key", key);
                var p = playerService.createPlayer(0, key, true);

                var room = roomService.createRoomAsOwner(p);
                logger.log("create a room", room);

                return room;
            });

            var roomBus = new Bacon.Bus();
            roomBus.plug(roomStream);

            return roomBus.flatMap(function (room) {
                logger.log("the room is ", room);

                return webRTC.peerConnectOnce().flatMap(function (conn) {
                    logger.log("connect a peer in makeRoom", conn);

                    return webRTC.connectionReceive(conn).map(function (data) {
                        logger.log("come data from a peer", data);

                        var message = JSON.parse(data);

                        if (message.type === "playerHello") {
                            var newRoom = roomService.addNewPlayer(room, message.body.key, conn);

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
        Core.prototype.joinRoom = function (ownerKey) {
            var roomBus = new Bacon.Bus();

            return webRTC.peerOpen().flatMap(function (myKey) {
                logger.log("receive a participant's key", myKey);

                var conn = webRTC.connect(ownerKey);

                return webRTC.connectionOpen(conn).flatMap(function (conn) {
                    logger.log("cennect the owner", conn);

                    webRTC.send(conn, messages.playerHello(myKey).stringify());
                    logger.log("send a message to the owner in joinRoom", messages.playerHello(myKey));

                    return webRTC.connectionReceive(conn).map(function (data) {
                        var message = JSON.parse(data);

                        if (message.type === "ownerHello") {
                            var room = roomService.createRoomAsCommon(message.body.players, conn);
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
        Core.prototype.startShuffle = function (deck) {

        };

        return new Core();
    };
}());
