# Sequelize Many-to-Many with Custom Junction Table

## Background
Create a REST API using Express.js and Sequelize to manage students, courses, and their enrollments. The enrollment must use a custom junction table to store the student's grade.

## Requirements
- Set up a Sequelize connection to a local SQLite database.
- Define three models: `Student` (name), `Course` (title), and `Enrollment` (grade).
- Establish a Many-to-Many relationship between `Student` and `Course` using `Enrollment` as the junction table (`through: Enrollment`).
- Implement the following REST API endpoints:
  - POST `/students`: Create a new student.
  - POST `/courses`: Create a new course.
  - POST `/enrollments`: Enroll a student in a course with a specific grade.
  - GET `/students/:id/courses`: Get a student by ID along with all their enrolled courses, including the grade from the junction table.

## Implementation Hints
- Use `belongsToMany` on both `Student` and `Course` to establish the relationship, specifying `through: Enrollment`.
- When querying the student's courses, ensure the junction table attributes (like `grade`) are included in the result.
- Use `sequelize.sync()` to initialize the database schema on server start.
- Return appropriate HTTP status codes (e.g., 201 for creation, 200 for retrieval, 404 if not found).

## Acceptance Criteria
- Project path: /home/user/project
- Start command: node index.js
- Port: 3000
- API Endpoints:
  - POST `/students`: Accepts JSON `{"name": string}` and returns 201 with `{"id": number, "name": string}`.
  - POST `/courses`: Accepts JSON `{"title": string}` and returns 201 with `{"id": number, "title": string}`.
  - POST `/enrollments`: Accepts JSON `{"studentId": number, "courseId": number, "grade": string}` and returns 201.
  - GET `/students/:id/courses`: Returns 200 and the student object. The student object must contain a `Courses` array, and each course object must include the `Enrollment` junction data with the `grade` field.

