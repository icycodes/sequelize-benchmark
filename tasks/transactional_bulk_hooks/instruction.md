# Sequelize Transactional Bulk Hooks

## Background
You need to perform bulk operations using Sequelize while ensuring that model lifecycle hooks are triggered and all operations are safely wrapped within a single transaction. By default, Sequelize does not trigger individual hooks on bulk operations for performance reasons, and transactions must be explicitly passed to hooks if internal operations are performed.

## Requirements
- Create a Node.js script that connects to a SQLite database.
- Define a `User` model with `username` (STRING), `password` (STRING), and `status` (STRING, default 'pending').
- Add a `beforeCreate` hook that modifies the password by appending `-hashed` to it.
- Add a `beforeUpdate` hook that modifies the status by appending `-updated` to it.
- The script must accept a JSON string of users as a command-line argument.
- The script must use a managed transaction to:
  1. Insert the users using `bulkCreate`, ensuring the `beforeCreate` hook is fired for each user.
  2. Update all users to have the status `active` using `update`, ensuring the `beforeUpdate` hook is fired for each user.
- The script must print `Transaction complete.` upon success.

## Implementation Hints
- Use `sequelize.transaction()` to manage the transaction.
- Pass `{ individualHooks: true }` to `bulkCreate` and `update` to ensure the hooks are fired.
- Make sure the transaction object is passed to all operations.
- Use `sequelize.sync({ force: true })` before running the transaction to ensure the table exists and is clean.

## Acceptance Criteria
- Project path: /home/user/myproject
- Command: `node process.js <users_json>`
- The command input argument format: `<users_json>` is a JSON string containing an array of user objects, e.g., `[{"username": "alice", "password": "p1"}]`.
- The expected command output format: The stdout should print: `Transaction complete.`
- The script must create a SQLite database at `/home/user/myproject/database.sqlite`.
- The final state in the database for the inserted users must reflect both hooks: passwords must end with `-hashed` and statuses must be `active-updated`.

