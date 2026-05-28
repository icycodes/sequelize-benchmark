# Sequelize Bulk Operations and Associations API

## Background
You are building a backend service using Express.js, Sequelize, and SQLite. You need to implement bulk data insertion and eager loading of associations, addressing common Sequelize friction points such as hooks not firing on bulk operations and the "Include unexpected" error.

## Requirements
- Create two Sequelize models: `User` (`username`, `password`, `slug`) and `Article` (`title`, `content`).
- Define an association where a `User` has many `Article`s. You must alias this association as `articles`.
- Implement a `beforeCreate` hook on the `User` model that:
  1. Hashes the `password` using SHA-256 (use Node's built-in `crypto` module and output as a hex string).
  2. Generates a `slug` based on the `username` (convert to lowercase and replace any spaces with hyphens).
- Implement an Express REST API with the following endpoints:
  - `POST /users/bulk`: Accepts an array of user objects. Uses Sequelize's `bulkCreate` to insert them. You must ensure the `beforeCreate` hook is triggered for each record.
  - `POST /users/:id/articles`: Creates a new article associated with the specified user ID.
  - `GET /users`: Fetches all users and eagerly loads their associated articles. You must query this correctly to avoid the Sequelize "Include unexpected" error.
- Store data in a SQLite database file named `database.sqlite`.

## Implementation Hints
- Use Express routing and middleware to parse JSON requests.
- Initialize Sequelize with the `sqlite` dialect and sync the models on server startup.
- Remember that `bulkCreate` does not run individual model hooks by default; you must configure it via options.
- When querying with `include`, if an alias (`as`) was defined in the association, you must provide the exact same alias or the model with the alias in the `include` array to avoid errors.
- Use `crypto.createHash('sha256').update(text).digest('hex')` for hashing.

## Acceptance Criteria
- Project path: /home/user/myproject
- Start command: node index.js
- Port: 3000
- API Endpoints:
  - `POST /users/bulk`: Accepts a JSON array of users `[{"username": "string", "password": "string"}]` and returns `201 Created` with the created user objects (must include `id`, `username`, `password` (hashed), and `slug`).
  - `POST /users/:id/articles`: Accepts a JSON object `{"title": "string", "content": "string"}` and returns `201 Created` with the created article object.
  - `GET /users`: Returns `200 OK` with a JSON array of all users. Each user object must contain an `articles` property which is an array of their associated articles.

