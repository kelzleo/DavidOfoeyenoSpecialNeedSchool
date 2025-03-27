// routes/index.js
const express = require('express');
const router = express.Router();
const Article = require('../models/adb');

router.get('/', async (req, res) => {
  try {
    // Retrieve the latest posts for each category (limit to 3, for example)
    const activityPosts = await Article.find({ category: 'Activity' })
      .sort({ createdAt: -1 })
      .limit(4);
      const aboutPosts = await Article.find({ category: 'About' })
      .sort({ createdAt: -1 })
      .limit(4);
      const academicsPosts = await Article.find({ category: 'Academics' })
      .sort({ createdAt: -1 })
      .limit(4);
    
    res.render('index', { 
      title: 'Home Page', 
      activityPosts,
      aboutPosts,
      academicsPosts,
     
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.render('index', { 
      title: 'Home Page', 
      activityPosts: [],
      aboutPosts: [],
      academicsPosts: [],
      
      user: req.user 
    });
  }
});

module.exports = router;
