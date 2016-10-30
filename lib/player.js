(function () {
    'use strict';

    /**
     * Player constructor
     *
     * @param {string} id - player's id
     * @param {string} key - unique key
     * @param {boolean} isMe - flag of me or not
     * @param {DataConnection} conn - connection to the player
     * @constructor
     */
    var Player = function (id, key, isMe, conn) {
        this.id = id;
        this.key = key;
        this.isMe = isMe;
        this.conn = conn;
    };

    Player.prototype.stringify = function () {
        return JSON.stringify({
            id: this.id,
            key: this.key
        });
    };

    /**
     * Player service constructor
     *
     * @constructor
     */
    var PlayerService = function () { };

    /**
     * Create a player
     *
     * @param {number} id
     * @param {string} key
     * @param {boolean} isMe
     * @param {DataConnection} conn
     * @return {Player}
     */
    PlayerService.prototype.createPlayer = function (id, key, isMe, conn) {
        return new Player(id, key, isMe, conn);
    };

    module.exports.Player = Player;
    module.exports.PlayerService = PlayerService;
}());
