Sequelize projects require initial configuration and model definitions to interface with a relational database. A standard setup involves configuring the connection, generating files via the CLI, and defining schemas.

You need to initialize a Sequelize project using the Sequelize CLI and create a `Product` model with `name` (string) and `price` (integer) attributes. Additionally, implement an Express router in `routes/products.js` that contains standard CRUD endpoints (Create, Read, Update, Delete) utilizing this model. 

**Constraints:**
- Use the PostgreSQL dialect in your database configuration.
- Do NOT use raw SQL queries; you must use Sequelize's built-in model methods (e.g., `findAll`, `create`, `destroy`).