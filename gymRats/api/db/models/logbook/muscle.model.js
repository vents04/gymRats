const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../../global');

const muscleSchema = mongoose.Schema({
    name: {
        type: String,
        minLength: 1,
        maxLength: 150,
        required: true
    }
});

const Muscle = mongoose.model(DATABASE_MODELS.MUSCLE, muscleSchema);
module.exports = Muscle;
