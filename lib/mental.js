const CryptoService = require("./crypto");
const WebRTCService = require("./webrtc");
const player = require("./player");
const room = require("./room");
const message = require("./message");
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
        const webRTCService = new WebRTCService(k);
        const cryptoService = new CryptoService();
        const roomService = new room.RoomService(playerService, webRTCService);
        const messageService = new message.MessageService(webRTCService);
        const log = debug ? new logger.ConsoleLogger(console) : new logger.FakeLogger();

        this.core = new Core(webRTCService, cryptoService, playerService, roomService, messageService, log);
    }
}

module.exports = Mentaljs;
