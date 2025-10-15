import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getUserProfile, 
  updateUserSkills, 
  getMarketRecommendations, 
  getCollaborativeRecommendations,
  getCareerPaths 
} from '../api/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { MentorBot } from './MentorBot';

const RecommendationItem = ({ rec }) => {
  const learningLink = rec.resource ? (
    <a 
      href={rec.resource.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="start-learning-link"
    >
      Start Learning on {rec.resource.provider}
    </a>
  ) : null;

  return (
    <div className="recommendation-item">
      <div className="rec-header">
        <span className="rec-skill-name">{rec.skill}</span>
        <span className="rec-relevance-score">
          {rec.type === 'peer' ? 'Popular with your peers'
            : rec.type === 'improve' ? 'Improve This Skill'
            : rec.type === 'prerequisite' ? 'First Step'
            : 'High Growth'}
        </span>
      </div>
      <div className="rec-details">
        {rec.demand_score && <span>Demand: {rec.demand_score}</span>}
        {rec.growth_rate && <span>Growth: {rec.growth_rate}%</span>}
      </div>
      {rec.unlocks && <div className="rec-unlocks-text">Unlocks your path to learning {rec.unlocks}</div>}
      {learningLink}
    </div>
  );
};

const SkillProfile = () => {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newSkill, setNewSkill] = useState({ skillName: '', proficiency: 'Beginner' });
  const [isAddFormVisible, setAddFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [careerPaths, setCareerPaths] = useState([]);
  const [careerInterest, setCareerInterest] = useState('');
  const [isBotVisible, setIsBotVisible] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profileRes, careersRes] = await Promise.all([
          getUserProfile(), 
          getCareerPaths()
        ]);

        if (profileRes?.data) {
          setUser(profileRes.data);
          setSkills(profileRes.data.skills || []);
          if (careersRes?.data?.length > 0) {
            setCareerPaths(careersRes.data);
            setCareerInterest(careersRes.data[0]);
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Error during initial load:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || !careerInterest) return;
      try {
        const [marketRecsRes, peerRecsRes] = await Promise.all([
          getMarketRecommendations(skills, careerInterest),
          getCollaborativeRecommendations()
        ]);
        setRecommendations([...(peerRecsRes?.data || []), ...(marketRecsRes?.data || [])]);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    if (!isLoading) fetchRecommendations();
  }, [skills, careerInterest, user, isLoading]);

  const handleAddSkill = () => {
    if (newSkill.skillName.trim()) {
      setSkills([...skills, newSkill]);
      setNewSkill({ skillName: '', proficiency: 'Beginner' });
    }
  };

  const handleDeleteSkill = (indexToDelete) => {
    setSkills(skills.filter((_, index) => index !== indexToDelete));
  };

  const handleSaveSkills = async () => {
    try {
      await updateUserSkills(skills);
      alert('Profile Updated Successfully!');
    } catch (error) {
      console.error('Failed to save skills', error);
      alert('Could not save skills.');
    }
  };

  if (isLoading) return <motion.div className="glass-card" style={{ textAlign: 'center' }}>Loading...</motion.div>;

  return (
    <>
      <motion.div className="glass-card profile-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="profile-header">
          <h2>Welcome, {user?.name}!</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/dashboard" className="dashboard-link">View Dashboard</Link>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleLogout} className="logout-button">Logout</motion.button>
          </div>
        </div>

        <div className="career-interest-section">
          <label htmlFor="career-select">Your Career Goal:</label>
          <select id="career-select" className="career-interest-select" value={careerInterest} onChange={(e) => setCareerInterest(e.target.value)}>
            {careerPaths.map(path => <option key={path} value={path}>{path}</option>)}
          </select>
        </div>

        <div className="profile-section">
          <h3>Recommended For You</h3>
          <div className="scrollable-list">
            <AnimatePresence>
              {recommendations.length > 0
                ? recommendations.map((rec, index) => (
                    <motion.div key={`${rec.skill}-${index}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} layout>
                      <RecommendationItem rec={rec} />
                    </motion.div>
                  ))
                : <p>No recommendations available. Add more skills!</p>}
            </AnimatePresence>
          </div>
        </div>

        <div className="profile-section">
          <h3>Your Skills</h3>
          <div className="scrollable-list">
            <AnimatePresence>
              {skills.length > 0
                ? skills.map((skill, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} layout className="skill-item">
                      <div className="skill-item-name-group">
                        <span className="skill-name">{skill.skillName}</span>
                      </div>
                      <span className="skill-proficiency">{skill.proficiency}</span>
                      <motion.button onClick={() => handleDeleteSkill(index)} className="delete-skill-button">&#x2715;</motion.button>
                    </motion.div>
                  ))
                : <p>Your skill list is empty.</p>}
            </AnimatePresence>
          </div>
        </div>

        <div className="profile-actions">
          <AnimatePresence>
            {isAddFormVisible && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div className="add-skill-form">
                  <input type="text" placeholder="New Skill Name" value={newSkill.skillName} onChange={e => setNewSkill({ ...newSkill, skillName: e.target.value })} className="form-input" />
                  <select value={newSkill.proficiency} onChange={e => setNewSkill({ ...newSkill, proficiency: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleAddSkill} className="add-skill-button">Add</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="action-buttons-container">
            <motion.button onClick={() => setAddFormVisible(!isAddFormVisible)} className="add-skill-toggle-button">
              {isAddFormVisible ? 'Close Form' : 'Add New Skill'}
            </motion.button>
            <motion.button onClick={handleSaveSkills} className="save-profile-button">Save Profile</motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>{isBotVisible && <MentorBot closeBot={() => setIsBotVisible(false)} />}</AnimatePresence>

      <motion.button className="mentor-bot-fab" onClick={() => setIsBotVisible(!isBotVisible)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Toggle AI Mentor Bot">
        🤖
      </motion.button>
    </>
  );
};

export default SkillProfile;
