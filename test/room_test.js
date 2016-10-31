'use strict';

const assert = require("assert");
const room = require("../lib/room.js");
const player = require("../lib/player.js");

describe("RoomService", () => {
    const dummyPlayer = new player.Player(0, "key", true, null);
    const dummyRoom = new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]);

    /**
     * @param {Player} fakePlayer
     */
    const setup = (fakePlayer) => {
        /**
         * @constructor
         */
        const mockPlayerService = function () {
            this.createPlayer = function () {
                return fakePlayer;
            }
        };

        return new mockPlayerService();
    };

    describe("#getNewId", () => {
       it("should return 1 if the number of players in the room is 1", () => {
           const sut = room.RoomService(setup(dummyPlayer));

           const actual = sut.getNewId(dummyRoom);
           assert.equal(actual, 1);
       });
    });

    describe("#identify", () => {
        it("should identify the player that has the key", () => {
            const sut = room.RoomService(setup(dummyPlayer));

            const actual = sut.identify(dummyRoom, "key");
            assert.deepEqual(actual, dummyPlayer);
        });

        it("should not identify any player if there is no player that has the key in the room", () => {
            const sut = room.RoomService(setup(dummyPlayer));

            const actual = sut.identify(dummyRoom, "key that nobody do not have");
            assert.equal(actual, null);
        })
    });

    describe("#createRoomAsOwner", () => {
        it("should create a room", () => {
            const sut = room.RoomService(setup(dummyPlayer));

            const actual = sut.createRoomAsOwner(dummyPlayer);
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
        });
    });

    describe("#createRoomAsCommon", () => {
        it("should create a room", () => {
            // pending
        });
    });

    describe("#addPlayer", () => {
        it("should add the player to the room", () => {
            const sut = room.RoomService(setup(dummyPlayer));
            const p = new player.Player(1, "key", false);

            const actual = sut.addPlayer(dummyRoom, p);

            assert.deepEqual(dummyRoom, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer, p]));
        });
    });

    describe("#addNewPlayer", () => {
        it("should add a new player that has the key to the room", () => {
            const key = "new player's key";
            const newPlayer = new player.Player(1, key, false, null);
            const sut = room.RoomService(setup(newPlayer));

            const actual = sut.addNewPlayer(dummyRoom, key);

            assert.deepEqual(dummyRoom, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer, newPlayer]));
        });
    });
});
