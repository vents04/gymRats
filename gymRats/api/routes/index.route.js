const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const caloriesCounterRoute = require("./caloriesCounter.route");
const weightTrackerRoute = require("./weightTracker.route");
const waterIntakeRoute = require("./waterIntake.route");
const logbookRoute = require("./logbook.route");
const dateRoute = require("./date.route");
const coachingRoute = require("./coaching.route");
const googleRoute = require("./google.route");
const chatRoute = require("./chat.route");

router.use("/user", userRoute);
router.use("/calories-counter", caloriesCounterRoute);
router.use("/weight-tracker", weightTrackerRoute);
router.use("/water-intake", waterIntakeRoute);
router.use("/logbook", logbookRoute);
router.use("/date", dateRoute);
router.use("/coaching", coachingRoute);
router.use("/google", googleRoute);
router.use("/chat", chatRoute);

module.exports = router;