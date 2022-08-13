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
const ProgressService = require("../services/cards/progress.service");
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

    return next(
      new ResponseError(
        err.message || DEFAULT_ERROR_MESSAGE,
        err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    );
  }
});

router.get(
  "/logbook-progress",
  authenticate,
  async (req, res, next) => {
    try {
      const templates = await DbService.getMany(COLLECTIONS.WORKOUTS, {
        userId: mongoose.Types.ObjectId(req.user._id)
      })
      console.log("sdasdasd", templates.length)

      let percentageProgressVolume = 0;
      let percentageProgressStrength = 0;
      let percentageProgressCombined = 0;

      for (let template of templates) {
        const workoutsWithSpecificTemplate =
          await DbService.getManyWithSortAndLimit(COLLECTIONS.WORKOUT_SESSIONS, {
            workoutId: mongoose.Types.ObjectId(template._id)
          },
            { year: -1, month: -1, date: -1 },
            4
          );
        workoutsWithSpecificTemplate.reverse();
        if (workoutsWithSpecificTemplate.length % 2 != 0) workoutsWithSpecificTemplate.shift();
        percentageProgressVolume += await ProgressService.getTemplateProgressVolume(workoutsWithSpecificTemplate);
        percentageProgressStrength += await ProgressService.getTemplateProgressStrength(workoutsWithSpecificTemplate);
        percentageProgressCombined += await ProgressService.getTemplateProgress(workoutsWithSpecificTemplate);
        console.log(percentageProgressVolume, percentageProgressStrength, percentageProgressCombined)
      }

      if (percentageProgressVolume > 0) percentageProgressVolume = percentageProgressVolume / templates.length;
      if (percentageProgressStrength > 0) percentageProgressStrength = percentageProgressStrength / templates.length;
      if (percentageProgressCombined > 0) percentageProgressCombined = percentageProgressCombined / templates.length;

      percentageProgressVolume = parseInt(percentageProgressVolume.toFixed(0));
      percentageProgressStrength = parseInt(percentageProgressStrength.toFixed(0));
      percentageProgressCombined = parseInt(percentageProgressCombined.toFixed(0));

      return res.status(HTTP_STATUS_CODES.OK).send({ percentageProgressCombined, percentageProgressVolume, percentageProgressStrength, templatesLengthForProgress: templates.length });
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
