/**
 * The curve is invalid
 *
 * @param {object} c
 */
class InvalidCurve {
    constructor(c) {
        this.message = "the given curve is not an instance of sjcl.ecc.curve";
        this.curve = c;
    }
}

/**
 * The point is invalid
 *
 * @param {object} p
 */
class InvalidPoint {
    constructor(p) {
        this.message = "the given point is not an instance of sjcl.ecc.point";
        this.point = p;
    }
}

/**
 * Curve that has the name is not found
 *
 * @param {string} n
 * @constructor
 */
class NoSuchCurve {
    constructor(n) {
        this.message = "the given curve name is not found";
        this.name = n;
    }
}

/**
 * Not a number
 *
 * @param {object} n
 * @constructor
 */
class InvalidNumber {
    constructor(n) {
        this.message = "the given number is invalid";
        this.number = n;
    }
}

module.exports.InvalidCurve = InvalidCurve;
module.exports.InvalidPoint = InvalidPoint;
module.exports.NoSuchCurve = NoSuchCurve;
module.exports.InvalidNumber = InvalidNumber;