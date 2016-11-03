'use strict';

const assert = require("assert");
const logger = require("../lib/logger");
const sinon = require("sinon");

describe("ConsoleLogger", () => {
    const stub = sinon.stub({log: () => {}, warn: () => {}, error: () => {}});
    const sut = new logger.ConsoleLogger(stub);

    describe("#log",() => {
        it("should put logs to console", () => {
            sut.log("string", true);

            assert(stub.log.withArgs("string").calledOnce);
            assert(stub.log.withArgs(true).calledOnce);
        });
    });

    describe("#warn",() => {
        it("should put logs to console", () => {
            sut.warn("string", true);

            assert(stub.warn.withArgs("string").calledOnce);
            assert(stub.warn.withArgs(true).calledOnce);
        });
    });

    describe("#error",() => {
        it("should put logs to console", () => {
            sut.error("string", true);

            assert(stub.error.withArgs("string").calledOnce);
            assert(stub.error.withArgs(true).calledOnce);
        });
    });
});