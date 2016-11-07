'use strict';

const assert = require("assert");
const sinon = require("sinon");
const CryptoService = require("../lib/crypto");
const card = require("../lib/card");
const exception = require("../lib/exception");
const sjcl = require("sjcl");

describe("CardService", () => {
    const setup = () => {
        const stubCryptoService = sinon.createStubInstance(CryptoService);
        const sut = new card.CardService(stubCryptoService);

        return [sut, stubCryptoService];
    };

    describe("#createCard", () => {
        it("should return a card", () => {
            const [sut, _] = setup();

            const actual = sut.createCard(1);
            assert.deepEqual(actual, new card.Card(new sjcl.bn(1)));
        });

        it("should return an exception if the input is not a number", () => {
            const [sut, _] = setup();

            assert.throws(() => { sut.createCard("invalid"); }, exception.InvalidNumber);
        });
    });
});