const express = require('express');
const router = express.Router();

const { adminAuthenticate } = require('../middlewares/authenticate');

router.get("/page", adminAuthenticate, async (req, res, next) => {

})