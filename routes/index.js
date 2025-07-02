// routes/index.js
const express = require('express');
const router = express.Router();
const Article = require('../models/adb');

router.get('/', async (req, res) => {
  try {
    // Retrieve the latest posts for each category (limit to 4)
    const activityPosts = await Article.find({ category: 'Activity' })
      .sort({ createdAt: -1 })
      .limit(4);
    const aboutPosts = await Article.find({ category: 'About' })
      .sort({ createdAt: -1 })
      .limit(4);
    const academicsPosts = await Article.find({ category: 'Academics' })
      .sort({ createdAt: -1 })
      .limit(4);
    const autismPosts = await Article.find({ category: 'Autism' })
      .sort({ createdAt: -1 })
      .limit(4);
    
    res.render('index', { 
      title: 'Home Page', 
      activityPosts,
      aboutPosts,
      academicsPosts,
      autismPosts,
      user: req.user
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.render('index', { 
      title: 'Home Page', 
      activityPosts: [],
      aboutPosts: [],
      academicsPosts: [],
      autismPosts: [],
      user: req.user 
    });
  }
});

module.exports = router;