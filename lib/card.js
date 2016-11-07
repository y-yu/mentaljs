const sjcl = require("sjcl");
const exception = require("./exception");

class Card {
    /**
     * Constructor of a card
     *
     * @param {sjcl.bn} v
     */
    constructor (v) {
        this.v = v;
    }
}

class CardService {
    /**
     * Card service constructor
     *
     * @param cryptoService
     */
    constructor (cryptoService) {
        this.cryptoService = cryptoService;
    }

    /**
     * Create a card
     *
     * @param {number|sjcl.bn} v
     * @returns {Card}
     */
    createCard (v) {
        if (typeof(v) === "number") {
            v = new sjcl.bn(v);
        } else if (!(v instanceof sjcl.bn)) {
            throw new exception.InvalidNumber(v);
        }

        return new Card(v)
    }
}

module.exports.Card = Card;
module.exports.CardService = CardService;
