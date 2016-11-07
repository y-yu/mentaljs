const Crypto = require("./crypto");
const WebRTCService = require("./webrtc");
const player = require("./player");
const room = require("./room");
const logger = require("./logger");
const Core = require("./core");

class Mentaljs {
    /**
     * @param {string} k - API key
     * @param {boolean} debug - Debug flag
     */
    constructor(k, debug) {
        // DI
        const playerService = new player.PlayerService();
        const roomService = new room.RoomService(playerService);

        const log = debug ? new logger.ConsoleLogger(console) : new logger.FakeLogger();

        this.core = new Core(new WebRTCService(k), new Crypto(), playerService, roomService, log);
    }
}

module.exports = Mentaljs;
