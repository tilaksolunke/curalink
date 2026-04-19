const express = require("express");
const { getResearch } = require("../controllers/researchController");

const router = express.Router();

router.post("/", getResearch);

module.exports = router;
