// routes/category.js
// Builds the list / show / create / edit / delete routes for one content section.
const express = require('express');
const multer = require('multer');
const Article = require('../models/adb');
const { uploadFile, deleteFile } = require('../utils/cloudstorage');
const { isAdmin } = require('../config/auth');

const upload = multer({ storage: multer.memoryStorage() });

module.exports = function createCategoryRouter(cfg) {
  const router = express.Router();
  const base = cfg.path;
  const label = cfg.category.toLowerCase();

  const renderForm = (res, req, article, error) =>
    res.render('category/form', {
      cfg,
      article,
      error,
      user: req.user,
      title: `${article && article.id ? 'Edit' : 'New'} ${cfg.category} post`,
      active: cfg.key,
    });

  router.get('/', async (req, res) => {
    try {
      const posts = await Article.find({ category: cfg.category }).sort({ sortOrder: 1, createdAt: -1 });
      res.render('category/list', {
        cfg,
        posts,
        user: req.user,
        title: cfg.metaTitle,
        description: cfg.description,
        active: cfg.key,
      });
    } catch (error) {
      console.error(`Error fetching ${label} posts:`, error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.get('/new', isAdmin, (req, res) => renderForm(res, req, {}));

  router.post('/', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const imagePath = req.file ? await uploadFile(req.file) : null;
      const article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        category: cfg.category,
        sortOrder: Number(req.body.sortOrder) || 0,
        imagePath,
      });
      await article.save();
      res.redirect(`${base}/${article.slug}`);
    } catch (error) {
      console.error(`Error creating ${label} post:`, error);
      renderForm(res, req, req.body, 'Error creating post');
    }
  });

  router.get('/edit/:id', isAdmin, async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).render('404', { title: 'Page not found', user: req.user });
      renderForm(res, req, article);
    } catch (error) {
      console.error(`Error fetching ${label} post for editing:`, error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.get('/:slug', async (req, res) => {
    try {
      const article = await Article.findOne({ slug: req.params.slug, category: cfg.category });
      if (!article) return res.status(404).render('404', { title: 'Page not found', user: req.user });
      res.render('category/show', {
        cfg,
        article,
        user: req.user,
        title: `${article.title} - David Ofoeyeno Special School`,
        description: article.description || cfg.description,
        active: cfg.key,
      });
    } catch (error) {
      console.error(`Error fetching ${label} post:`, error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) return res.status(404).render('404', { title: 'Page not found', user: req.user });

      article.title = req.body.title;
      article.description = req.body.description;
      article.markdown = req.body.markdown;
      article.sortOrder = Number(req.body.sortOrder) || 0;

      if (req.file) {
        if (article.imagePath) {
          await deleteFile(article.imagePath);
        }
        article.imagePath = await uploadFile(req.file);
      }

      await article.save();
      res.redirect(`${base}/${article.slug}`);
    } catch (error) {
      console.error(`Error updating ${label} post:`, error);
      renderForm(res, req, { ...req.body, id: req.params.id }, 'Error updating post');
    }
  });

  router.delete('/:id', isAdmin, async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (article) {
        if (article.imagePath) {
          await deleteFile(article.imagePath);
        }
        await Article.findByIdAndDelete(req.params.id);
      }
      res.redirect(base);
    } catch (error) {
      console.error(`Error deleting ${label} post:`, error);
      res.status(500).send('Internal Server Error');
    }
  });

  return router;
};
