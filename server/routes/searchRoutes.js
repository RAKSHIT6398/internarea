const express = require("express");
const router = express.Router();
const optionalAuth = require("../middleware/optionalAuth");
const { searchAll, getSuggestions } = require("../controllers/searchController");


router.get("/suggest", optionalAuth, getSuggestions);
router.get("/", optionalAuth, searchAll);

module.exports = router;