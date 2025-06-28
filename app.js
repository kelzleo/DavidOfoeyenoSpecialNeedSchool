// app.js
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/adb');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('./config/passport-setup');
const flash = require('connect-flash');

const app = express();

// Express Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => {
  console.log('MongoDB connected');
  app.locals.bucketName = process.env.GOOGLE_CLOUD_BUCKET; // Make bucket name available to templates
  mountRoutesAndStartServer();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

function mountRoutesAndStartServer() {
  // Category routes
  app.get('/activity', async (req, res) => {
    try {
      const activityPosts = await Article.find({ category: 'Activity' }).sort({ createdAt: 'desc' });
      res.render('activity/activity', { title: 'Activity', posts: activityPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching activity posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/about', async (req, res) => {
    try {
      const aboutPosts = await Article.find({ category: 'About' }).sort({ createdAt: 'desc' });
      res.render('about/about', { title: 'About', posts: aboutPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching about posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/staffs', async (req, res) => {
    try {
      const staffsPosts = await Article.find({ category: 'Staffs' }).sort({ createdAt: 'desc' });
      res.render('staffs/staffs', { title: 'Staffs', posts: staffsPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching staffs posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/autism', async (req, res) => {
    try {
      const autismPosts = await Article.find({ category: 'Autism' }).sort({ createdAt: 'desc' });
      res.render('autism/autism', { title: 'Autism', posts: autismPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching autism posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.get('/academics', async (req, res) => {
    try {
      const academicsPosts = await Article.find({ category: 'Academics' }).sort({ createdAt: 'desc' });
      res.render('academics/academics', { title: 'Academics', posts: academicsPosts, user: req.user });
    } catch (error) {
      console.error('Error fetching academics posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/category/:category', async (req, res) => {
    try {
      const posts = await Article.find({ category: req.params.category }).sort({ createdAt: 'desc' });
      res.render('category', { title: req.params.category, posts: posts, user: req.user });
    } catch (error) {
      console.error('Error fetching category posts:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Mount route files
  const activityRoutes = require('./routes/activity');
  const aboutRoutes = require('./routes/about');
  const staffsRoutes = require('./routes/staffs');
  const autismRoutes = require('./routes/autism');
  const academicsRoutes = require('./routes/academics');
  const authRoutes = require('./routes/auth');
  const indexRoutes = require('./routes/index');
  
  app.use('/activity', activityRoutes);
  app.use('/about', aboutRoutes);
  app.use('/staffs', staffsRoutes);
  app.use('/autism', autismRoutes);
  app.use('/academics', academicsRoutes);
  app.use('/', indexRoutes);
  app.use(authRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}