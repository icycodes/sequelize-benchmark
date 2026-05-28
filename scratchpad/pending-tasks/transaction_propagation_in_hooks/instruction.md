Sequelize supports transactions to ensure database operation atomicity. However, developers often encounter bugs where model lifecycle hooks (like `afterCreate`) do not automatically inherit the parent transaction, leading to partial commits or data inconsistencies if an error occurs.

You need to fix a bug in an existing `User` model's `afterCreate` hook where an associated `Profile` is being created. Ensure that the `Profile.create` operation correctly receives and uses the transaction object from the initial `User.create` call.

**Constraints:**
- Extract the transaction instance from the hook's `options` object.
- The system must ensure that if the transaction rolls back, neither the `User` nor the `Profile` is persisted.