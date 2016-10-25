var sjcl = require('sjcl');

var crypto = function () { };

crypto.prototype.exceptions = {
    /**
     * Exceptions
     */
    InvalidCurve: function (c) {
        this.message = "the given curve is not an instance of sjcl.ecc.curve";
        this.curve = c;
    },

    InvalidPoint: function (p) {
        this.message = "the given point is not an instance of sjcl.ecc.point";
        this.point = p;
    },

    NoSuchCurve: function (n) {
        this.message = "the given curve name is not found";
        this.name = n;
    },

    InvalidNumber: function (n) {
        this.message = "the given number is invalid";
        this.number = n;
    }
};


/**
 * Get a random number based on the curve
 *
 * @param {sjcl.ecc.curve} curve
 * @param {number} paranoia
 * @returns {sjcl.bn}
 */
crypto.prototype.getRandom = function (curve, paranoia) {
    if (!(curve instanceof sjcl.ecc.curve)) {
        throw new this.exceptions.InvalidCurve(curve);
    }

    paranoia = paranoia || 0;

    return sjcl.bn.random(curve.r, paranoia);
};

/**
 * Get a point on the curve
 * Don't use this function to get the unit point
 *
 * @param {sjcl.ecc.curve} curve
 * @param {(number|sjcl.bn)} x
 * @param {(number|sjcl.bn)} y
 * @returns {sjcl.ecc.point}
 */
crypto.prototype.getPoint = function (curve, x, y) {
    if (!(curve instanceof sjcl.ecc.curve)) {
        throw new this.exceptions.InvalidCurve(curve);
    }

    if (typeof(x) === "number") {
        x = new sjcl.bn(x)
    } else if (!(x instanceof sjcl.bn)) {
        throw new this.exceptions.InvalidNumber(x);
    }

    if (typeof(y) == "number") {
        y = new sjcl.bn(y);
    } else if (!(y instanceof sjcl.bn)) {
        throw new this.exceptions.InvalidNumber(y);
    }

    return new sjcl.ecc.point(curve, x, y);
};

/**
 * Get an unit point on the curve
 *
 * @param {sjcl.ecc.curve} curve
 * @returns {sjcl.ecc.point}
 */
crypto.prototype.getUnitPoint = function (curve) {
    if (!(curve instanceof sjcl.ecc.curve)) {
        throw new this.exceptions.InvalidCurve(curve);
    }

    return new sjcl.ecc.point(curve);
};

/**
 * Get a random point on the curve
 *
 * @param {sjcl.ecc.curve} curve
 * @param {number} paranoia
 * @returns {sjcl.ecc.point}
 */
crypto.prototype.getRandomPoint = function (curve, paranoia) {
    if (!(curve instanceof sjcl.ecc.curve)) {
        throw new this.exceptions.InvalidCurve(curve);
    }

    paranoia = paranoia || 0;

    var x = this.getRandom(curve, paranoia);
    var y = this.getRandom(curve, paranoia);

    return new sjcl.ecc.point(curve, x, y);
};

/**
 * Add two points on the same curve
 *
 * @param {sjcl.ecc.point} p1
 * @param {sjcl.ecc.point} p2
 * @returns {sjcl.ecc.point}
 */
crypto.prototype.add = function (p1, p2) {
    if (!(p1 instanceof sjcl.ecc.point)) {
        throw new this.exceptions.InvalidPoint(p1);
    } else if (!(p2 instanceof sjcl.ecc.point)) {
        throw new this.exceptions.InvalidPoint(p2);
    }

    return p1.toJac().add(p2).toAffine();
};

/**
 * Multiply the point by the constant
 *
 * @param {sjcl.ecc.point} p
 * @param {(number|sjcl.bn)} a
 * @returns {sjcl.ecc.point}
 */
crypto.prototype.mul = function (p, a) {
    if (typeof(a) === "number") {
        a = new sjcl.bn(a);
    } else if (!(a instanceof sjcl.bn)) {
        throw new this.exceptions.InvalidNumber(a);
    }

    if (!(p instanceof sjcl.ecc.point)) {
        throw new this.exceptions.InvalidPoint(p);
    }

    return p.mult(a);
};

/**
 * Get the inverse of the point
 *
 * @param {sjcl.ecc.point} p
 * @returns {sjcl.ecc.point}
 */
crypto.prototype.inv = function (p) {
    if (!(p instanceof sjcl.ecc.point)) {
        throw new this.exceptions.InvalidPoint(p);
    }

    return p.negate();
};

/**
 * Get a curve
 *
 * @param {string} str
 * @returns {sjcl.ecc.curve}
 */
crypto.prototype.getCurve = function (str) {
    if (sjcl.ecc.curves[str] !== undefined) {
        return sjcl.ecc.curves[str];
    } else {
        throw new this.exceptions.NoSuchCurve(str);
    }
};

/**
 * Get the generator of the curve
 *
 * @param {sjcl.ecc.curve} curve
 * @returns {sjcl.bn}
 */
crypto.prototype.getGen = function (curve) {
    if (!(curve instanceof sjcl.ecc.curve)) {
        throw new this.exceptions.InvalidCurve(curve);
    }

    return curve.G;
};

module.exports = crypto;
