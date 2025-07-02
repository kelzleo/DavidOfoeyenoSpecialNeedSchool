// routes/academics.js
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
    const posts = await Article.find({ category: 'Academics' }).sort({ createdAt: 'desc' });
    res.render('academics/academics', { title: 'Academics', posts, user: req.user });
  } catch (error) {
    console.error('Error fetching academics posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/new', isAdmin, (req, res) => {
  res.render('academics/new', { 
    title: 'New Academics Post', 
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
      category: 'Academics',
      imagePath: imageFileName,
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
    console.error('Error fetching academics post for editing:', error);
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
    res.redirect(`/academics/${article.slug}`);
  } catch (error) {
    console.error('Error updating academics post:', error);
    res.render('academics/edit', { 
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
    res.redirect('/academics');
  } catch (error) {
    console.error('Error deleting academics post:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;