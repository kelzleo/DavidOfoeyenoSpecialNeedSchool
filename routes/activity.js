// routes/activity.js
const express = require('express');
const Article = require('../models/adb');
const router = express.Router();
const multer = require('multer');
const { uploadFile, deleteFile } = require('../utils/cloudstorage');
const { isAdmin } = require('../config/auth');

// Configure Multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get('/', async (req, res) => {
  try {
    const posts = await Article.find({ category: 'Activity' }).sort({ createdAt: 'desc' });
    res.render('activity/activity', { title: 'Activity', posts, user: req.user });
  } catch (error) {
    console.error('Error fetching activity posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/new', isAdmin, (req, res) => {
  res.render('activity/new', { 
    title: 'New Activity Post', 
    article: new Article(), 
    user: req.user 
  });
});

router.post('/', isAdmin, upload.single('image'), async (req, res) => {
  try {
    let imageFileName = null;
    if (req.file) {
      imageFileName = await uploadFile(req.file);
    }

    const article = new Article({
      title: req.body.title,
      description: req.body.description,
      markdown: req.body.markdown,
      category: 'Activity',
      imagePath: imageFileName,
    });

    await article.save();
    res.redirect(`/activity/${article.slug}`);
  } catch (error) {
    console.error('Error creating activity post:', error);
    res.render('activity/new', { 
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
    res.render('activity/show', { article, user: req.user });
  } catch (error) {
    console.error('Error fetching activity post:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/edit/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render('activity/edit', { article, user: req.user });
  } catch (error) {
    console.error('Error fetching activity post for editing:', error);
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
      if (article.imagePath) {
        await deleteFile(article.imagePath);
      }
      const newImageFileName = await uploadFile(req.file);
      article.imagePath = newImageFileName;
    }

    await article.save();
    res.redirect(`/activity/${article.slug}`);
  } catch (error) {
    console.error('Error updating activity post:', error);
    res.render('activity/edit', { 
      article: req.body, 
      user: req.user,
      error: 'Error updating post'
    });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (article.imagePath) {
      await deleteFile(article.imagePath);
    }
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/activity');
  } catch (error) {
    console.error('Error deleting activity post:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;