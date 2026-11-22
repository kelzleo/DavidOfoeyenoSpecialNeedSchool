// routes/index.js
const express = require('express');
const router = express.Router();
const Article = require('../models/adb');
const categories = require('../config/categories');

router.get('/', async (req, res) => {
  let sections;
  try {
    // Latest 3 posts for each section
    sections = await Promise.all(
      categories.map(async (cfg) => ({
        cfg,
        posts: await Article.find({ category: cfg.category }).sort({ createdAt: -1 }).limit(3),
      }))
    );
  } catch (err) {
    console.error('Error fetching posts:', err);
    sections = categories.map((cfg) => ({ cfg, posts: [] }));
  }

  res.render('index', {
    title: 'David Ofoeyeno Special School | Autism & Special Needs School in Warri, Delta State',
    description: 'Comrade David Ofoeyeno Special School in Warri, Delta State, provides specialised education and care for children with autism and neurological disorders.',
    active: 'home',
    sections,
    user: req.user,
  });
});

module.exports = router;
