(function () {
    'use strict';

    /**
     *
     * @param {Player} me
     * @param {Player} owner
     * @param {Array.<Player>} players
     * @constructor
     */
    var Room = function (me, owner, players) {
        players = players || [];

        this.me = me;
        this.owner = owner;
        this.players = players;
    };

    module.exports.Room = Room;

    /**
     * @param {PlayerService} playerService
     * @returns {RoomService}
     */
    module.exports.RoomService = function (playerService) {
        /**
         * @constructor
         */
        var RoomService = function () {};

        /**
         * Get a new player's id
         *
         * @param {Room} room
         * @returns {number}
         */
        RoomService.prototype.getNewId = function (room) {
            return room.players.length;
        };

        /**
         * Identify the player that has the key
         *
         * @param {Room} room
         * @param {string} key
         * @returns {?Player}
         */
        RoomService.prototype.identify = function (room, key) {
            var p = room.players.filter(function (p) {
                return p.key === key;
            });

            return (p.length === 0 ? null : p[0]);
        };


        /**
         * Create a room
         *
         * @param {Player} me
         * @return {Room}
         */
        RoomService.prototype.createRoomAsOwner = function (me) {
            return new Room(me, me, [me]);
        };

        /**
         * Create a room
         *
         * @param {Array.<Object>} ps - players list sent from owner
         * @param {DataConnection} conn - connection to owner
         * @return {Room}
         */
        RoomService.prototype.createRoomAsCommon = function (ps, conn) {
            var players = ps.map(function (obj) {
                return new playerService.createPlayer(obj.id, obj.key, false, undefined);
            });

            var owner = players[0];
            var me = players[players.length - 1];

            me.isMe = true;
            owner.conn = conn;

            return new Room(me, owner, players);
        };

        /**
         * Add a player to the room
         *
         * @param {Room} room
         * @param {Player} p
         * @returns {Room}
         */
        RoomService.prototype.addPlayer = function (room, p) {
            var ps = Array.prototype.slice.call(room.players);
            ps.push(p);

            return new Room(room.me, room.owner, ps);
        };

        /**
         * Add a new player to the room
         *
         * @param {Room} room
         * @param {string} key
         * @param {DataConnection} conn
         * @returns {Room}
         */
        RoomService.prototype.addNewPlayer = function (room, key, conn) {
            var id = this.getNewId(room);
            var p = playerService.createPlayer(id, key, false, conn);

            return this.addPlayer(room, p);
        };

        return new RoomService();
    };
})();