"use strict";

const os = require("os");

module.exports = {
	// It will be unique when scale up instances in Docker or on local computer
	nodeID: os.hostname().toLowerCase() + "-" + process.pid,

	logger: process.env.LOGGER !== "false",
	logLevel: process.env.LOGLEVEL || "info",

	transporter: process.env.TRANSPORTER || null,

	cacher: process.env.CACHER || "memory",

	metrics: false
};
