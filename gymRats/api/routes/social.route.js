const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const DbService = require("../services/db.service");

const ResponseError = require("../errors/responseError");

const { authenticate } = require("../middlewares/authenticate");

const {
  HTTP_STATUS_CODES,
  COLLECTIONS,
  DEFAULT_ERROR_MESSAGE,
  CONNECTION_STATUSES,
} = require("../global");

const Connection = require("../db/models/social/connection.model");

const { connectionPostValidation } = require("../validation/hapi");
const ProgressService = require("../services/cards/progress.service");

router.post("/connection", authenticate, async (req, res, next) => {
  const { error } = connectionPostValidation(req.body);
  if (error)
    return next(
      new ResponseError(
        new ResponseError(
          error.details[0].message,
          HTTP_STATUS_CODES.BAD_REQUEST
        )
      )
    );

  const connection = new Connection(req.body);
  connection.initiatorId = mongoose.Types.ObjectId(req.user._id);

  try {
    if (req.body.receiverId.toString() == req.user._id.toString())
      return next(
        new ResponseError(
          "You cannot send a friend request to yourself",
          HTTP_STATUS_CODES.CONFLICT,
          64
        )
      );
    const existingConnection = await DbService.getOne(COLLECTIONS.CONNECTIONS, {
      $or: [
        {
          initiatorId: mongoose.Types.ObjectId(req.user._id),
          receiverId: mongoose.Types.ObjectId(req.body.receiverId),
        },
        {
          initiatorId: mongoose.Types.ObjectId(req.body.receiverId),
          receiverId: mongoose.Types.ObjectId(req.user._id),
        },
      ],
    });

    if (existingConnection)
      return next(
        new ResponseError(
          "You already have a connection",
          HTTP_STATUS_CODES.CONFLICT,
          61
        )
      );

    await DbService.create(COLLECTIONS.CONNECTIONS, connection);

    return res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    return next(
      new ResponseError(
        err.message || DEFAULT_ERROR_MESSAGE,
        err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    );
  }
});

router.get("/connection", authenticate, async (req, res, next) => {
  try {
    let connectionsForPush = [];
    const connections = await DbService.getMany(COLLECTIONS.CONNECTIONS, {
      status: CONNECTION_STATUSES.ACCEPTED,
      $or: [
        { initiatorId: mongoose.Types.ObjectId(req.user._id) },
        { receiverId: mongoose.Types.ObjectId(req.user._id) },
      ],
    });

    const requests = await DbService.getMany(COLLECTIONS.CONNECTIONS, {
      status: CONNECTION_STATUSES.REQUESTED,
      $or: [{ receiverId: mongoose.Types.ObjectId(req.user._id) }],
    });

    for (let request of requests) {
      const user = await DbService.getById(
        COLLECTIONS.USERS,
        request.initiatorId
      );
      request.initiator = user;
    }

    return res.status(HTTP_STATUS_CODES.OK).send({
      connections,
      requests,
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

router.delete("/connection/:id", authenticate, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return next(
      new ResponseError(
        "Invalid connection id",
        HTTP_STATUS_CODES.BAD_REQUEST,
        5
      )
    );

  try {
    const connection = await DbService.getById(
      COLLECTIONS.CONNECTIONS,
      req.params.id
    );
    if (!connection)
      return next(
        new ResponseError(
          "Connection not found",
          HTTP_STATUS_CODES.NOT_FOUND,
          62
        )
      );
    if (
      connection.initiatorId.toString() != req.user._id.toString() &&
      connection.receiverId.toString() != req.user._id.toString()
    ) {
      return next(
        new ResponseError(
          "Cannot delete connection",
          HTTP_STATUS_CODES.FORBIDDEN,
          63
        )
      );
    }
    await DbService.delete(COLLECTIONS.CONNECTIONS, {
      _id: mongoose.Types.ObjectId(req.params.id),
    });

    return res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    return next(
      new ResponseError(
        err.message || DEFAULT_ERROR_MESSAGE,
        err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    );
  }
});

router.put("/connection/:id/accept", authenticate, async (req, res, next) => {
  try {
    const connection = await DbService.getById(
      COLLECTIONS.CONNECTIONS,
      req.params.id
    );
    if (!connection)
      return next(
        new ResponseError(
          "Connection not found",
          HTTP_STATUS_CODES.NOT_FOUND,
          62
        )
      );
    if (connection.receiverId.toString() != req.user._id.toString()) {
      return next(
        new ResponseError(
          "Cannot accept this friend request",
          HTTP_STATUS_CODES.FORBIDDEN,
          63
        )
      );
    }
    await DbService.update(
      COLLECTIONS.CONNECTIONS,
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { status: "ACCEPTED" }
    );

    return res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    return next(
      new ResponseError(
        err.message || DEFAULT_ERROR_MESSAGE,
        err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    );
  }
});

router.get("/friends-competitive", authenticate, async (req, res, next) => {
  try {
    const userConnections = await DbService.getMany(COLLECTIONS.CONNECTIONS, {
      status: "ACCEPTED",
      $or: [
        { initiatorId: mongoose.Types.ObjectId(req.user._id) },
        { receiverId: mongoose.Types.ObjectId(req.user._id) },
      ],
    });
    let connectionsProgress = [];
    for (const connection of userConnections) {
      let friend = null;
      if (req.user._id.toString() == connection.initiatorId.toString()) {
        friend = connection.receiverId.toString();
      } else {
        friend = connection.initiatorId.toString();
      }
      const userTemplates = await DbService.getMany(COLLECTIONS.WORKOUTS, {
        userId: mongoose.Types.ObjectId(req.user._id),
      });
      const friendTemplates = await DbService.getMany(COLLECTIONS.WORKOUTS, {
        userId: mongoose.Types.ObjectId(friend),
      });
      const friendProperties = await DbService.getById(COLLECTIONS.USERS, friend)
      let friendProgression = 0;
      let userProgression = 0;

      for (const template of userTemplates) {
        const workoutsWithSpecificTemplate =
          await DbService.getManyWithSortAndLimit(
            COLLECTIONS.WORKOUT_SESSIONS,
            {
              userId: mongoose.Types.ObjectId(req.user._id),
              workoutId: mongoose.Types.ObjectId(template._id),
            },
            { year: -1, month: -1, date: -1 },
            2
          );
        workoutsWithSpecificTemplate.reverse();
        let progressPerTemplate = await ProgressService.getTemplateProgress(workoutsWithSpecificTemplate);
        userProgression += progressPerTemplate;
      }

      for (const template of friendTemplates) {
        const workoutsWithSpecificTemplate =
          await DbService.getManyWithSortAndLimit(
            COLLECTIONS.WORKOUT_SESSIONS,
            {
              userId: mongoose.Types.ObjectId(friend),
              workoutId: mongoose.Types.ObjectId(template._id),
            },
            { year: -1, month: -1, date: -1 },
            2
          );
        workoutsWithSpecificTemplate.reverse();
        let progressPerTemplate = await ProgressService.getTemplateProgress(workoutsWithSpecificTemplate);
        friendProgression += progressPerTemplate;
      }

      userProgression
        ? userProgression /= userTemplates.length
        : null
      friendProgression != 0
        ? friendProgression /= friendTemplates.length
        : null

      connectionsProgress.push({
        me: {
          percentageProgress: parseInt(userProgression.toFixed(0)),
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profilePicture: req.user.profilePicture
        },
        friend: {
          percentageProgress: parseInt(friendProgression.toFixed(0)),
          firstName: friendProperties.firstName,
          lastName: friendProperties.lastName,
          profilePicture: friendProperties.profilePicture
        }
      })
    }
    return res.status(HTTP_STATUS_CODES.OK).send({
      competitive: connectionsProgress
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

module.exports = router;
