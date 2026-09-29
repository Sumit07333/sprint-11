 AI Assistance Log — Prompts.md

## Project: The Data Hub — Sprint 10 Track B (Fullstack Developer)

This document tracks AI prompts and interactions used during the development of Sprint 09 and Sprint 10 Track B, strictly abiding by course policy. LLM assistance was used for debugging, conceptual explanation, implementation guidance, documentation, and QA support.

---

## Sprint 09: Track B — Fullstack Developer

### Phase 1: Project Initialization & Express Server Setup

#### Entry 1: Project Initialization

- **Target Objective**: Initialize Node.js environment, configure `package.json`, install `express` as a core dependency, and install `nodemon` as a development dependency.

- **Prompt Used**:

  > "CRITICAL RULE: Build Sprint 09 strictly according to the Sprint 09 Track B assignment only. Do not modify, add, or anticipate any Sprint 10 requirements inside Sprint 09. I want to create the Sprint 09 Track B project, 'The Data Hub,' from zero as a separate Node.js + Express REST API project. Please begin with Step 1: Project Setup & Initialization."

- **Outcome / Explanation**:

  - `package.json` configured with entry point `server.js`.

  - Scripts configured: `"start": "node server.js"`, `"dev": "nodemon server.js"`.

  - Core dependency: `express`.

  - Dev dependency: `nodemon`.

  - Clean `.gitignore` verified to exclude `node_modules/`.

---

#### Entry 2: Dev Server Startup Fix

- **Target Objective**: Diagnose and resolve dev server startup failure ("The dev server didn't start, please fix it").

- **Prompt Used**:

  > "The dev server didn't start, please fix it"

- **Root Cause**: `package.json` was set to run `nodemon server.js`, but the initial `server.js` file had not yet been created, causing nodemon to fail on launch.

- **Outcome / Explanation**:

  - Created `server.js` with Express server initialization and `express.json()` middleware.

  - Bound listener to Port 5000.

  - Restarted dev server and verified HTTP 200 JSON response.

---

### Phase 2: In-Memory Database & CRUD Architecture

#### Entry 3: In-Memory CRUD Implementation & Frontend Removal

- **Target Objective**: Remove unrequested frontend/Vite files, implement `blogPosts = []` in-memory data store, and construct standard REST routes (`GET /posts`, `GET /posts/:id`, `POST /posts`, `PUT /posts/:id`, `DELETE /posts/:id`).

- **Prompt Used**:

  > "IMPORTANT: SPRINT 09 TRACK B CORRECTION TASK. Your task is to inspect my CURRENT project and correct it so that it fully satisfies the original Sprint 09 Track B assignment. Remove unnecessary frontend files. Sprint 09 must remain exactly a Node.js + Express REST API using an in-memory JavaScript array."

- **Outcome / Explanation**:

  - Deleted unused React/Vite scaffolding.

  - Created `controllers/postController.js` containing `let blogPosts = []` and full CRUD logic.

  - Created `routes/postRoutes.js` using `express.Router()` to cleanly route endpoints to controller actions.

---

### Phase 3: Custom Middleware, Authentication & Port Debugging

#### Entry 4: Custom Logger Middleware & Mock Authentication

- **Target Objective**: Implement custom request logger without third-party libraries and add a mock login endpoint returning a mock JWT token.

- **Outcome / Explanation**:

  - Created `middleware/logger.js` logging `[METHOD] URL - HH:MM AM/PM`.

  - Created `POST /login` in `server.js` accepting `email` and `password` and returning a mock JWT response.

  - Added 404 handler for unknown routes and 500 global error handler avoiding stack trace leakage.

---

#### Entry 5: Port Conflict Resolution

- **Target Objective**: Debug server failure caused by a port conflict during development/testing.

- **Outcome / Explanation**:

  - Investigated the port conflict.

  - Updated the server configuration to use Port 5000 for local development.

  - Verified that the server starts successfully.

---

#### Entry 6: Postman / Thunder Client QA Verification

- **Target Objective**: Execute standard API test cases and failure cases against the local server.

