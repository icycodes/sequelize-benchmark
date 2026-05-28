Complex data domains often require many-to-many relationships where additional data must be stored on the junction table itself. Sequelize handles this via the `through` property in `belongsToMany` associations.

You need to set up a Many-to-Many relationship between a `Student` model and a `Course` model. Define a custom junction model named `Enrollment` that includes an extra `grade` integer attribute, and associate the `Student` and `Course` models using this junction table.

**Constraints:**
- Both `Student` and `Course` models must be configured to query the other using standard Sequelize mixins.
- The `Enrollment` model must explicitly define the `grade` attribute so it can be read and written during association operations.