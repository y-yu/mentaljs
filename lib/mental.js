const Crypto = require("./crypto.js");
const WebRTC = require("./webrtc.js");
const player = require("./player.js");
const room = require("./room.js");
const logger = require("./logger.js");
const Core = require("./core.js");

class Mentaljs {
    /**
     * @param {string} k - API key
     * @param {boolean} debug - Debug flag
     */
    constructor(k, debug) {
        // DI
        const playerService = new player.PlayerService();
        const roomService = new room.RoomService(playerService);

        const log = debug ? new logger.ConsoleLogger() : new logger.FakeLogger();

        this.core = new Core(new WebRTC(k), new Crypto(), playerService, roomService, log);
    }
}

module.exports = Mentaljs;
