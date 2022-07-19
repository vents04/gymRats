const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ResponseError = require("../errors/responseError");
const {
  DEFAULT_ERROR_MESSAGE,
  HTTP_STATUS_CODES,
  RELATION_STATUSES,
  COLLECTIONS,
} = require("../global");
const { authenticate } = require("../middlewares/authenticate");
const LogbookService = require("../services/cards/logbook.service");
const WeightTrackerService = require("../services/cards/weightTracker.service");
const DbService = require("../services/db.service");

router.get("/page", authenticate, async (req, res, next) => {
  try {
    let message = false;

    const relation = await DbService.getOne(COLLECTIONS.RELATIONS, {
      clientId: mongoose.Types.ObjectId(req.user._id),
    });
    if (relation && relation.status == RELATION_STATUSES.ACTIVE) message = true;

    const date = new Date();
    let weightTrackerProgress =
      await WeightTrackerService.getProgressNotationNew(
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear(),
        req.user._id,
        req.headers.lng
      );
    let logbookProgress = await LogbookService.getExercisesProgress(
      req.user._id
    );
    let workoutSession = await DbService.getOne(COLLECTIONS.WORKOUT_SESSIONS, {
      userId: mongoose.Types.ObjectId(req.user._id),
      date: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
    return res.status(HTTP_STATUS_CODES.OK).send({
      weightTrackerProgress,
      logbookProgress,
      message: message,
      hasAddedWorkoutSession: workoutSession ? true : false,
    });
  } catch (err) {
    console.log(err);
    return next(
      new ResponseError(
        err.message || DEFAULT_ERROR_MESSAGE,
        err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    );
  }
});

// Define a get endpoint that returns in response the value returned from the service you have written in a json object with some adequate properties //
router.get(
  "/logbook-progress/:progressType",
  authenticate,
  async (req, res, next) => {
    try {
      const workoutsWithSpecificTemplate =
        await DbService.getManyWithSortAndLimit(COLLECTIONS.WORKOUT_SESSIONS, {
            userId: mongoose.Types.ObjectId(req.user._id),
          workoutId: mongoose.Types.ObjectId(req.body.workoutId)},
          [['year', -1],['month', -1],['date', -1]],
          req.body.limit
        );
      return res.status(HTTP_STATUS_CODES.OK).send({});
    } catch (err) {
      return next(
        new ResponseError(
          err.message || DEFAULT_ERROR_MESSAGE,
          err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

module.exports = router;
