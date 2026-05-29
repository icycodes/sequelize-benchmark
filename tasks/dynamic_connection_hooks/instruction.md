# Sequelize Dynamic Connection Hooks

## Background
Sequelize provides connection hooks (`beforeConnect`, `afterConnect`, etc.) that are executed immediately before and after a database connection is obtained. These hooks are useful for asynchronously obtaining database credentials (e.g., from a rotating token store) and mutating the configuration object before the connection is established.

## Requirements
- Create a Node.js script that initializes a Sequelize instance using the SQLite dialect.
- Implement a `beforeConnect` hook on the Sequelize instance.
- In the `beforeConnect` hook, asynchronously read the database password from a local file named `token.txt` and assign it to the `config.password` property.
- Define a `User` model with a `username` string field.
- Synchronize the model and insert a new user with the username `alice`.
- Print a confirmation message to stdout containing the dynamically loaded password.

## Implementation Hints
- Use `sequelize.beforeConnect(async (config) => { ... })` to define the hook.
- Use Node.js `fs.promises.readFile` to asynchronously read the contents of `token.txt` inside the hook.
- Although SQLite does not strictly require a password, mutating `config.password` demonstrates the pattern used for other dialects (like Postgres or MySQL).
- Ensure the database is synchronized (e.g., using `await sequelize.sync()`) before creating the user.

## Acceptance Criteria
- Project path: /home/user/myproject
- Command: node index.js
- The script must read the password from `token.txt` and use it in the connection hook.
- The stdout should print: `Connected with password: <password>` where `<password>` is the exact string read from `token.txt`.
- The script must create a SQLite database file at `/home/user/myproject/database.sqlite`.
- The database must contain a `Users` (or `users`) table with at least one record where `username` is `alice`.

