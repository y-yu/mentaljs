'use strict';

const assert = require("assert");
const Core = require("../lib/core");
const WebRTC = require("../lib/webrtc");
const Crypto = require("../lib/crypto");
const player = require("../lib/player");
const room = require("../lib/room");
const logger = require("../lib/logger");
const message = require("../lib/message");
const Bacon = require("baconjs");
const sinon = require("sinon");

describe("Core", () => {
    const setup = () => {
        const stubWebRTC = sinon.createStubInstance(WebRTC);
        const stubCrypto = sinon.createStubInstance(Crypto);
        const stubPlayerService = sinon.createStubInstance(player.PlayerService);
        const stubRoomService = sinon.createStubInstance(room.RoomService);

        const sut = new Core(stubWebRTC, stubCrypto, stubPlayerService, stubRoomService, new logger.FakeLogger());

        return [sut, {
            webRTCService: stubWebRTC,
            cryptoService: stubCrypto,
            playerService: stubPlayerService,
            roomService: stubRoomService,
        }];
    };

    describe("#makeMessageStream", () => {
        it("should make ReceivedMessage instances from string messages", () => {
            const [sut, stubs] = setup();
            const stubDataConnection = sinon.stub();

            const playerKey = "player key";
            const messageData = sut.messages.playerHello(playerKey).stringify();

            stubs.webRTCService.peerConnect.withArgs().returns(Bacon.once(stubDataConnection));
            stubs.webRTCService.connectionReceive.withArgs(stubDataConnection).returns(Bacon.once(messageData));

            const expected = new message.ReceivedMessage(sut.messages.playerHello(playerKey), stubDataConnection);
            const actual = sut.makeMessageStream();

            actual.onValue((m) => {
                assert.deepEqual(m, expected);
            });
        });
    });

    describe("#makeRoom", () => {
        it("should make rooms each time a peer connect and receive a message", () => {
            const [sut, stubs] = setup();
            const stubDataConnection = sinon.stub();

            const ownerKey = "owner key";
            const owner = new player.Player(0, ownerKey, null);
            const presentRoom = new room.Room(owner, owner, [owner]);
            const playerKey = "player key";
            const messageData = sut.messages.playerHello(playerKey).stringify();
            const joinedPlayer = new player.Player(1, playerKey, stubDataConnection);
            const expectedRoom = new room.Room(owner, owner, [owner, joinedPlayer]);

            stubs.webRTCService.peerOpen.withArgs().returns(Bacon.once(ownerKey));
            stubs.playerService.createPlayer.withArgs(0, ownerKey, null).returns(owner);
            stubs.roomService.createRoomAsOwner.withArgs(owner).returns(presentRoom);
            stubs.webRTCService.peerConnect.withArgs().returns(Bacon.once(stubDataConnection));
            stubs.webRTCService.connectionReceive.withArgs(stubDataConnection).returns(Bacon.once(messageData));
            stubs.roomService.addNewPlayer.withArgs(presentRoom, playerKey, stubDataConnection).returns(expectedRoom);

            const expectedMessage = new message.ReceivedMessage(sut.messages.playerHello(playerKey), stubDataConnection);

            const [messageStream, roomStream] = sut.makeRoom();

            messageStream.onValue((m) => {
                assert.deepEqual(m, expectedMessage);
            });
            roomStream.onValue((r) => {
                assert.deepEqual(r, expectedRoom);
                assert(stubs.webRTCService.send.withArgs(stubDataConnection, sut.messages.ownerHello(expectedRoom).stringify()).calledOnce);
            })
        });
    });

    describe("#joinRoom", () => {
        it("should join a player", () => {
            const [sut, stubs] = setup();
            const stubDataConnection = sinon.stub();

            const ownerKey = "owner key";
            const owner = new player.Player(0, ownerKey, stubDataConnection);
            const ownerRoom = new room.Room(owner, owner, [owner]);
            const ownerHello = sut.messages.ownerHello(ownerRoom);
            const playerKey = "player key";
            const joinedPlayer = new player.Player(1, playerKey, null);
            const expectedRoom = new room.Room(joinedPlayer, owner, [owner, joinedPlayer]);
            const receivedData = JSON.parse(ownerHello.stringify());
            const messageData = sut.messages.playerHello(playerKey).stringify();

            stubs.webRTCService.peerConnect.withArgs().returns(Bacon.once(stubDataConnection));
            stubs.webRTCService.connectionReceive.withArgs(stubDataConnection).returns(Bacon.once(messageData));
            stubs.webRTCService.peerOpen.withArgs().returns(Bacon.once(playerKey));
            stubs.webRTCService.connect.withArgs(ownerKey).returns(stubDataConnection);
            stubs.webRTCService.connectionOpen.withArgs(stubDataConnection).returns(Bacon.once(stubDataConnection));
            stubs.webRTCService.connectionReceive.withArgs(stubDataConnection).returns(Bacon.once(ownerHello.stringify()));
            stubs.roomService.createRoomAsCommon.withArgs(receivedData.body.players, stubDataConnection).returns(expectedRoom);

            const expectedMessage = new message.ReceivedMessage(receivedData, stubDataConnection);
            const [messageStream, roomStream] = sut.joinRoom(ownerKey);

            messageStream.onValue((m) => {
                assert.deepEqual(m, expectedMessage);
            });
            roomStream.onValue((r) => {
                assert.deepEqual(r, expectedRoom);
                assert(stubs.webRTCService.send.withArgs(stubDataConnection, sut.messages.playerHello(playerKey)))
            });
        });
    });
});
