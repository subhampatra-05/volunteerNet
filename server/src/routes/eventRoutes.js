const express = require("express");
const router = express.Router();
const { getApprovedEvents } = require("../controllers/eventController");

router.get("/", getApprovedEvents);

module.exports = router;