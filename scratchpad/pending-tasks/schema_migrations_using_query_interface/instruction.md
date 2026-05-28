As applications evolve, database schemas must be updated incrementally without destroying existing data. Sequelize's `queryInterface` provides methods to modify tables safely during migrations.

You need to write a migration file that adds a new string column called `category` to an existing `Books` table. The migration must also provide a rollback mechanism to safely remove the column if the migration is reverted.

**Constraints:**
- Do NOT modify the `Book` model definition file directly for this task; only write the migration file.
- Use `queryInterface.addColumn` in the `up` method and `queryInterface.removeColumn` in the `down` method.