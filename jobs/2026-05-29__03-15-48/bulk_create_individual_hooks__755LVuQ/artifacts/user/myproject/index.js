const crypto = require('crypto');
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  hooks: {
    beforeCreate: (user) => {
      // Hash password using SHA-256
      user.password = crypto.createHash('sha256').update(user.password).digest('hex');
      // Generate slug from username: lowercase, spaces replaced with hyphens
      user.slug = user.username.toLowerCase().replace(/ /g, '-');
    },
  },
});

// Define Article model
const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

// Define association: User has many Articles, aliased as 'articles'
User.hasMany(Article, { as: 'articles', foreignKey: 'UserId' });
Article.belongsTo(User, { as: 'user', foreignKey: 'UserId' });

// Create Express app
const app = express();
app.use(express.json());

// POST /users/bulk - Bulk create users with hooks enabled
app.post('/users/bulk', async (req, res) => {
  try {
    const users = req.body;
    const createdUsers = await User.bulkCreate(users, { individualHooks: true });
    res.status(201).json(createdUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /users/:id/articles - Create an article for a specific user
app.post('/users/:id/articles', async (req, res) => {
  try {
    const userId = req.params.id;
    const { title, content } = req.body;
    const article = await Article.create({ title, content, UserId: userId });
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /users - Fetch all users with their associated articles
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Article, as: 'articles' }],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync database and start server
const PORT = 3000;
sequelize.sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to sync database:', error);
  });