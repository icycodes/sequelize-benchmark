# Sequelize Optimistic Locking Error Handling

## Background
Optimistic locking is a concurrency control method that uses a version number to prevent conflicting updates. Sequelize supports this via the `version: true` option on a model. When a stale instance is saved, Sequelize throws an `OptimisticLockError`.

## Requirements
- Create a Node.js script that uses Sequelize with SQLite to demonstrate optimistic locking and conflict resolution.
- Define a `Wallet` model with a `balance` (INTEGER) field and enable optimistic locking.
- The script should accept three integer arguments: `<initial_balance>`, `<amount1>`, and `<amount2>`.
- It should sync the database and create a new `Wallet` with the `<initial_balance>`.
- It must then simulate a concurrent update:
  - Fetch the wallet instance (`wallet1`).
  - Fetch the wallet instance again (`wallet2`).
  - Increase `wallet1`'s balance by `<amount1>` and save it.
  - Attempt to increase `wallet2`'s balance by `<amount2>` and save it.
  - Catch the resulting `OptimisticLockError`.
  - In the error handler, re-fetch the wallet, apply the `<amount2>` addition to the newly fetched balance, and save it.
- Print the final balance to stdout.

## Implementation Hints
- Use `version: true` in the model definition options to enable optimistic locking.
- You will need to import `OptimisticLockError` from Sequelize to catch the specific error.
- Use `process.argv` to read the CLI arguments.

## Acceptance Criteria
- Project path: /home/user/project
- Command: `node optimistic_transfer.js <initial_balance> <amount1> <amount2>`
- The stdout should print: `Final balance: <balance>`
- The script must successfully handle the `OptimisticLockError` and apply both updates without losing data.