- **Outcome / Explanation**:

  - Tested API endpoints against `http://localhost:5000`.

  - Verified successful CRUD responses.

  - Verified validation and error responses.

  - Confirmed that API responses returned valid JSON structures.

---

#### Entry 7: Minimal Correction - Single Port 5000 Listener & Frontend Cleanup

- **Target Objective**: Apply strict minimal corrections per Sprint 09 Track B instructions.

- **Outcome / Explanation**:

  - `server.js` uses Port 5000 for local development.

  - Removed unnecessary frontend code.

  - No MongoDB, Mongoose, or Sprint 10 features were added during Sprint 09.

---

# Sprint 10: Track B — Fullstack Developer

**Theme**: NoSQL Cloud Databases & Object Data Modeling (ODM)

---

## Phase 1: Mongoose ODM & MongoDB Atlas Provisioning Setup

### Entry 8: ODM Dependency Installation & Environment Configuration

- **Target Objective**: Install `mongoose` and `dotenv`, configure safe environment variables, verify `.gitignore` protection of `.env*`, and create a reusable database connection module (`config/db.js`).

- **Prompt Used**:

  > "PROJECT: The Data Hub. CURRENT VERSION: Sprint 09 — Track B (Fullstack). TARGET: Sprint 10 — Track B (Fullstack). THEME: NoSQL Cloud Databases & Object Data Modeling (ODM). Transition this existing project from volatile in-memory arrays to persistent cloud storage using MongoDB Atlas and Mongoose."

- **Outcome / Explanation**:

  - Installed `mongoose` and `dotenv`.

  - Created `config/db.js` using `mongoose.connect(process.env.MONGO_URI)`.

  - Added error handling so database connection errors do not expose credentials.

  - Updated `.env.example` with a `MONGO_URI` placeholder.

  - Confirmed `.gitignore` protects `.env*` files while allowing `.env.example`.

  - Updated `server.js` to initialize the MongoDB connection during startup.

  - Maintained environment-based port configuration for deployment compatibility.

---

## Phase 2: Post Model & Database CRUD Migration

### Entry 9: Post Model Schema & ObjectId CRUD Refactoring

- **Target Objective**: Create the Mongoose `Post` model, remove active in-memory storage, and migrate `controllers/postController.js` to MongoDB operations.

- **Outcome / Explanation**:

  - Created `models/Post.js` with:

    - `title` — String, required

    - `content` — String, required

    - `authorId` — ObjectId reference to `User`

    - `createdAt` — Date

  - Removed the active in-memory post storage from `controllers/postController.js`.

  - Migrated `POST /posts` to `Post.create()`.

  - Migrated `GET /posts` to `Post.find()`.

  - Added sorting by `createdAt` in descending order.

  - Added `.populate('authorId', 'name email')`.

  - Migrated `GET /posts/:id` to `Post.findById()`.

  - Migrated `PUT /posts/:id` to `Post.findByIdAndUpdate()`.

  - Migrated `DELETE /posts/:id` to `Post.findByIdAndDelete()`.

  - Added MongoDB ObjectId format validation.

  - Invalid ObjectId strings return HTTP 400 instead of causing an unhandled Mongoose CastError.

---

## Phase 3: User Model, Populate & Top 3 Recent Posts

### Entry 10: User Relationship Modeling, `.populate()` & Top 3 Route Ordering

- **Target Objective**: Create the `User` schema, establish the relationship through `Post.authorId`, implement `.populate()`, add `GET /posts/recent/top3`, and create minimal user endpoints for relationship testing.

- **Outcome / Explanation**:

  - Created `models/User.js` with:

    - `name` — String, required

    - `email` — String

    - `createdAt` — Date

  - Created `controllers/userController.js`.

  - Created `routes/userRoutes.js`.

  - Added `POST /users` for creating test users.

  - Added `GET /users` for retrieving users.

  - Added `authorId` reference from `Post` to `User`.

  - Added `.populate('authorId', 'name email')` to relevant post queries.

  - Added `GET /posts/recent/top3`.

  - Implemented `.sort({ createdAt: -1 }).limit(3)`.

  - Registered `/recent/top3` before `/:id` to avoid route conflicts.

  - Preserved the existing request logger, mock login endpoint, 404 handler, and global error handler.

  - Updated the API root discovery endpoint to reflect Sprint 10 Track B.

