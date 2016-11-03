class Room {
    /**
     * Room constructor
     *
     * @param {Player} me
     * @param {Player} owner
     * @param {Array.<Player>} players
     * @constructor
     */
    constructor (me, owner, players) {
        players = players || [];

        this.me = me;
        this.owner = owner;
        this.players = players;
    }
}

class RoomService {
    /**
     * RoomService constructor
     *
     * @param {PlayerService} playerService
     */
    constructor(playerService) {
        this.playerService = playerService;
    }

    /**
     * Get a new player's id
     *
     * @param {Room} room
     * @returns {number}
     */
    getNewId(room) {
        return room.players.length;
    };

    /**
     * Identify the player that has the key
     *
     * @param {Room} room
     * @param {string} key
     * @returns {?Player}
     */
    identify (room, key) {
        const p = room.players.filter(function (p) {
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
    createRoomAsOwner(me) {
        return new Room(me, me, [me]);
    };

    /**
     * Create a room
     *
     * @param {Array.<Object>} ps - players list sent from owner
     * @param {DataConnection} conn - connection to owner
     * @return {Room}
     */
    createRoomAsCommon(ps, conn) {
        const players = ps.map((obj) => {
            return new this.playerService.createPlayer(obj.id, obj.key, null);
        });

        const owner = players[0];
        const me = players[players.length - 1];

        me.conn = null;
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
    addPlayer(room, p) {
        const ps = Array.prototype.slice.call(room.players);
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
    addNewPlayer(room, key, conn) {
        const id = this.getNewId(room);
        const p = this.playerService.createPlayer(id, key, conn);

        return this.addPlayer(room, p);
    };
}

module.exports.Room = Room;
module.exports.RoomService = RoomService;