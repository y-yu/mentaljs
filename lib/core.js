(function () {
    'use strict';

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
         *
         * @constructor
         */
        var Core = function () {
            this._room = {};
        };

        /**
         * Message Constructor
         *
         * @param {string} type
         * @param {object} body
         * @constructor
         */
        var Message = function (type, body) {
            this.type = type;
            this.body = body;
        };

        /**
         * Make string
         *
         * @returns {string}
         */
        Message.prototype.stringify = function () {
            return JSON.stringify(this);
        };

        var messages = {
            /**
             * Player hello message
             *
             * @param {string} k - key
             * @return {Message}
             */
            playerHello: function (k) {
                return new Message("playerHello", {key: k});
            },

            /**
             * Owner hello message
             * @param {Room} room
             * @return {Message}
             */
            ownerHello: function (room) {
                return new Message("ownerHello", {id: room.players.length, room: room});
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
             * @param {object} key
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
                // about shuffle
            }
        };

        /**
         * Create a room
         * (This function should be in RoomService?)
         *
         * @return {Promise}
         */
        Core.prototype.makeRoom = function () {
            var that = this;
            var peerOpen = webRTC.onPeerOpen().then(function (key) {
                logger.log("receive a owner key", key);
                // connection to me is undefined
                var p = playerService.createPlayer(0, key, true);

                that._room = roomService.createRoomAsOwner(p, []);
                logger.log("create a room", that._room);

                return that._room;
            });
            var peerConnection = webRTC.onPeerConnect().then(function (conn) {
                logger.log("connect a peer in makeRoom", conn);

                return conn;
            });

            return Promise.all([peerOpen, peerConnection]).then(function (results) {
                var conn = results[1];

                return webRTC.onReceive(conn).then(function (data) {
                    logger.log("come data from a peer", data);

                    that._handler(conn, JSON.parse(data));

                    return data;
                });
            });
        };

        /**
         * Join the room
         * (This function should be in RoomService?)
         *
         * @param {string} key
         * @returns {Promise}
         */
        Core.prototype.joinRoom = function (key) {
            var that = this;
            var peerOpen = webRTC.onPeerOpen();
            var conn = webRTC.connect(key);

            var connectionOpen = webRTC.onConnectionOpen(conn);

            return Promise.all([peerOpen, connectionOpen]).then(function (results) {
                var myKey = results[0];
                var conn = results[1];

                logger.log("send a message in joinRoom", messages.playerHello(myKey));

                var receive = webRTC.onReceive(conn).then(function (data) {
                    logger.log("receive data", data);

                    that._handler(conn, JSON.parse(data));

                    return data;
                });

                webRTC.send(conn, messages.playerHello(myKey).stringify());

                return receive;
            });
        };

        /**
         *
         * @param deck
         */
        Core.prototype.startShuffle = function (deck) {
        };

        return new Core();
    };
}());
