'use strict';

const assert = require("assert");
const room = require("../lib/room");
const player = require("../lib/player");
const sinon = require("sinon");

describe("RoomService", () => {
    const dummyPlayer = new player.Player(0, "key", null);
    const dummyRoom = new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]);

    const setup = () => {
        const stubPlayerService = sinon.createStubInstance(player.PlayerService);
        const sut = new room.RoomService(stubPlayerService);

        return [sut, stubPlayerService];
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
            const [sut, stubPlayerService] = setup();
            const stubDataConnection = sinon.stub();
            const dummyPlayer = new player.Player(0, "owner key", stubDataConnection);
            const dummyMyPlayer = new player.Player(1, "my key", null);
            const ps = [dummyPlayer, dummyMyPlayer];
            const expectedRoom = new room.Room(dummyMyPlayer, dummyPlayer, ps);

            stubPlayerService.createPlayer.withArgs(0, "owner key", null).returns(new player.Player(0, "owner key", null));
            stubPlayerService.createPlayer.withArgs(1, "my key", null).returns(new player.Player(1, "my key", null));

            const actual = sut.createRoomAsCommon(ps, stubDataConnection);
            assert.deepEqual(actual, expectedRoom);
        });
    });

    describe("#addPlayer", () => {
        it("should add the player to the room", () => {
            const [sut, stubPlayerService] = setup();
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
            const [sut, stubPlayerService] = setup();
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
