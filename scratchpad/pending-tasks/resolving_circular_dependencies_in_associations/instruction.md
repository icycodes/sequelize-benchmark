When two models reference each other (e.g., a `User` belongs to a primary `Account`, and an `Account` belongs to an owner `User`), `sequelize.sync()` will throw a "Cyclic dependency found" error during database initialization.

You need to resolve a circular dependency between the `User` and `Account` models so that the database tables can be successfully synchronized without throwing an error.

**Constraints:**
- Use the `{ constraints: false }` option on at least one of the foreign key associations to break the dependency loop.
- Do NOT remove the bidirectional association definitions; both models must still retain their relationships logically.