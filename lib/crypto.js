var sjcl = require('sjcl');

var crypto = function () {
    this.getRandom = function (curve, paranoia) {
        if (!curve instanceof sjcl.ecc.curve) {
            function InvaildCurve(c) {
                this.message = "the given curve is invalid";
                this.curve = c;
            }
            throw new InvaildCurve(curve);
        }

        paranoia = paranoia || 0;

        return sjcl.bn.random(curve.r, paranoia);
    };

    this.getPoint = function (curve, x, y) {
        if (typeof(x) === "number") {
            x = new sjcl.bn(x)
        }

        if (typeof(y) == "number") {
            y = new sjcl.bn(y);
        }

        return new sjcl.ecc.point(curve, x, y);
    };

    this.getUnitPoint = function (curve) {
        return new sjcl.ecc.point(curve);
    };

    this.getRandomPoint = function (curve, paranoia) {
        paranoia = paranoia || 0;

        var x = this.getRandom(curve, paranoia);
        var y = this.getRandom(curve, paranoia);

        return new sjcl.ecc.point(curve, x, y);
    };

    this.add = function (p1, p2) {
        return p1.toJac().add(p2).toAffine();
    };

    this.mul = function (p, a) {
        if (typeof(a) === "number") {
            a = new sjcl.bn(a);
        }

        return p.mult(a);
    };

    this.inv = function (p) {
        return p.negate();
    };

    this.getCurve = function (str) {
        return sjcl.ecc.curves[str];
    };

    this.getGen = function (curve) {
        return curve.G;
    };
};

module.exports = crypto;
