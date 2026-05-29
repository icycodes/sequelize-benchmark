# Sequelize Bulk Update with Individual Hooks

## Background
In Sequelize, bulk operations like `Model.update()` with a `where` clause do not trigger model lifecycle hooks by default for performance reasons. You need to write a script that performs a bulk update and ensures that a specific hook is fired for each record.

## Requirements
- Initialize a Sequelize instance with SQLite.
- Define a `User` model with `username` (STRING), `status` (STRING), and `lastActivatedAt` (DATE).
- Implement a `beforeUpdate` hook on the `User` model. If the `status` is being changed to 'active', the hook must set `lastActivatedAt` to the current date/time.
- Write a script that uses `User.update()` to change the `status` of all users currently in 'pending' status to 'active'.
- The script must ensure that the `beforeUpdate` hook is triggered for each user during this bulk update operation.

## Implementation Hints
- Define the Sequelize connection and the `User` model in your script.
- Look into the options available for `Model.update()` to enable individual hooks, as they are disabled by default for bulk operations.
- Ensure the database file is located at `./database.sqlite`.

## Acceptance Criteria
- Project path: /home/user/project
- Command: `node update_users.js`
- The command must execute without errors and print `Updated users successfully` to stdout.
- After the command runs, all users that previously had a 'pending' status must have an 'active' status.
- Crucially, the `lastActivatedAt` field for these updated users must be populated with a valid date/time (not null), proving the hook was fired.

