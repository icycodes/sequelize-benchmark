# Sequelize Transaction Rollback on Hook Failure

## Background
When performing bulk operations in Sequelize, individual model hooks (like `beforeCreate`) do not fire by default. If you enable `individualHooks: true` and execute the bulk operation within a transaction, an error thrown by any individual hook should cause the entire transaction to roll back, preventing partial inserts.

## Requirements
- Initialize a Sequelize instance using SQLite.
- Define a `User` model with a `username` (String) field.
- Add a `beforeCreate` hook to the `User` model that throws an Error if the `username` is exactly `"admin"`.
- Write a script that first synchronizes the database (e.g., using `sync({ force: true })`).
- Then, within a managed transaction, attempt to `bulkCreate` an array of three users: `[{username: 'user1'}, {username: 'admin'}, {username: 'user2'}]`.
- You must explicitly enable individual hooks for the bulk operation so the hook fires.
- Catch the expected error from the hook.
- Query the database for the total number of users and print it to stdout.

## Implementation Hints
- Use `new Sequelize({ dialect: 'sqlite', storage: './database.sqlite' })` to initialize the connection.
- Use `sequelize.transaction(async (t) => { ... })` for a managed transaction.
- Pass both `{ transaction: t, individualHooks: true }` to the `bulkCreate` call.
- Wrap the transaction block in a try/catch to handle the hook error gracefully.
- After the try/catch block, use `User.count()` to get the final number of records in the table.

## Acceptance Criteria
- Project path: /home/user/myproject
- Command: `node index.js`
- The stdout should print the final user count in the format: `User count: <count>`
- The database should contain no users because the transaction rolled back upon the hook error.

