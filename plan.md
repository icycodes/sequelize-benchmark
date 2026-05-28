# Sequelize Research Plan

## 1. Library Overview

**Description:**
Sequelize is a modern, promise-based Node.js ORM (Object-Relational Mapper) that supports PostgreSQL, MySQL, MariaDB, SQLite, Microsoft SQL Server, and Oracle. It features solid transaction support, relations, eager and lazy loading, read replication, and more.

**Ecosystem Role:**
Sequelize serves as the data access and persistence layer in Node.js applications. It is extremely popular in Express.js backends and is officially supported in the NestJS ecosystem via `@nestjs/sequelize`.

**Project Setup (SQLite):**
```bash
# Install Sequelize and the SQLite driver
npm install sequelize sqlite3
```

Basic Initialization:
```javascript
const { Sequelize } = require('sequelize');

// Initialize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Path to SQLite file
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
```

## 2. Core Primitives & APIs

*   **Sequelize Instance**: Represents the connection to the database.
    *   *Docs*: [Getting Started](https://sequelize.org/docs/v6/getting-started/)
    *   *Usage*: `new Sequelize({ dialect: 'sqlite', storage: 'path/to/db.sqlite' })`
*   **Models**: Classes that represent tables in the database.
    *   *Docs*: [Model Basics](https://sequelize.org/docs/v6/core-concepts/model-basics/)
    *   *Usage*:
        ```javascript
        const { Model, DataTypes } = require('sequelize');
        class User extends Model {}
        User.init({
          username: { type: DataTypes.STRING, allowNull: false },
          birthday: { type: DataTypes.DATE }
        }, { sequelize, modelName: 'user' });
        ```
*   **Querying (CRUD)**: Methods to create, read, update, and delete records.
    *   *Docs*: [Model Querying](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/)
    *   *Usage*:
        ```javascript
        // Create
        const user = await User.create({ username: 'jane' });
        // Read
        const users = await User.findAll({ where: { username: 'jane' } });
        ```
*   **Validation and Constraints**: Built-in and custom rules applied before saving to the database.
    *   *Docs*: [Validations & Constraints](https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/)
    *   *Usage*:
        ```javascript
        age: {
          type: DataTypes.INTEGER,
          validate: { min: 18, isInt: true }
        }
        ```
*   **Associations**: Defining relationships (One-to-One, One-to-Many, Many-to-Many).
    *   *Docs*: [Associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
    *   *Usage*:
        ```javascript
        User.hasMany(Post, { as: 'articles' });
        Post.belongsTo(User);
        // Eager loading
        const users = await User.findAll({ include: 'articles' });
        ```
*   **Hooks**: Lifecycle events (e.g., `beforeValidate`, `afterCreate`) triggered during model operations.
    *   *Docs*: [Hooks](https://sequelize.org/docs/v6/other-topics/hooks/)
    *   *Usage*:
        ```javascript
        User.beforeCreate(async (user, options) => {
          user.password = await hashPassword(user.password);
        });
        ```
*   **Migrations**: Version control for database schemas using the Sequelize CLI.
    *   *Docs*: [Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)

## 3. Real-World Use Cases & Templates

*   **Express + Sequelize Boilerplates**: Repositories like [binitghetiya/express-sequelize-api-boilerplate](https://github.com/binitghetiya/express-sequelize-api-boilerplate) demonstrate standard MVC architecture, JWT authentication, and CLI-based migrations.
*   **NestJS Integration**: The official `@nestjs/sequelize` package (and templates like [kentloog/nestjs-sequelize-typescript](https://github.com/kentloog/nestjs-sequelize-typescript)) showcases how Sequelize models can be injected as providers in a dependency-injection framework.

## 4. Developer Friction Points

*   **`sync({ force: true })` vs. Migrations in Production**: Developers often use `sequelize.sync()` during development but struggle when transitioning to production. Using `sync({ force: true })` is highly dangerous as it drops tables, and developers frequently debate the best practices for structuring migrations vs. syncing.
    *   *Issue*: [Sequelize.sync({ force: true }) is too dangerous to live. #2670](https://github.com/sequelize/sequelize/issues/2670)
    *   *Issue*: [Best Practice: DB Sync + Migrations? Or just Migrations? #4160](https://github.com/sequelize/sequelize/issues/4160)
*   **"Include unexpected" Error with Aliases**: When querying associated models using the `include` option, passing a string alias (e.g., `include: ['alias']`) throws a confusing "Include unexpected" error if `{ as: 'alias' }` was not explicitly defined in the association mapping, confusing many developers.
    *   *Issue*: ["Include unexpected" error with string include #10613](https://github.com/sequelize/sequelize/issues/10613)
    *   *Issue*: [Error: Include unexpected. Element has to be either a Model, an Association or an object #11685](https://github.com/sequelize/sequelize/issues/11685)
*   **Hooks Not Firing on Bulk Operations**: By default, model lifecycle hooks (like `beforeUpdate` or `afterCreate`) do not execute during bulk operations (e.g., `Model.bulkCreate()` or `Model.update()` with a `where` clause) for performance reasons. Developers expect them to fire and must explicitly pass `{ individualHooks: true }`, which is a common source of unexpected data states.
    *   *Issue*: [afterBulkCreate hook unexpectedly firing on relationship model #6300](https://github.com/sequelize/sequelize/issues/6300)
    *   *Issue*: [bulkCreate fails when validate and individualHooks options are set #2934](https://github.com/sequelize/sequelize/issues/2934)

## 5. Evaluation Ideas

*   Implement a complex Many-to-Many association with a custom junction table.
*   Write a query that uses nested `include` statements with filtered `where` conditions on the child models.
*   Create a custom model validation that checks for overlapping date ranges in the database before saving.
*   Implement a `beforeCreate` hook that automatically generates and assigns a slug based on a title field.
*   Write a migration script using `sequelize-cli` to add a new column, backfill data, and add a foreign key constraint.
*   Configure a `bulkCreate` operation that successfully triggers individual model hooks for password hashing.

## 6. Sources

1.  [Sequelize Official Documentation (v6)](https://sequelize.org/docs/v6/) - Core concepts, getting started, and APIs.
2.  [NestJS Sequelize Documentation](https://docs.nestjs.com/techniques/database) - Integration patterns with NestJS.
3.  [GitHub Issue #2670](https://github.com/sequelize/sequelize/issues/2670) - Discussion on the dangers of `sync()`.
4.  [GitHub Issue #4160](https://github.com/sequelize/sequelize/issues/4160) - Discussion on Sync vs Migrations best practices.
5.  [GitHub Issue #10613](https://github.com/sequelize/sequelize/issues/10613) - Bug report regarding string includes and aliases.
6.  [GitHub Issue #11685](https://github.com/sequelize/sequelize/issues/11685) - "Include unexpected" error context.
7.  [GitHub Issue #6300](https://github.com/sequelize/sequelize/issues/6300) - Discussion on bulk operation hooks.
8.  [GitHub Issue #2934](https://github.com/sequelize/sequelize/issues/2934) - Context on `individualHooks` usage.

## Suggestions for Generating Tasks

**NOTE**: Please use SQLite as the dialect for development and testing. It is simple to seed test data and verify results.
