class Deck {
    /**
     * The deck constructor
     *
     * @param {[Card]} cards
     */
    constructor (cards) {
        this.cards = cards;
    }
}

class DeckService {
    /**
     * Deck service constructor
     *
     * @param {CryptoService} cryptoService
     * @param {CardService} cardService
     */
    constructor(cryptoService, cardService) {
        this.cryptoService = cryptoService;
        this.cardService = cardService;
    }

    /**
     * Create a deck
     *
     * @param {[number]|[sjcl.bn]} vs
     * @returns {Deck}
     */
    createDeck (vs) {
        const cards = vs.map((v) => {
            return this.cardService.createCard(v);
        });

        return new Deck(cards);
    }

    /**
     * Draw the card
     *
     * @param {Deck} deck
     * @param {number} index
     * @returns {Card}
     */
    drawCard(deck, index) {
        return deck.cards[index];
    }
}

module.exports.Deck = Deck;
module.exports.DeckService = DeckService;