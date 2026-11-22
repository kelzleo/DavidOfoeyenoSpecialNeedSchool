// app.js
require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/passport-setup');
const categories = require('./config/categories');
const createCategoryRouter = require('./routes/category');

const app = express();

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  sessionSecret = crypto.randomBytes(32).toString('hex');
  console.warn('SESSION_SECRET is not set; using a temporary secret (sessions reset on restart).');
}

// Express middleware
app.set('view engine', 'ejs');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://storage.googleapis.com'],
      frameSrc: ['https://www.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null,
    },
  },
}));
app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public', {
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    // Keep CSS/JS fresh so design updates reach returning visitors quickly
    if (/\.(css|js)$/.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=3600');
  },
}));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.locals.categories = categories;
app.locals.siteUrl = process.env.SITE_URL || 'https://davidofoeyenospecialschool.com';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
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
  categories.forEach((cfg) => app.use(cfg.path, createCategoryRouter(cfg)));
  app.use('/', require('./routes/index'));
  app.use(require('./routes/auth'));

  app.use((req, res) => {
    res.status(404).render('404', { title: 'Page not found', user: req.user });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
