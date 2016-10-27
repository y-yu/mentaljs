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
     * @constructor
     */
    var RoomService = function () { };

    /**
     * Create a room
     *
     * @param {Player} me
     * @param {array.<Player>} players
     * @return {Room}
     */
    RoomService.prototype.createRoomAsOwner = function (me, players) {
        return new Room(me, me, players);
    };

    /**
     * Create a room
     *
     * @param {Player} me
     * @param {Player} owner
     * @param {array.<Player>} players
     * @return {Room}
     */
    RoomService.prototype.createRoomAsCommon = function (me, owner, players) {
        return new Room(me, owner, players);
    };

    /**
     * Add a player to the room
     *
     * @param {Room} room
     * @param {Player} p
     * @return {Room}
     */
    RoomService.prototype.addPlayer = function (room, p) {
        var ps = room.players;
        ps.push(p);
        return new Room(room.me, room.owner, ps)
    };

    module.exports.Room = Room;
    module.exports.RoomService = RoomService;
})();