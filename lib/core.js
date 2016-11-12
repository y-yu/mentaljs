const Bacon = require("baconjs");
const message = require("./message");

class Core {
    /**
     * @param {WebRTCService} webRTCService
     * @param {CryptoService} cryptoService
     * @param {PlayerService} playerService
     * @param {RoomService} roomService
     * @param {MessageService} messageService
     * @param {Logger} logger
     */
    constructor(webRTCService, cryptoService, playerService, roomService, messageService, logger) {
        this.webRTCService = webRTCService;
        this.cryptoService = cryptoService;
        this.playerService = playerService;
        this.roomService = roomService;
        this.messageService = messageService;
        this.logger = logger;

        this.messages = {
            /**
             * Owner hello message
             *
             * @param {Room} room - the room that new player was joined
             * @return {Message}
             */
            ownerHello: (room) => {
                return new message.Message("ownerHello", {
                    players: room.players
                });
            },

            /**
             * Lock the players
             *
             * @returns {Message}
             */
            lockPlayers: () => {
                return new message.Message("lockPlayers", {});
            },

            /**
             * Start shuffle the deck
             *
             * @param {Array.<number>} d - the deck to shuffle
             * @param {Player} sender
             * @returns {Message}
             */
            startShuffle: (d, sender) => {
                return new message.Message("startShuffle", {deck: d});
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
     * Create a room
     * (This function should be in RoomService?)
     *
     * @return {[EventStream.<ReceivedMessage>, Bus.<Room>]}
     */
    makeRoom() {
        const roomStreamOne = this.webRTCService.peerOpen().map((key) => {
            this.logger.log("receive a owner key", key);
            // a connection to me is null
            const p = this.playerService.createPlayer(key, null);

            const room = this.roomService.createRoomAsOwner(p);
            this.logger.log("create a room", room);

            return room;
        });

        const messageStream = this.messageService.makeMessageStreamFromPeerConnect();

        const roomBus = new Bacon.Bus();
        roomBus.plug(roomStreamOne);

        Bacon.zipAsArray(roomBus, messageStream).onValue(([room, receivedMessage]) => {
            this.logger.log("make a new room from a message and room");

            const [message, conn] = [receivedMessage.message, receivedMessage.conn];

            if (message.type === "firstHello" && room.isPlayerLocked === false) {
                const newRoom = this.roomService.addNewPlayer(room, message.body.key, conn);
                this.logger.log("new room is created", newRoom);

                this.messageService.sendMessage(conn, this.messages.ownerHello(newRoom));
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
        const roomBus = new Bacon.Bus();
        const presentPlayersMessageStream = this.webRTCService.peerOpen().flatMap((myKey) => {
            this.logger.log("receive a participant's key", myKey);

            const ownerMessageStream = this.messageService.makeMessageStreamFromKey(ownerKey, myKey);
            const presentOtherPlayersStream = ownerMessageStream.filter((receivedMessage) => {
                this.logger.log("filter the message", receivedMessage);
                return (receivedMessage.message.type === "ownerHello");
            }).flatMap((receivedMessage) => {
                const owner = this.playerService.createPlayer(ownerKey, receivedMessage.conn);
                const myData = receivedMessage.message.body.players.find((p) => {
                    return p.key === myKey;
                });
                const me = this.playerService.createPlayer(myData.key, null);
                const otherPlayers = receivedMessage.message.body.players.filter((p) => {
                    return p.key !== myKey && p.key !== ownerKey;
                }).map((p) => {
                    const conn = this.webRTCService.connect(p.key);
                    return this.playerService.createPlayer(p.key, conn);
                });
                this.logger.log("other players", otherPlayers);

                const players = Array.prototype.concat([owner], otherPlayers, [me]);
                const room = this.roomService.createRoomAsCommon(me, owner, players);

                roomBus.push(room);
                this.logger.log("room is created", room);

                return Bacon.mergeAll(
                    otherPlayers.map((p) => {
                        return this.messageService.makeMessageStreamFromConnection(p.conn, me.key);
                    })
                );
            });

            return ownerMessageStream.merge(presentOtherPlayersStream);
        });

        const connectPlayerMessageStream = this.messageService.makeMessageStreamFromPeerConnect();
        const messageStream = presentPlayersMessageStream.merge(connectPlayerMessageStream);

        Bacon.zipAsArray(roomBus, connectPlayerMessageStream).onValue(([room, m]) => {
            if (m.message.type === "firstHello" && room.isPlayerLocked === false) {
                const newPlayer = this.playerService.createPlayer(m.message.body.key, m.conn);
                const newRoom = this.roomService.addPlayer(room, newPlayer);

                this.logger.log("make a new room", newRoom);

                roomBus.push(newRoom);
            }
        });

        return [messageStream, roomBus];
    }

    lockPlayer(messageStream, roomBus) {
        roomBus.flatMapLatest((room) => {
            room.players.forEach((p) => {
                this.webRTCService.send()
            })
        })
    }
}

module.exports = Core;
