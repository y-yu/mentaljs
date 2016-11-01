const sjcl = require("sjcl");
const exception = require("./exception.js");

class Crypto {
    /**
     * Get a random number based on the curve
     *
     * @param {sjcl.ecc.curve} curve
     * @param {number} paranoia
     * @returns {sjcl.bn}
     */
    getRandom(curve, paranoia) {
        if (!(curve instanceof sjcl.ecc.curve)) {
            throw new exception.InvalidCurve(curve);
        }

        paranoia = paranoia || 0;

        return sjcl.bn.random(curve.r, paranoia);
    }

    /**
     * Get a point on the curve
     * Don't use this function to get the unit point
     *
     * @param {sjcl.ecc.curve} curve
     * @param {(number|sjcl.bn)} x
     * @param {(number|sjcl.bn)} y
     * @returns {sjcl.ecc.point}
     */
    getPoint(curve, x, y) {
        if (!(curve instanceof sjcl.ecc.curve)) {
            throw new exception.InvalidCurve(curve);
        }

        if (typeof(x) === "number") {
            x = new sjcl.bn(x)
        } else if (!(x instanceof sjcl.bn)) {
            throw new exception.InvalidNumber(x);
        }

        if (typeof(y) == "number") {
            y = new sjcl.bn(y);
        } else if (!(y instanceof sjcl.bn)) {
            throw new exception.InvalidNumber(y);
        }

        return new sjcl.ecc.point(curve, x, y);
    }

    /**
     * Get an unit point on the curve
     *
     * @param {sjcl.ecc.curve} curve
     * @returns {sjcl.ecc.point}
     */
    getUnitPoint(curve) {
        if (!(curve instanceof sjcl.ecc.curve)) {
            throw new exception.InvalidCurve(curve);
        }

        return new sjcl.ecc.point(curve);
    }

    /**
     * Get a random generator point on the curve
     *
     * @param {sjcl.ecc.curve} curve
     * @param {number} paranoia
     * @returns {sjcl.ecc.point}
     */
    getRandomPoint(curve, paranoia) {
        if (!(curve instanceof sjcl.ecc.curve)) {
            throw new exception.InvalidCurve(curve);
        }

        paranoia = paranoia || 0;
        const r = this.getRandom(curve, paranoia);

        return curve.G.mult(r);
    }

    /**
     * Add two points on the same curve
     *
     * @param {sjcl.ecc.point} p1
     * @param {sjcl.ecc.point} p2
     * @returns {sjcl.ecc.point}
     */
    add(p1, p2) {
        if (!(p1 instanceof sjcl.ecc.point)) {
            throw new exception.InvalidPoint(p1);
        } else if (!(p2 instanceof sjcl.ecc.point)) {
            throw new exception.InvalidPoint(p2);
        }

        return p1.toJac().add(p2).toAffine();
    }

    /**
     * Multiply the point by the constant
     *
     * @param {sjcl.ecc.point} p
     * @param {(number|sjcl.bn)} a
     * @returns {sjcl.ecc.point}
     */
    mul(p, a) {
        if (typeof(a) === "number") {
            a = new sjcl.bn(a);
        } else if (!(a instanceof sjcl.bn)) {
            throw new exception.InvalidNumber(a);
        }

        if (!(p instanceof sjcl.ecc.point)) {
            throw new exception.InvalidPoint(p);
        }

        return p.mult(a);
    }

    /**
     * Get the inverse of the point
     *
     * @param {sjcl.ecc.point} p
     * @returns {sjcl.ecc.point}
     */
    inv(p) {
        if (!(p instanceof sjcl.ecc.point)) {
            throw new exception.InvalidPoint(p);
        }

        return p.negate();
    }

    /**
     * Get a curve
     *
     * @param {string} str
     * @returns {sjcl.ecc.curve}
     */
    getCurve(str) {
        if (sjcl.ecc.curves[str] !== undefined) {
            return sjcl.ecc.curves[str];
        } else {
            throw new exception.NoSuchCurve(str);
        }
    }

    /**
     * Get the generator of the curve
     *
     * @param {sjcl.ecc.curve} curve
     * @returns {sjcl.bn}
     */
    getGen(curve) {
        if (!(curve instanceof sjcl.ecc.curve)) {
            throw new exception.InvalidCurve(curve);
        }

        return curve.G;
    }
}

module.exports = Crypto;
