const Bacon = require("baconjs");
const message = require("./message");

class Core {
    /**
     * @param {WebRTCService} webRTCService
     * @param {CryptoService} cryptoService
     * @param {PlayerService} playerService
     * @param {RoomService} roomService
     * @param {Logger} logger
     */
    constructor(webRTCService, cryptoService, playerService, roomService, logger) {
        this.webRTCService = webRTCService;
        this.cryptoService = cryptoService;
        this.playerService = playerService;
        this.roomService = roomService;
        this.logger = logger;

        this.messages = {
            /**
             * Player hello message
             *
             * @param {string} k - key
             * @return {Message}
             */
            playerHello: (k) => {
                return new message.Message("playerHello", k, {key: k});
            },

            /**
             * Owner hello message
             *
             * @param {Room} room - the room that new player was joined
             * @return {Message}
             */
            ownerHello: (room) => {
                return new message.Message("ownerHello", room.owner.key, {
                    id: (room.players.length - 1),
                    players: room.players
                });
            },

            /**
             * Start shuffle the deck
             *
             * @param {Array.<number>} d - the deck to shuffle
             * @param {Player} sender
             * @returns {Message}
             */
            startShuffle: (d, sender) => {
                return new message.Message("startShuffle", sender.key, {deck: d});
            },

            /**
             * Accept shuffle the deck
             *
             * @param {Player} sender
             * @returns {Message}
             */
            okShuffle: (sender) => {
                return new message.Message("okShuffle", sender.key, {});
            }
        };
    }

    /**
     * Make a init room
     *
     * @returns {EventStream.<Room>}
     * @private
     */
    _makeRoomStreamOne() {
        return this.webRTCService.peerOpen().map((key) => {
            this.logger.log("receive a owner key", key);
            // a connection to me is null
            const p = this.playerService.createPlayer(0, key, null);

            const room = this.roomService.createRoomAsOwner(p);
            this.logger.log("create a room", room);

            return room;
        });
    }

    /**
     * Make message stream from peer connections and messages
     *
     * @returns {*}
     * @private
     */
    _makeMessageStream() {
        return this.webRTCService.peerConnect().flatMap((conn) => {
            this.logger.log("connect a peer", conn);

            this.logger.log(this.webRTCService.connectionReceive(conn));
            return this.webRTCService.connectionReceive(conn).map((data) => {
                this.logger.log("come data from a peer", data);

                return new message.ReceivedMessage(JSON.parse(data), conn);
            })
        });
    }

    /**
     * Create a room
     * (This function should be in RoomService?)
     *
     * @return {EventStream.<[ReceivedMessage, Room]>}
     */
    makeRoom() {
        const roomStreamOne = this._makeRoomStreamOne();
        const messageStream = this._makeMessageStream();

        const roomBus = new Bacon.Bus();
        roomBus.plug(roomStreamOne);

        console.log(roomBus);

        return Bacon.zipAsArray(roomBus, messageStream).map(([room, receivedMessage]) => {
            this.logger.log("make a new room from a message and room");

            const [message, conn] = [receivedMessage.message, receivedMessage.conn];

            if (message.type === "playerHello") {
                const newRoom = this.roomService.addNewPlayer(room, message.body.key, conn);
                this.logger.log("new room is created", newRoom);

                this.webRTCService.send(conn, this.messages.ownerHello(newRoom).stringify());
                roomBus.push(newRoom);

                return [receivedMessage, newRoom];
            } else {
                return [receivedMessage, room];
            }
        });
    };

    /**
     * Join the room
     * (This function should be in RoomService?)
     *
     * @param {string} ownerKey
     * @returns {EventStream.<Array.<ReceivedMessage, Room>>}
     */
    joinRoom(ownerKey) {
        return this.webRTCService.peerOpen().flatMap((myKey) => {
            this.logger.log("receive a participant's key", myKey);

            const conn = this.webRTCService.connect(ownerKey);

            return this.webRTCService.connectionOpen(conn).flatMap((conn) => {
                this.logger.log("cennect the owner", conn);

                this.webRTCService.send(conn, this.messages.playerHello(myKey).stringify());
                this.logger.log("send a player hello message to the owner", this.messages.playerHello(myKey));

                return this.webRTCService.connectionReceive(conn).map((data) => {
                    const m = JSON.parse(data);
                    this.logger.log("receive the massage from owner", data);

                    if (m.type === "ownerHello") {
                        const room = this.roomService.createRoomAsCommon(m.body.players, conn);
                        this.logger.log("create a new room", room);

                        return [new message.ReceivedMessage(m, conn), room]
                    } else {
                        this.logger.log("not create room");
                        return [new message.ReceivedMessage(m, conn), null]
                    }
                });
            });
        });
    };

    /**
     * Start shuffle the deck
     *
     * @param {Array.<number>} deck
     * @returns {Promise}
     */
    //Core.prototype.startShuffle = (deck) => {
    //};
}

module.exports = Core;