---

## Phase 4: Documentation, Postman QA & MongoDB Atlas Verification

### Entry 11: README, Prompts Tracking & Endpoint Verification

- **Target Objective**: Update project documentation for Sprint 10 Track B and verify the implemented API locally using Postman and MongoDB Atlas.

- **Outcome / Explanation**:

  - Updated `README.md` with Sprint 10 Track B architecture and MongoDB Atlas documentation.

  - Added MongoDB Atlas setup and environment variable guidance.

  - Added Postman API testing documentation.

  - Verified local server startup on Port 5000.

  - Verified `GET /`.

  - Verified `POST /login`.

  - Verified `POST /posts`.

  - Verified `GET /posts`.

  - Verified `GET /posts/:id`.

  - Verified `PUT /posts/:id`.

  - Verified `DELETE /posts/:id`.

  - Verified validation for missing post fields.

  - Verified invalid ObjectId handling.

  - Verified `POST /users`.

  - Verified `GET /users`.

  - Verified User/Post relationship using `authorId`.

  - Verified `.populate()` returns the related user's `name` and `email`.

  - Verified `GET /posts/recent/top3`.

  - Verified that the endpoint returns a maximum of three posts sorted by newest `createdAt`.

  - Verified MongoDB Atlas persistence by checking the `posts` and `users` collections.

  - Confirmed that the actual `.env` file is protected by `.gitignore` and is not committed to Git.

---


## Phase 5: GitHub Repository & Render Deployment

### Entry 12: Sprint 10 Repository Setup

**Target Objective**: Publish the completed Sprint 10 Track B project in a dedicated GitHub repository and deploy the API to Render with MongoDB Atlas persistence.

**Outcome / Explanation**:

Initialized Git for the Sprint 10 project.

Verified .env is ignored by Git.

Created a Sprint 10-specific commit.

Created and configured the dedicated GitHub repository:
https://github.com/Sumit07333/The-data-hub-sprint-10

Pushed the completed Sprint 10 project to the dedicated repository.

Created the Render Web Service:
The-data-hub-sprint-10

Configured Render to use the main branch and npm install build command.

Configured the service to use the Render-provided PORT environment variable.

Added MONGO_URI securely through Render Environment Variables.

Added the required Render outbound IP ranges to the MongoDB Atlas IP Access List:

74.220.48.0/24

74.220.56.0/24

Verified successful MongoDB Atlas connection in the Render runtime logs.

Verified that the deployed Render service is live.

### Entry 13: Live Production API Verification

**Target Objective**: Verify the deployed Sprint 10 Track B API against the live Render service and confirm persistent MongoDB Atlas functionality.

**Outcome / Explanation**:

Verified the live API discovery endpoint:
GET https://the-data-hub-sprint-10.onrender.com/

Verified the live posts endpoint:
GET https://the-data-hub-sprint-10.onrender.com/posts

Verified the live Top 3 endpoint:
GET https://the-data-hub-sprint-10.onrender.com/posts/recent/top3

Created a test user through the deployed API using POST /users.

Created a post through the deployed API using POST /posts with the returned authorId.

Verified HTTP 201 Created for the live user and post creation requests.

Verified that Mongoose .populate() returned the related user's _id, name, and email.

Confirmed that the deployed API is connected to persistent MongoDB Atlas storage.

Confirmed that the Render deployment is serving the Sprint 10 API successfully.

## Current Sprint 10 Status

The following Sprint 10 requirements have been implemented, tested, deployed, and verified:

MongoDB Atlas connection

Mongoose ODM integration

Persistent MongoDB storage

Post schema

User schema

Post/User relationship

CRUD operations

ObjectId validation

.populate() relationship testing

Top 3 recent posts endpoint

Postman API testing

MongoDB Atlas persistence verification

Environment variable security

Dedicated GitHub repository

Render deployment

Live production API verification

**Live Render Deployment:**
https://the-data-hub-sprint-10.onrender.com

**GitHub Repository:**
https://github.com/Sumit07333/The-data-hub-sprint-10

**Sprint 10 Track B Status: Completed and verified.**

