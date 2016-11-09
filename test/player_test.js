'use strict';

const assert = require("assert");
const player = require("../lib/player");

describe("PlayerService", () => {
    const sut = new player.PlayerService();

    describe("#createPlayer", () => {
        it("should create a player", () => {
            const id = 0;
            const key = "key";

            // todo: use the fake connection
            var actual = sut.createPlayer(id, key, null);

            assert.deepEqual(actual, new player.Player(id, key, null));
        })
    })
});