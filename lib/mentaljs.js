(function () {
    'use strict';

    var Crypto = require("./crypto.js");
    var WebRTC = require("./webrtc.js");
    var player = require("./player.js");
    var room = require("./room.js");
    var logger = require("./logger.js");
    var core = require("./core.js");

    // DI
    var playerService = new player.PlayerService();
    var roomService = new room.RoomService(playerService);

    /**
     * @param {string} k - API key
     * @param {boolean} debug - Debug flag
     * @returns {Core}
     */
    module.exports = function (k, debug) {
        var log = debug ? new logger.ConsoleLogger() : new logger.FakeLogger();

        return new core(new WebRTC(k), new Crypto(), playerService, roomService, log);
    }
})();
