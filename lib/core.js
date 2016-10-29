(function () {
    'use strict';

    /**
     *
     * @param {WebRTC} webRTC
     * @param {Crypto} crypto
     * @param {PlayerService} playerService
     * @param {RoomService} roomService
     */
    var core = function (webRTC, crypto, playerService, roomService) {
        /**
         *
         * @constructor
         */
        var Constructor = function () { };

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

        var exceptions = {
            invalidOwnerHello: function (data) {
                this.message = "the given data is not owner hello";
                this.data = data;
            }
        };

        /**
         * Create a room
         *
         * @return {Promise.<array.<Room, string>>}
         */
        Constructor.prototype.makeRoom = function () {
            var peerOpen = webRTC.onPeerOpen().then(function (key) {
                // connection to me is undefined
                var p = playerService.createPlayer(0, key, true);

                return roomService.createRoomAsOwner(p, []);
            });

            var peerConnection = webRTC.onPeerConnect().then(function (conn) {
                return webRTC.onReceive(conn).then(function (data) {
                    return hander(JSON.parse(data));
                });
            });

            return Promise.all([peerOpen, peerConnection])
        };

        /**
         * Join the room
         *
         * @param {string} key
         */
        Constructor.prototype.joinRoom = function (key) {
            var peerOpen = webRTC.onPeerOpen();
            var conn = webRTC.connect(key);

            var connectionOpen = webRTC.onConnectionOpen(conn);

            Promise.all([peerOpen, connectionOpen]).then(function (results) {
                var myKey = results[0];
                var conn = results[1];

                webRTC.send(conn, messages.playerHello(myKey));

                return webRTC.onReceive(conn).then(function (data){
                    return handler(JSON.parse(data));
                });
            }).then(function (results) {
                var myKey = results[0];
                var data  = results[1];

                try {
                    /**
                     * @type {Message}
                     */
                    var ownerHello = JSON.parse(data);
                } catch (_) {
                    throw new exceptions.invalidOwnerHello(data);
                }

                if (ownerHello.type !== "ownerHello") {
                    throw new exceptions.invalidOwnerHello(ownerHello);
                }

                var me = playerService.createPlayer(ownerHello.body.id, myKey, true);
                var owner = playerService.createPlayer(ownerHello.body.room.owner, ownerHello.body.room.owner.key, false);

                var room = roomService.createRoomAsCommon(me, owner, ownerHello.body.room.players);
            });
        };

        /**
         *
         * @param {Message} json
         * @param {Room} room
         */
        var handler = function (json, room) {
            if (json.type === "playerHello") {
                joinPlayer(json.body, room);
            }
        };

        /**
         *
         * @param {object} key
         * @param {Room} room
         */
        var joinPlayer = function (key, room) {
            var conn = webRTC.connect(key.key);

            webRTC.onConnectionOpen(conn).then(function (conn) {
                roomService.addNewPlayer(room, key.key)

                webRTC.send(conn, messages.ownerHello(room).stringify());
            });
        };

        return new Constructor();
    };

    module.exports = core;
}());
