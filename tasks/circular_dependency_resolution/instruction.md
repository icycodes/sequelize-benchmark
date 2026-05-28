# Resolve Circular Dependency in Sequelize

## Background
When two models reference each other in Sequelize, `sequelize.sync()` can fail with a "Cyclic dependency found" error. This task requires setting up two models that reference each other and successfully syncing them to the database.

## Requirements
- Create a Node.js project using Sequelize and SQLite.
- Define a `User` model and an `Account` model.
- Establish a One-to-One relationship where `User` belongs to `Account` (foreign key `primaryAccountId`) and `Account` belongs to `User` (foreign key `primaryUserId`).
- Resolve the circular dependency issue so that `sequelize.sync()` completes successfully.
- Create a `User` and an `Account`, and link them to each other.

## Implementation Hints
- To resolve the circular dependency during `sync()`, you can use the `constraints: false` option on one of the associations to break the loop.
- You will need to create the records in multiple steps (e.g., create User, create Account, update User) to satisfy the foreign keys if constraints are active, or just use the generated setter methods.

## Acceptance Criteria
- Project path: /home/user/project
- Command: node index.js
- Input format: None.
- The expected command output format: The stdout should print: `Success: User and Account created and linked.`

