const express = require('express');
const Article = require('../models/adb');
const router = express.Router();
const multer = require('multer');
const storage = require('../config/upload');
const upload = multer({ storage });
const { isAdmin } = require('../config/auth');
const mongoose = require('mongoose');

// Routes
router.get('/', async (req, res) => {
  try {
    const posts = await Article.find({ category: 'Academics' }).sort({ createdAt: 'desc' });
    res.render('academics/index', { posts, user: req.user });
  } catch (error) {
    console.error('Error fetching academics posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/new', isAdmin, (req, res) => {
  res.render('academics/new', { 
    title: 'New Academics/News Post', 
    article: new Article(), 
    user: req.user 
  });
});

router.post('/', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const article = new Article({
      title: req.body.title,
      description: req.body.description,
      markdown: req.body.markdown,
      category: 'Academics',
      imagePath: req.file ? req.file.filename : null
    });

    await article.save();
    res.redirect(`/academics/${article.slug}`);
  } catch (error) {
    console.error('Error creating academics post:', error);
    res.render('academics/new', { 
      article: req.body, 
      user: req.user,
      error: 'Error creating post'
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).send('Post not found');
    res.render('academics/show', { article, user: req.user });
  } catch (error) {
    console.error('Error fetching academics post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/edit/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('academics/edit', { article, user: req.user });
  } catch (error) {
    console.error('Error fetching academics post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    article.title = req.body.title;
    article.description = req.body.description;
    article.markdown = req.body.markdown;
    
    if (req.file) {
      // Delete old image if exists
      if (article.imagePath) {
        const gfs = req.app.locals.gfs;
        try {
          const files = await gfs.files.deleteOne({ filename: article.imagePath });
          console.log('Old file deleted:', files);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      article.imagePath = req.file.filename;
    }

    await article.save();
    res.redirect(`/academics/${article.slug}`);
  } catch (error) {
    console.error('Error updating academics post:', error);
    res.render('academics/edit', { 
      article: req.body, 
      user: req.user,
      error: 'Error academics post'
    });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (article.imagePath) {
      const gfs = req.app.locals.gfs;
      await gfs.files.deleteOne({ filename: article.imagePath });
    }
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/academics');
  } catch (error) {
    console.error('Error deleting academics post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/image/:filename', async (req, res) => {
  try {
    const gfs = req.app.locals.gfs;
    const file = await gfs.files.findOne({ filename: req.params.filename });
    
    if (!file || file.length === 0) {
      return res.status(404).send('File not found');
    }

    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).send('Error retrieving image');
  }
});

module.exports = router;