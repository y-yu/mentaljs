'use strict';

var assert = require("assert");
var player = require("../lib/player.js");

describe("PlayerService", function () {
    var sut = new player.PlayerService();

    describe("#createPlayer", function () {
        it("should create a player", function () {
            var id = 0;
            var key = "key";
            var isMe = true;

            var actual = sut.createPlayer(id, key, isMe);

            assert.deepEqual(actual, new player.Player(id, key, isMe));
        })
    })
});