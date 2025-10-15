const User = require('../models/User');
const Trend = require('../models/Trend');
const resourceMap = require('../data/resourceMap');
const careerPaths = require('../data/careerPaths');
const SKILL_PREREQUISITES = require('../data/skillPrerequisites');

const PROFICIENCY_WEIGHTS = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };

const calculateWeightedSimilarity = (currentSkills, otherSkills) => {
  const currentMap = new Map(currentSkills.map(s => [s.skillName.toLowerCase(), PROFICIENCY_WEIGHTS[s.proficiency]]));
  const otherMap = new Map(otherSkills.map(s => [s.skillName.toLowerCase(), PROFICIENCY_WEIGHTS[s.proficiency]]));
  let intersection = 0, union = 0;
  const allSkills = new Set([...currentMap.keys(), ...otherMap.keys()]);
  for (const skill of allSkills) {
    const a = currentMap.get(skill) || 0;
    const b = otherMap.get(skill) || 0;
    intersection += Math.min(a, b);
    union += Math.max(a, b);
  }
  return union ? intersection / union : 0;
};

exports.getMarketRecommendations = async (req, res) => {
  try {
    const { skills: userSkills, careerInterest } = req.body;
    const userSkillSet = new Set(userSkills.map(s => s.skillName.toLowerCase()));
    const requiredSkills = careerPaths[careerInterest];
    if (!requiredSkills) return res.status(404).json({ msg: 'Career path not found.' });

    const trendsData = await Trend.findById('skill_historical_trends');
    if (!trendsData) return res.status(404).json({ msg: 'Trend data not found.' });

    const trendsMap = new Map(trendsData.trends.map(s => [s.skill.toLowerCase(), s]));
    const recommendationsMap = new Map();

    // --- New / Prerequisite Recommendations ---
    for (const skill of requiredSkills) {
      if (userSkillSet.has(skill.toLowerCase())) continue;
      const trend = trendsMap.get(skill.toLowerCase());
      if (!trend || trend.history.length < 2) continue;
      const [prev, curr] = trend.history.slice(-2);
      const growth = ((curr.demand_score - prev.demand_score) / prev.demand_score) * 100;
      const relevance = parseFloat(((curr.demand_score * 0.4) + (growth * 0.6)).toFixed(2));
      
      const prerequisites = SKILL_PREREQUISITES[skill.toLowerCase()] || [];
      const missingPrereq = prerequisites.find(pr => !userSkillSet.has(pr));
      
      if (missingPrereq) {
        // Add only if better relevance
        if (!recommendationsMap.has(missingPrereq) || relevance > recommendationsMap.get(missingPrereq).relevance_score) {
          recommendationsMap.set(missingPrereq, { skill: missingPrereq, type: 'prerequisite', unlocks: skill, relevance_score: relevance });
        }
      } else {
        recommendationsMap.set(skill, { skill, type: 'new', demand_score: curr.demand_score, growth_rate: parseFloat(growth.toFixed(2)), relevance_score: relevance });
      }
    }

    // --- Improve Existing Skills ---
    for (const skillObj of userSkills) {
      const skillName = skillObj.skillName.toLowerCase();
      if (skillObj.proficiency === 'Expert') continue;
      const trend = trendsMap.get(skillName);
      if (!trend || trend.history.length < 2) continue;
      const [prev, curr] = trend.history.slice(-2);
      const growth = ((curr.demand_score - prev.demand_score) / prev.demand_score) * 100;
      const relevance = parseFloat(((curr.demand_score * 0.4) + (growth * 0.6)).toFixed(2));
      recommendationsMap.set(skillName + '_improve', { skill: trend.skill, type: 'improve', demand_score: curr.demand_score, growth_rate: parseFloat(growth.toFixed(2)), relevance_score: relevance });
    }

    const finalRecs = Array.from(recommendationsMap.values())
      .sort((a,b) => b.relevance_score - a.relevance_score)
      .map(rec => ({ ...rec, resource: resourceMap[rec.skill.toLowerCase()] || null }))
      .slice(0,5);

    res.json(finalRecs);

  } catch (err) {
    console.error("Market Rec Error:", err);
    res.status(500).send('Server Error');
  }
};

exports.getCollaborativeRecommendations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('skills');
    // Only sample top 100 users for performance in large DBs
    const otherUsers = await User.find({ _id: { $ne: req.user.id } }).select('skills').limit(100);
    const currentSkillSet = new Set(currentUser.skills.map(s => s.skillName.toLowerCase()));

    const scoredSkills = {};
    otherUsers.forEach(user => {
      const sim = calculateWeightedSimilarity(currentUser.skills, user.skills);
      if (sim === 0) return;
      user.skills.forEach(s => {
        const skill = s.skillName.toLowerCase();
        if (!currentSkillSet.has(skill)) scoredSkills[skill] = (scoredSkills[skill] || 0) + sim;
      });
    });

    const recs = Object.entries(scoredSkills)
      .map(([skill, score]) => ({ skill, score: parseFloat(score.toFixed(2)), type: 'peer', resource: resourceMap[skill] || null }))
      .sort((a,b) => b.score - a.score)
      .slice(0,5);

    res.json(recs);

  } catch (err) {
    console.error("Collab Rec Error:", err);
    res.status(500).send('Server Error');
  }
};
