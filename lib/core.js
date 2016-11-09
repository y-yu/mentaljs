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

            otherPlayerHello: (k, id) => {
                return new message.Message("otherPlayerHello", k, {
                    id: id,
                    key: k
                });
            },

            /**
             * Lock the players
             *
             * @param k - the key of owner
             * @returns {Message}
             */
            lockPlayers: (k) => {
                return new message.Message("lockPlayers", k, {});
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
     * Send the message to all players
     *
     * @param {[Player]} ps
     * @param {Message} m
     */
    broadCast(ps, m) {
        ps.forEach((p) => {
            if (p.conn !== null) {
                this.webRTCService.send(p.conn, m.stringify());
                this.logger.log("send a data", p.conn);
            }
        });
    }

    /**
     * Make message stream from peer connections and messages
     *
     * @returns {*}
     * @private
     */
    makeMessageStream() {
        return this.webRTCService.peerConnect().flatMap((conn) => {
            this.logger.log("connect a peer", conn);
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
     * @return {[EventStream.<ReceivedMessage>, Bus.<Room>]}
     */
    makeRoom() {
        const roomStreamOne = this.webRTCService.peerOpen().map((key) => {
            this.logger.log("receive a owner key", key);
            // a connection to me is null
            const p = this.playerService.createPlayer(0, key, null);

            const room = this.roomService.createRoomAsOwner(p);
            this.logger.log("create a room", room);

            return room;
        });

        const messageStream = this.makeMessageStream();

        const roomBus = new Bacon.Bus();
        roomBus.plug(roomStreamOne);

        Bacon.zipAsArray(roomBus, messageStream).onValue(([room, receivedMessage]) => {
            this.logger.log("make a new room from a message and room");

            const [message, conn] = [receivedMessage.message, receivedMessage.conn];

            if (message.type === "playerHello") {
                const newRoom = this.roomService.addNewPlayer(room, message.body.key, conn);
                this.logger.log("new room is created", newRoom);

                this.webRTCService.send(conn, this.messages.ownerHello(newRoom).stringify());
                roomBus.push(newRoom);
            }
        });

        return [messageStream, roomBus]
    };

    /**
     * Join the room
     * (This function should be in RoomService?)
     *
     * @param {string} ownerKey
     * @returns {[EventStream.<ReceivedMessage>, Bus.<Room>]}
     */
    joinRoom(ownerKey) {
        const ownerStream = this.webRTCService.peerOpen().flatMap((myKey) => {
            this.logger.log("receive a participant's key", myKey);

            const conn = this.webRTCService.connect(ownerKey);

            return this.webRTCService.connectionOpen(conn).flatMap((_) => {
                this.logger.log("connect the owner", conn);

                this.webRTCService.send(conn, this.messages.playerHello(myKey).stringify());
                this.logger.log("send a player hello message to the owner", this.messages.playerHello(myKey));

                return this.webRTCService.connectionReceive(conn).map((data) => {
                    this.logger.log("receive the massage from owner", data);
                    const m = JSON.parse(data);
                    return new message.ReceivedMessage(m, conn);
                });
            });
        });

        const roomBus = new Bacon.Bus();

        ownerStream.filter((rm) => {
            this.logger.log("filter the message", rm);
            return rm.message.type === "ownerHello";
        }).first().onValue((receivedMessage) => {
            const room = this.roomService.createRoomAsCommon(receivedMessage.message.body.players, receivedMessage.conn);
            this.logger.log("create a new room", room);

            const otherPlayers = room.players.filter((p) => {
                return p !== room.owner && p !== room.me;
            });

            Bacon.mergeAll(
                otherPlayers.map((p) => {
                    return this.webRTCService.connectionOpen(p.conn);
                })
            ).onValue((conn) => {
                this.logger.log("send a key to the other player", conn);
                this.webRTCService.send(conn, this.messages.otherPlayerHello(room.me.key, room.me.id).stringify())
            });

            roomBus.push(room);
        });

        const otherPlayersStream = this.makeMessageStream();
        const messageStream = ownerStream.merge(otherPlayersStream);

        // skip the owner hello message
        Bacon.zipAsArray(messageStream.skip(1), roomBus).onValue(([m, room]) => {
            if (m.message.type === "otherPlayerHello") {
                const newPlayer = this.playerService.createPlayer(m.message.body.id, m.message.body.key, m.conn);
                const newRoom = this.roomService.addPlayer(room, newPlayer);

                this.logger.log("make a new room", newRoom);

                roomBus.push(newRoom);
            }
        });

        return [messageStream, roomBus];
    }
}

module.exports = Core;
