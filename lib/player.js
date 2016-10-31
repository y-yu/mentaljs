/**
 * Player constructor
 *
 * @param {number} id - player's id
 * @param {string} key - unique key
 * @param {boolean} isMe - flag of me or not
 * @param {DataConnection} conn - connection to the player
 * @constructor
 */
const Player = function (id, key, isMe, conn) {
    this.id = id;
    this.key = key;
    this.isMe = isMe;
    this.conn = conn;
};

/**
 * Make the message without needless properties
 *
 * @returns {{id: {number}, key: {string}}}
 */
Player.prototype.getIdKey = function () {
    return {
        id: this.id,
        key: this.key
    };
};

/**
 * Player service constructor
 *
 * @constructor
 */
const PlayerService = function () { };

/**
 * Create a player
 *
 * @param {number} id
 * @param {string} key
 * @param {boolean} isMe
 * @param {DataConnection} conn
 * @return {Player}
 */
PlayerService.prototype.createPlayer = (id, key, isMe, conn) => {
    return new Player(id, key, isMe, conn);
};

module.exports.Player = Player;
module.exports.PlayerService = PlayerService;
