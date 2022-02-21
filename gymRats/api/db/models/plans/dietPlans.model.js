const mongoose = require('mongoose');
const { DATABASE_MODELS, PROFFESIONS } = require('../../../global');

const dietPlanSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 1,
        max: 100
    },
    creatorName: {
        type: String,
        required: true,
        min: 1,
        max: 100
    },
    creatorProffesion: [{
        name: {
            type: String,
            enum: Object.values(PROFFESIONS),
        }
    }]
});

const DietModel = mongoose.model(DATABASE_MODELS.DIET_PLAN, dietPlanSchema);
module.exports = DietModel;