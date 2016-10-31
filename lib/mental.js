const Crypto = require("./crypto.js");
const WebRTC = require("./webrtc.js");
const player = require("./player.js");
const room = require("./room.js");
const logger = require("./logger.js");
const core = require("./core.js");

// DI
const playerService = new player.PlayerService();
const roomService = new room.RoomService(playerService);

/**
 * @param {string} k - API key
 * @param {boolean} debug - Debug flag
 * @returns {Core}
 */
module.exports = (k, debug) => {
    const log = debug ? new logger.ConsoleLogger() : new logger.FakeLogger();

    return new core(new WebRTC(k), new Crypto(), playerService, roomService, log);
};
