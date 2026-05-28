Using `include` to eagerly load associated data can lead to massive JOINs and incorrect pagination results when combining `limit`/`offset` with 1-to-Many or Many-to-Many relationships.

You need to optimize a slow paginated endpoint that retrieves `Users` and their associated `Posts`. Modify the query options to prevent Sequelize from generating inefficient and incorrect subqueries, ensuring that `limit` and `offset` work correctly on the primary `User` model while accurately fetching the associated `Posts`.

**Constraints:**
- Apply the `subQuery: false` option to the main query to resolve the limit/offset evaluation issue.
- Do NOT change the endpoint's final JSON response payload structure.