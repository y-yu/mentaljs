'use strict';

const assert = require("assert");
const deck = require("../lib/deck");
const sinon = require("sinon");
const CryptoService = require("../lib/crypto");
const card = require("../lib/card");

describe("DeckService", () => {
    const setup = () => {
        const stubCardService = sinon.createStubInstance(card.CardService);
        const stubCryptoService = sinon.createStubInstance(CryptoService);
        const sut = new deck.DeckService(stubCryptoService, stubCardService);

        return [
            sut,
            {
                cardService: stubCardService,
                cryptoService: stubCryptoService
            }
        ];
    };

    describe("#createDeck", () => {
        it("should make a deck", () => {
            const [sut, stubs] = setup();
            const vs = [1, 2, 3];

            stubs.cardService.createCard.withArgs(1).returns(new card.Card(1));
            stubs.cardService.createCard.withArgs(2).returns(new card.Card(2));
            stubs.cardService.createCard.withArgs(3).returns(new card.Card(3));

            const excepted = new deck.Deck([new card.Card(1), new card.Card(2), new card.Card(3)]);

            const actual = sut.createDeck(vs);
            assert.deepEqual(actual, excepted);
        });
    });
});