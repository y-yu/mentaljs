'use strict';

var assert = require("assert");
var room = require("../lib/room.js");
var player = require("../lib/player.js");

describe("RoomService", function () {
    var dummyPlayer = new player.Player(0, "key", true);
    var dummyRoom = new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]);

    /**
     * @param {Player} fakePlayer
     */
    function setup (fakePlayer) {
        /**
         * @constructor
         */
        var mockPlayerService = function () {
            this.createPlayer = function () {
                return fakePlayer;
            }
        };

        return new mockPlayerService();
    }

    describe("#getNewId", function () {
       it("should return 1 if the number of players in the room is 1", function () {
           var sut = new room.RoomService(setup(dummyPlayer));

           var actual = sut.getNewId(dummyRoom);
           assert.equal(actual, 1);
       });
    });

    describe("#identify", function () {
        it("should identify the player that has the key", function () {
            var sut = new room.RoomService(setup(dummyPlayer));

            var actual = sut.identify(dummyRoom, "key");
            assert.deepEqual(actual, dummyPlayer);
        });

        it("should not identify any player if there is no player that has the key in the room", function () {
            var sut = new room.RoomService(setup(dummyPlayer));

            var actual = sut.identify(dummyRoom, "key that nobody do not have");
            assert.equal(actual, null);
        })
    });

    describe("#createRoomAsOwner", function () {
        it("should create a room", function () {
            var sut = new room.RoomService(setup(dummyPlayer));

            var actual = sut.createRoomAsOwner(dummyPlayer);
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
        });
    });

    describe("#createRoomAsCommon", function () {
        it("should create a room", function () {
            var sut = new room.RoomService(setup(dummyPlayer));

            var actual = sut.createRoomAsCommon(dummyPlayer, dummyPlayer, [dummyPlayer]);
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
        });
    });

    describe("#addPlayer", function () {
        it("should add the player to the room", function () {
            var sut = new room.RoomService(setup(dummyPlayer));
            var p = new player.Player(1, "key", false);

            var actual = sut.addPlayer(dummyRoom, p);

            assert.deepEqual(dummyRoom, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer, p]));
        });
    });

    describe("#addNewPlayer", function () {
        it("should add a new player that has the key to the room", function () {
            var key = "new player's key";
            var newPlayer = new player.Player(1, key, false);
            var sut = new room.RoomService(setup(newPlayer));

            var actual = sut.addNewPlayer(dummyRoom, key);

            assert.deepEqual(dummyRoom, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer]));
            assert.deepEqual(actual, new room.Room(dummyPlayer, dummyPlayer, [dummyPlayer, newPlayer]));
        });
    });
});
