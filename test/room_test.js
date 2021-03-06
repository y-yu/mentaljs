'use strict';

const assert = require("assert");
const room = require("../lib/room");
const player = require("../lib/player");
const sinon = require("sinon");
const WebRTC = require("../lib/webrtc");

describe("RoomService", () => {
    const dummyPlayer = new player.Player(0, "key", null);
    const dummyRoom = new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]);

    const setup = () => {
        const stubPlayerService = sinon.createStubInstance(player.PlayerService);
        const stubWebRTCService = sinon.createStubInstance(WebRTC);
        const sut = new room.RoomService(stubPlayerService, stubWebRTCService);

        return [sut, stubPlayerService, stubWebRTCService];
    };

    describe("#getNewId", () => {
       it("should return 1 if the number of players in the room is 1", () => {
           const [sut, _] = setup();

           const actual = sut.getNewId(dummyRoom);
           assert.equal(actual, 1);
       });
    });

    describe("#identify", () => {
        it("should identify the player that has the key", () => {
            const [sut, _] = setup();

            const actual = sut.identify(dummyRoom, "key");
            assert.deepEqual(actual, dummyPlayer);
        });

        it("should not identify any player if there is no player that has the key in the room", () => {
            const [sut, _] = setup();

            const actual = sut.identify(dummyRoom, "key that nobody do not have");
            assert.equal(actual, null);
        })
    });

    describe("#createRoomAsOwner", () => {
        it("should create a room", () => {
            const [sut, _] = setup();

            const actual = sut.createRoomAsOwner(dummyPlayer);
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
        });
    });

    describe("#createRoomAsCommon", () => {
        it("should create a room", () => {
            const [sut, stubPlayerService, stubWebRTCService] = setup();
            const stubDataConnection = sinon.stub();
            const dummyPlayer = new player.Player(0, "owner key", stubDataConnection);
            const dummyMyPlayer = new player.Player(1, "my key", null);
            const ps = [dummyPlayer, dummyMyPlayer];
            const expectedRoom = new room.Room(dummyMyPlayer, dummyPlayer, ps);

            stubPlayerService.createPlayer.withArgs(0, "owner key", stubDataConnection).returns(new player.Player(0, "owner key", stubDataConnection));
            stubPlayerService.createPlayer.withArgs(1, "my key", null).returns(new player.Player(1, "my key", null));

            const actual = sut.createRoomAsCommon(ps, stubDataConnection);
            assert.deepEqual(actual, expectedRoom);
        });

        it("should create a room and connect other players", () => {
            const [sut, stubPlayerService, stubWebRTCService] = setup();
            const stubDataConnection1 = sinon.stub();
            const stubDataConnection2 = sinon.stub();
            const dummyPlayer = new player.Player(0, "owner key", stubDataConnection1);
            const dummyOtherPlayer = new player.Player(1, "other key", stubDataConnection2);
            const dummyMyPlayer = new player.Player(2, "my key", null);
            const ps = [dummyPlayer, dummyOtherPlayer, dummyMyPlayer];
            const expectedRoom = new room.Room(dummyMyPlayer, dummyPlayer, ps);

            stubWebRTCService.connect.withArgs("other key").returns(stubDataConnection2);
            stubPlayerService.createPlayer.withArgs(0, "owner key", stubDataConnection1).returns(new player.Player(0, "owner key", stubDataConnection1));
            stubPlayerService.createPlayer.withArgs(1, "other key", stubDataConnection2).returns(new player.Player(1, "other key", stubDataConnection2));
            stubPlayerService.createPlayer.withArgs(2, "my key", null).returns(new player.Player(2, "my key", null));

            const actual = sut.createRoomAsCommon(ps, stubDataConnection1);
            assert.deepEqual(actual, expectedRoom);
        })
    });

    describe("#addPlayer", () => {
        it("should add the player to the room", () => {
            const [sut, stubPlayerService, _] = setup();
            const stubDataConnection = sinon.stub();
            const p = new player.Player(1, "key", stubDataConnection);

            stubPlayerService.createPlayer.withArgs(1, "key", stubDataConnection).returns(p);

            const actual = sut.addPlayer(dummyRoom, p);

            assert.deepEqual(dummyRoom, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer, p]));
        });
    });

    describe("#addNewPlayer", () => {
        it("should add a new player that has the key to the room", () => {
            const [sut, stubPlayerService, _] = setup();
            const stubDataConnection = sinon.stub();
            const key = "new player's key";
            const newPlayer = new player.Player(1, key, stubDataConnection);

            stubPlayerService.createPlayer.withArgs(1, key, stubDataConnection).returns(newPlayer);

            const actual = sut.addNewPlayer(dummyRoom, key, stubDataConnection);

            assert.deepEqual(dummyRoom, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer, newPlayer]));
        });
    });
});
