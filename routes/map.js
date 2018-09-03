const express = require('express');
const router = express.Router();

router.get('/map', function (req, res) {
  res.render('../views/pages/map');
});

router.get('/map/stortbilde', function (req, res) {
  res.render('../views/pages/fullsize');
});

module.exports = router;
