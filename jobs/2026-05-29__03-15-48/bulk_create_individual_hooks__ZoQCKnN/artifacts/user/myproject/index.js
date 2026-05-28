const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING
  }
}, {
  hooks: {
    beforeCreate: (user, options) => {
      if (user.password) {
        user.password = crypto.createHash('sha256').update(user.password).digest('hex');
      }
      if (user.username) {
        user.slug = user.username.toLowerCase().replace(/\s+/g, '-');
      }
    }
  }
});

const Article = sequelize.define('Article', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

User.hasMany(Article, { as: 'articles', foreignKey: 'userId' });
Article.belongsTo(User, { foreignKey: 'userId' });

app.post('/users/bulk', async (req, res) => {
  try {
    const users = req.body;
    const createdUsers = await User.bulkCreate(users, { individualHooks: true });
    res.status(201).json(createdUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const article = await Article.create({
      title,
      content,
      userId: id
    });
    
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Article,
        as: 'articles'
      }]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
