const mongoose = require('mongoose');
const PointSchema = new mongoose.Schema({ year: { type: Number, required: true }, demand_score: { type: Number, required: true } }, { _id: false });
const SkillTrendSchema = new mongoose.Schema({ skill: { type: String, required: true }, history: [PointSchema] }, { _id: false });
const TrendSchema = new mongoose.Schema({ _id: { type: String, required: true }, trends: [SkillTrendSchema], last_updated: { type: Date, default: Date.now } });
module.exports = mongoose.model('Trend', TrendSchema);