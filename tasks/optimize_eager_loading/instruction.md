# Optimize Eager Loading in Sequelize

## Background
In Sequelize, using deep eager loading (`include`) with limits on `hasMany` associations often leads to incorrect results (limiting the total rows instead of rows per parent) or massive inefficient JOINs. You need to implement an endpoint that requires fetching a parent, a limited number of children, and a limited number of grandchildren per child, using manual batch queries to ensure correctness and performance.

## Requirements
- Set up an Express.js application with Sequelize and SQLite.
- Define three models: `Author`, `Article`, and `Comment`.
- Associations: `Author` hasMany `Article`, `Article` belongsTo `Author`. `Article` hasMany `Comment`, `Comment` belongsTo `Article`.
- Implement a REST API endpoint `GET /authors/:id/summary`.
- The endpoint must return the author's details, their 5 most recently created articles, and for each of those articles, exactly the 3 most recently created comments.
- You must assemble the response correctly. Standard Sequelize `include` with limits on nested `hasMany` associations will not work correctly out of the box for "N per parent" limits. You should use separate queries (e.g., fetch author, fetch articles, fetch comments using `[Op.in]`, and group them in memory) to achieve this efficiently.
- Your application must automatically sync the database schema on startup.

## Implementation Hints
- Initialize Sequelize with SQLite, using the database file `db.sqlite` in the project root.
- Define the models with appropriate attributes (e.g., `name` for Author, `title` and `content` for Article, `text` for Comment).
- For the endpoint, query the `Author` by ID.
- Query the top 5 `Article`s for that author ordered by `createdAt` DESC.
- Extract the article IDs and perform a single batch query to fetch the relevant `Comment`s, or use a creative approach to get the top 3 comments per article.
- Assemble the nested JSON structure in memory before sending the response.

## Acceptance Criteria
- Project path: /home/user/app
- Start command: node index.js
- Port: 3000
- Database file: /home/user/app/db.sqlite
- API Endpoints:
  - GET `/authors/:id/summary`: Returns status 200 and a JSON object.

    ```json
    // Response Format
    {
      "id": number,
      "name": string,
      "articles": [
        {
          "id": number,
          "title": string,
          "comments": [
            {
              "id": number,
              "text": string
            }
          ]
        }
      ]
    }
    ```
- The returned articles MUST be limited to at most 5, ordered by `createdAt` DESC.
- The returned comments for each article MUST be limited to at most 3, ordered by `createdAt` DESC.
- Error handling: Return 404 if the author does not exist.

