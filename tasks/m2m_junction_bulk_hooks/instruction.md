# Many-to-Many Bulk Hooks with Sequelize

## Background
In Sequelize, when using the `add` or `remove` mixin methods for `belongsToMany` relationships (Many-to-Many), the records are added to or removed from the junction table. Sequelize triggers `beforeBulkCreate` (or `beforeBulkDestroy`) hooks on the junction model during these bulk operations.

## Requirements
- Create a Many-to-Many association between `User` and `Role` models using a custom junction model `UserRole`.
- The `UserRole` junction model must have a `beforeBulkCreate` hook that appends the text `Triggered beforeBulkCreate` to a file named `hooks.log`.
- The `UserRole` junction model must have a `beforeBulkDestroy` hook that appends the text `Triggered beforeBulkDestroy` to the same `hooks.log` file.
- Implement a script (`run.js`) that:
  1. Syncs the database.
  2. Creates a user and two roles.
  3. Uses the `addRoles` mixin method to assign both roles to the user.
  4. Uses the `removeRole` mixin method to remove one role from the user.
  5. Prints `Operations completed` to stdout when finished.

## Implementation Hints
- Define three models: `User`, `Role`, and `UserRole`.
- Set up the Many-to-Many association using `User.belongsToMany(Role, { through: UserRole })` and `Role.belongsToMany(User, { through: UserRole })`.
- Add the `beforeBulkCreate` and `beforeBulkDestroy` hooks to the `UserRole` model.
- Write the log entries by appending to `hooks.log` using Node's `fs` module.
- Use SQLite as the database, storing it in `database.sqlite`.

## Acceptance Criteria
- Project path: /home/user/myproject
- Command: node run.js
- The command takes no arguments.
- The stdout should print: `Operations completed`
- The script must create a SQLite database file at `/home/user/myproject/database.sqlite`.
- The script must write to a log file at `/home/user/myproject/hooks.log` inside the hooks.
- The `hooks.log` file must contain the exact lines `Triggered beforeBulkCreate` and `Triggered beforeBulkDestroy`.

