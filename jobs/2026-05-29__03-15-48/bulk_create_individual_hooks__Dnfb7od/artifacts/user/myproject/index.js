const express = require("express");
const crypto = require("crypto");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  logging: false,
});

const User = sequelize.define(
  "User",
  {
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
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.password = crypto
          .createHash("sha256")
          .update(user.password)
          .digest("hex");
        user.slug = user.username.toLowerCase().replace(/\s+/g, "-");
      },
    },
  }
);

const Article = sequelize.define("Article", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

User.hasMany(Article, { as: "articles", foreignKey: "userId" });
Article.belongsTo(User, { foreignKey: "userId" });

app.post("/users/bulk", async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be an array." });
    }

    const users = await User.bulkCreate(req.body, {
      individualHooks: true,
      returning: true,
    });

    return res.status(201).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/users/:id/articles", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { title, content } = req.body;
    const article = await Article.create({
      title,
      content,
      userId: user.id,
    });

    return res.status(201).json(article);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Article, as: "articles" }],
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const start = async () => {
  try {
    await sequelize.sync();
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
