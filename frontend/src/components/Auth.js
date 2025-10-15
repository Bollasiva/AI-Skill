import React, { useState } from 'react';
import { login, register } from '../api/apiService';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register(formData);
      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Authentication error:', error.response?.data || error.message);
      alert(error.response?.data?.msg || 'An error occurred.');
    }
  };

  return (
    <motion.div
      className="glass-card auth-card"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="absolute top-0 left-0 w-56 h-56 bg-purple-600 rounded-full blob -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-56 h-56 bg-blue-600 rounded-full blob translate-x-1/2 translate-y-1/2"></div>
      
      <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-input-group">
            <FiUser className="input-icon" />
            <motion.input initial={{ opacity:0 }} animate={{ opacity:1 }} type="text" name="name" placeholder="Name" onChange={handleChange} required className="form-input"/>
          </div>
        )}
        <div className="form-input-group">
          <FiMail className="input-icon" />
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="form-input"/>
        </div>
        <div className="form-input-group">
          <FiLock className="input-icon" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="form-input"/>
        </div>
        
        <motion.button whileHover={{ scale: 1.05, y: -3, boxShadow: "0 8px 25px rgba(168, 85, 247, 0.6)" }} whileTap={{ scale: 0.95 }} type="submit" className="form-button">
          {isLogin ? 'Login' : 'Register'}
        </motion.button>
      </form>
      
      <p className="toggle-auth-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth-button">
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </motion.div>
  );
};
export default Auth;