(function () {
    'use strict';

    /**
     *
     * @param {Player} me
     * @param {Player} owner
     * @param {array.<Player>} players
     * @constructor
     */
    var Room = function (me, owner, players) {
        players = players || [];

        this.me = me;
        this.owner = owner;
        this.players = players;
    };

    /**
     * @param {PlayerService} playerService
     * @returns {Constructor}
     */
    var RoomService = function (playerService) {
        /**
         * @constructor
         */
        var Constructor = function () {};

        /**
         * Get a new player's id
         *
         * @param {Room} room
         * @returns {number}
         */
        Constructor.prototype.getNewId = function (room) {
            return room.players.length;
        };

        /**
         * Create a room
         *
         * @param {Player} me
         * @return {Room}
         */
        Constructor.prototype.createRoomAsOwner = function (me) {
            return new Room(me, me, [me]);
        };

        /**
         * Create a room
         *
         * @param {Player} me
         * @param {Player} owner
         * @param {array.<Player>} players
         * @return {Room}
         */
        Constructor.prototype.createRoomAsCommon = function (me, owner, players) {
            return new Room(me, owner, players);
        };

        /**
         * Add a player to the room
         *
         * @param {Room} room
         * @param {Player} p
         */
        Constructor.prototype.addPlayer = function (room, p) {
            room.players.push(p);
        };

        /**
         * Add a new player to the room
         * @param {Room} room
         * @param {string} key
         */
        Constructor.prototype.addNewPlayer = function (room, key) {
            var id = this.getNewId(room);
            var p = playerService.createPlayer(id, key, false);

            this.addPlayer(room, p);
        };

        return new Constructor();
    };

    module.exports.Room = Room;
    module.exports.RoomService = RoomService;
})();