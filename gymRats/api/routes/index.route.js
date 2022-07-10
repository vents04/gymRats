const express = require("express");
const router = express.Router();

const adminRoute = require("./admin.route");
const analyticsRoute = require("./analytics.route");
const userRoute = require("./user.route");
const caloriesCounterRoute = require("./caloriesCounter.route");
const weightTrackerRoute = require("./weightTracker.route");
const logbookRoute = require("./logbook.route");
const dateRoute = require("./date.route");
const coachingRoute = require("./coaching.route");
const googleRoute = require("./google.route");
const chatRoute = require("./chat.route");
const progressRoute = require("./progress.route");
const contentRoute = require("./content.route");

router.use("/admin", adminRoute);
router.use("/analytics", analyticsRoute);
router.use("/user", userRoute);
router.use("/calories-counter", caloriesCounterRoute);
router.use("/weight-tracker", weightTrackerRoute);
router.use("/logbook", logbookRoute);
router.use("/date", dateRoute);
router.use("/coaching", coachingRoute);
router.use("/google", googleRoute);
router.use("/chat", chatRoute);
router.use("/progress", progressRoute);
router.use("/content", contentRoute);

module.exports = router;