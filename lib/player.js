class Player {
    /**
     * Player constructor
     *
     * @param {string} key - unique key
     * @param {DataConnection} conn - connection to the player
     */
    constructor (key, conn) {
        this.key = key;
        this.conn = conn;
    }

    /**
     * Make the message without needless properties
     *
     * @returns {{id: {number}, key: {string}}}
     */
    getKey () {
        return {
            key: this.key
        };
    }
}

class PlayerService {
    /**
     * Create a player
     *
     * @param {string} key
     * @param {DataConnection} conn
     * @return {Player}
     */
    createPlayer(key, conn) {
        return new Player(key, conn);
    }
}

module.exports.Player = Player;
module.exports.PlayerService = PlayerService;
