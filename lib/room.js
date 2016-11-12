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
        this.isPlayerLocked = false;
    }
}

class RoomService {
    /**
     * RoomService constructor
     *
     * @param {PlayerService} playerService
     * @param {WebRTCService} webRTCService
     */
    constructor(playerService, webRTCService) {
        this.playerService = playerService;
        this.webRTCService = webRTCService;
    }

    /**
     * Create a room
     *
     * @param {Player} me
     * @return {Room}
     */
    createRoomAsOwner(me) {
        return new Room(me, me, [me]);
    }

    /**
     * Create a room
     *
     * @param {Player} me
     * @param {Player} owner
     * @param {[Player]} players - players list sent from owner
     * @return {Room}
     */
    createRoomAsCommon(me, owner, players) {
        return new Room(me, owner, players);
    }

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
    }

    /**
     * Add a new player to the room
     *
     * @param {Room} room
     * @param {string} key
     * @param {DataConnection} conn
     * @returns {Room}
     */
    addNewPlayer(room, key, conn) {
        const p = this.playerService.createPlayer(key, conn);

        return this.addPlayer(room, p);
    }

    /**
     * Lock the player in the room
     *
     * @param {Room} room
     * @returns {Room}
     */
    lockPlayers(room) {
        const newRoom = new Room(room.me, room.owner, room.players);
        newRoom.isPlayerLocked = true;

        return newRoom;
    }
}

module.exports.Room = Room;
module.exports.RoomService = RoomService;