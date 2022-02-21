const mongoose = require('mongoose');
const { DATABASE_MODELS, PROFESSIONS } = require('../../../global');

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
    creatorProfession: [{
        name: {
            type: String,
            enum: Object.values(PROFESSIONS),
        }
    }]
});

const DietModel = mongoose.model(DATABASE_MODELS.DIET_PLAN, dietPlanSchema);
module.exports = DietModel;