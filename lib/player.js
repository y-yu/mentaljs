(function () {
    'use strict';

    /**
     * Player constructor
     *
     * @param {string} id - player's id
     * @param {string} key - unique key
     * @param {boolean} isMe - flag of me or not
     * @constructor
     */
    var Player = function (id, key, isMe) {
        this.id = id;
        this.key = key;
        this.isMe = isMe;
    };

    /**
     *
     * @constructor
     */
    var PlayerService = function () { };


    /**
     * Create a player as owner
     *
     * @param {number} id
     * @param {string} key
     * @param {boolean} isMe
     * @return {Player}
     */
    PlayerService.prototype.createPlayer = function (id, key, isMe) {
        return new Player(id, key, isMe);
    };

    module.exports.Player = Player;
    module.exports.PlayerService = PlayerService;
}());
