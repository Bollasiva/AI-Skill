const mongoose = require('mongoose');
const PointSchema = new mongoose.Schema({ year: { type: Number, required: true }, demand_score: { type: Number, required: true } }, { _id: false });
const SkillForecastSchema = new mongoose.Schema({ skill: { type: String, required: true }, forecast: [PointSchema] }, { _id: false });
const ForecastSchema = new mongoose.Schema({ _id: { type: String, required: true }, forecasts: [SkillForecastSchema], last_updated: { type: Date, default: Date.now } });
module.exports = mongoose.model('Forecast', ForecastSchema);