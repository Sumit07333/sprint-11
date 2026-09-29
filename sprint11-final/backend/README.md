Data Hub — RESTful API Server

## Project Name

The Data Hub — Sprint 10: Track B (Fullstack Developer)  

**Theme**: NoSQL Cloud Databases & Object Data Modeling (ODM)

---

## Project Description

The Data Hub is a backend RESTful API server built using **Node.js**, **Express**, and **Mongoose** connected to **MongoDB Atlas**. It transitions the volatile Sprint 09 in-memory storage into persistent cloud database storage with complete CRUD operations, schema validation, relationship modeling with `.populate()`, custom request logging middleware, and mock authentication scaffolding.

In Sprint 09, data was temporarily kept in an in-memory array (`blogPosts = []`). In Sprint 10, **MongoDB Atlas** is the primary source of truth, ensuring blog posts and user relationships persist across server restarts and deployments.

---

## Live Deployment & Repository

- **Source Code Repository**: https://github.com/Sumit07333/The-data-hub-sprint-10

- **Deployment Platform**: Render (Web Service)

- **Deployment URL**: https://the-data-hub-sprint-10.onrender.com (Requires `MONGO_URI` configured in Render Environment Variables for live database operations)

- **API Status / Discovery Root Endpoint**: https://the-data-hub-sprint-10.onrender.com/

### Live Deployment Verification

The deployed Sprint 10 API was verified after connecting Render to MongoDB Atlas:

- `GET /` → API discovery/status response
- `GET /posts` → persisted MongoDB posts returned successfully
- `GET /posts/recent/top3` → 3 most recent posts returned in descending `createdAt` order
- `POST /users` → user created successfully in MongoDB Atlas
- `POST /posts` with `authorId` → post created with populated author details via Mongoose `.populate()`
- Render runtime logs confirmed a successful MongoDB Atlas connection and a live service

---

## Technologies Used

- **Runtime**: Node.js

- **Framework**: Express v4.21.2

- **Object Data Modeling (ODM)**: Mongoose v8.x / v9.x

- **Cloud Database**: MongoDB Atlas (M0 Sandbox Free Tier)

- **Configuration**: dotenv v17.x

- **Development Tool**: Nodemon v3.1.14

- **API Testing**: Postman / cURL

- **Deployment Target**: Render (Standard Node Web Service)

- **Version Control**: Git / GitHub

---

## Security & Environment Variables

Credentials and database connection strings **must never be committed to source code or git repositories**.

### Required Environment Variables

The application reads configuration from environment variables via `dotenv`:

| Variable | Description | Example |

| :--- | :--- | :--- |

| `PORT` | Server listener port (defaults to `5000` locally and uses the platform-provided PORT on Render) | `5000` |

| `MONGO_URI` | MongoDB Atlas SRV connection string with username & password | `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/datahub?retryWrites=true&w=majority` |

> ⚠️ **SECURITY WARNING**: Never commit `.env` or paste real MongoDB Atlas credentials into code, README, Prompts.md, or git commits. `.gitignore` is configured to ignore all `.env*` files except `.env.example`.

### `.env.example` Reference

```env

GEMINI_API_KEY=

APP_URL=

PORT=5000

MONGO_URI="your_mongodb_connection_string_here"

```

---

## Local Setup & Installation

### 1. Prerequisites

- Node.js (v18 or later recommended)

- npm (v9 or later)

- A MongoDB Atlas account and cluster (or local MongoDB URI)

### 2. Clone & Install

```bash

git clone https://github.com/Sumit07333/The-data-hub-sprint-10.git

cd The-data-hub-sprint-10

npm install

```

### 3. Configure Local Environment

Create a `.env` file in the root directory:

```bash

cp .env.example .env

```

Open `.env` and set your MongoDB Atlas connection string:

```env

PORT=5000

MONGO_URI="mongodb+srv://<db_username>:<db_password>@cluster0.xxxxx.mongodb.net/datahub?retryWrites=true&w=majority"

```

### 4. Running the Server

#### Production Mode

```bash

npm start

```

#### Development Mode (with hot reloading via Nodemon)

```bash

npm run dev

```

The server binds to port 5000 locally by default and uses the platform-provided PORT on Render:

```

✅ [MongoDB Atlas Connected] Host: cluster0-shard-00-00.xxxxx.mongodb.net

Server running on port 5000

```

_Note: If `MONGO_URI` is not yet set, the server still boots safely, logging a clear warning and returning HTTP 503 on database routes instead of crashing._

Local base URL:

```

http://localhost:5000

```

---

## MongoDB Atlas Manual Setup Guide (M0 Sandbox)

Follow these steps to configure your MongoDB Atlas cloud database:

1. **Sign Up / Log In**: Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log into your account.

2. **Create Cluster**: Select **Create a Deployment** and choose the **M0 Free Tier** (Sandbox). Select your preferred cloud provider and region (e.g., AWS / us-east-1).

3. **Create Database User**: Under **Security > Database Access**, click **Add New Database User**. Choose Password Authentication, enter a username (e.g., `datahub_user`) and a secure password. Grant `Read and write to any database`.

4. **Configure Network Access**: Under **Security > Network Access**, click **Add IP Address**. For the deployed Render service, add these Render outbound CIDR ranges so the cloud service can connect to MongoDB Atlas:

`74.220.48.0/24`

`74.220.56.0/24`

Keep your local development IP address in the Atlas IP Access List as needed for local testing. Avoid using `0.0.0.0/0` unless there is a specific requirement, because it allows connections from any IP address.

5. **Obtain Connection String**:

      - Go to **Database > Clusters** and click **Connect**.

      - Choose **Drivers** (Node.js).

      - Copy the SRV connection string:

        `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

      - Replace `<username>` and `<password>` with your database user credentials.

      - Specify database name (e.g., `...mongodb.net/datahub?...`).

6. **Apply Locally**: Add the connection string to your `.env` as `MONGO_URI`.

7. **Apply on Render**: Go to your Render Dashboard > Web Service > **Environment** tab > Add Environment Variable:

      - Key: `MONGO_URI`

      - Value: `<your_atlas_connection_string>`

      - Click **Save Changes** (Render will redeploy with Atlas connectivity).

---

## REST API Endpoints

| Method   | Endpoint             | Description                                                 | Expected Status          |

| :------- | :------------------- | :---------------------------------------------------------- | :----------------------- |

| `GET`    | `/`                  | API discovery and status information                        | `200 OK`                 |

| `GET`    | `/posts`             | Retrieve all blog posts (with populated authorId)           | `200 OK` / `503`         |

| `GET`    | `/posts/recent/top3` | Retrieve 3 most recent posts sorted by createdAt descending | `200 OK` / `503`         |

| `GET`    | `/posts/:id`         | Retrieve a specific blog post by MongoDB ObjectId           | `200 OK` / `400` / `404` |

| `POST`   | `/posts`             | Create a new blog post in MongoDB                           | `201 Created` / `400`    |

| `PUT`    | `/posts/:id`         | Update an existing blog post by ObjectId                    | `200 OK` / `400` / `404` |

| `DELETE` | `/posts/:id`         | Delete a blog post by ObjectId                              | `200 OK` / `400` / `404` |

| `POST`   | `/users`             | Create a test user for relationship modeling and populate() | `201 Created` / `400`    |

| `GET`    | `/users`             | List all test users in MongoDB                              | `200 OK` / `503`         |

| `POST`   | `/login`             | Mock authentication returning a mock JWT token              | `200 OK` / `400`         |

---

## Request & Response Examples

### 1. POST /users — Create a Test User

**Request Body:**

```json

{

  "name": "Jane Doe",

  "email": "jane@example.com"

}

```

**Response (201 Created):**

```json

{

  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",

  "name": "Jane Doe",

  "email": "jane@example.com",

  "createdAt": "2026-09-06T12:00:00.000Z"

}

```

### 2. POST /posts — Create a Post with Author Reference

**Request Body:**

```json

{

  "title": "Cloud Persistence with MongoDB Atlas",

  "content": "Sprint 10 transitions from in-memory arrays to persistent cloud NoSQL storage.",

  "authorId": "64f8a1b2c3d4e5f6a7b8c9d0"

}

```

**Response (201 Created):**

```json

{

  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",

  "title": "Cloud Persistence with MongoDB Atlas",

  "content": "Sprint 10 transitions from in-memory arrays to persistent cloud NoSQL storage.",

  "authorId": {

    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",

    "name": "Jane Doe",

    "email": "jane@example.com"

  },

  "createdAt": "2026-09-06T12:05:00.000Z"

}

```

### 3. GET /posts/recent/top3 — Top 3 Recent Posts

**Response (200 OK):**

```json

[

  {

    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",

    "title": "Third Post",

    "content": "Latest post content.",

    "authorId": {

      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",

      "name": "Jane Doe",

      "email": "jane@example.com"

    },

    "createdAt": "2026-09-06T12:15:00.000Z"

  },

  {

    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",

    "title": "Second Post",

    "content": "Second post content.",

    "authorId": null,

    "createdAt": "2026-09-06T12:10:00.000Z"

  },

  {

    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",

    "title": "Cloud Persistence with MongoDB Atlas",

    "content": "Sprint 10 transitions from in-memory arrays to persistent cloud NoSQL storage.",

    "authorId": {

      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",

      "name": "Jane Doe",

      "email": "jane@example.com"

    },

    "createdAt": "2026-09-06T12:05:00.000Z"

  }

]

```

### 4. GET /posts/:id — Retrieve Single Post

**Response (200 OK):**

```json

{

  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",

  "title": "Cloud Persistence with MongoDB Atlas",

  "content": "Sprint 10 transitions from in-memory arrays to persistent cloud NoSQL storage.",

  "authorId": {

    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",

    "name": "Jane Doe",

    "email": "jane@example.com"

  },

  "createdAt": "2026-09-06T12:05:00.000Z"

}

```

### 5. PUT /posts/:id — Update a Post

**Request Body:**

```json

{

  "title": "Updated Cloud Persistence Title"

}

```

**Response (200 OK):**

```json

{

  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",

  "title": "Updated Cloud Persistence Title",

  "content": "Sprint 10 transitions from in-memory arrays to persistent cloud NoSQL storage.",

  "authorId": {

    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",

    "name": "Jane Doe",

    "email": "jane@example.com"

  },

  "createdAt": "2026-09-06T12:05:00.000Z"

}

```

### 6. DELETE /posts/:id — Delete a Post

**Response (200 OK):**

```json

{

  "message": "Post deleted successfully"

}

```

### 7. POST /login — Mock Authentication (Preserved from Sprint 09)

**Request Body:**

```json

{

  "email": "user@example.com",

  "password": "password123"

}

```

**Response (200 OK):**

```json

{

  "message": "Login successful",

  "token": "mock-jwt-token"

}

```

---

## ObjectId & Error Handling

- **Invalid ObjectId Format**: `GET /posts/invalid-id`, `PUT /posts/invalid-id`, or `DELETE /posts/invalid-id` returns:

    `json

  { "error": "Invalid post ID format" }

  `

    with HTTP status `400 Bad Request`.

- **Nonexistent Document**: Valid 24-character hexadecimal ObjectId that does not exist in the collection returns:

    `json

  { "error": "Post not found" }

  `

    with HTTP status `404 Not Found`.

- **Validation Errors**: Missing `title` or `content` returns `400 Bad Request` with `{ "error": "Title and content are required" }`.

- **Database Offline**: If `MONGO_URI` is not configured, operations return `503 Service Unavailable` with `{ "error": "Database not connected. Please ensure MONGO_URI is configured in your environment." }`.

- **Global 500 Handler**: Catches unhandled runtime exceptions without leaking Mongoose internal stack traces or database connection URIs.

---

## Custom Request Logger

The custom request logger in `middleware/logger.js` is preserved from Sprint 09. It intercepts every incoming HTTP request and logs the method, path, and timestamp without third-party dependencies:

```

[GET] /posts - 05:45 PM

[POST] /posts - 05:46 PM

[GET] /posts/recent/top3 - 05:47 PM

```

---

## Postman QA Testing Checklist

Prepare your Postman collection with the following sequence:

1. **GET `/`**: Verify API discovery returns status 200, online status, and endpoint list including `GET /posts/recent/top3`.

2. **POST `/users`**: Send `{ "name": "Jane Doe", "email": "jane@example.com" }`. Verify status 201 and copy the returned `_id`.

3. **POST `/posts` (Validation Failure)**: Send `{}`. Verify status 400 with `{ "error": "Title and content are required" }`.

4. **POST `/posts` (With Author)**: Send `{ "title": "Post 1", "content": "First post", "authorId": "<USER_ID>" }`. Verify status 201 with populated `authorId`.

5. **POST `/posts` (Without Author)**: Send `{ "title": "Post 2", "content": "Second post" }`. Verify status 201 with `authorId: null`.

6. **POST `/posts`**: Create Post 3 and Post 4.

7. **GET `/posts`**: Verify all created documents are returned.

8. **GET `/posts/recent/top3`**: Verify exactly 3 posts are returned, ordered newest first, with author populated.

9. **GET `/posts/:id` (Invalid ID)**: Send `GET /posts/123`. Verify status 400 `{ "error": "Invalid post ID format" }`.

10. **GET `/posts/:id` (Valid ID)**: Send with an existing post ID. Verify status 200 and correct document.

11. **PUT `/posts/:id`**: Update title to `"Updated Post Title"`. Verify status 200.

12. **DELETE `/posts/:id`**: Send delete request. Verify status 200 `{ "message": "Post deleted successfully" }`.

13. **POST `/login`**: Send mock credentials. Verify status 200 and mock token.

---

## 3-Minute Video Demonstration Plan (Sprint 10)

For the Sprint 10 official demo (maximum 3 minutes):

1. **Minute 0:00 - 0:45 | Architecture Overview**:

      - Briefly introduce The Data Hub Sprint 10 Track B.

      - Show `models/Post.js` and `models/User.js` illustrating Mongoose Schema and ObjectId reference (`authorId`).

      - Show `config/db.js` illustrating secure MongoDB Atlas connectivity using `process.env.MONGO_URI`.

2. **Minute 0:45 - 1:45 | Postman Execution**:

      - Create a test user via `POST /users`.

      - Create a post with `authorId` via `POST /posts`.

      - Call `GET /posts/recent/top3` to demonstrate descending sort limit 3 and author population.

3. **Minute 1:45 - 2:30 | MongoDB Atlas Verification**:

      - Open the MongoDB Atlas dashboard in browser.

      - Navigate to Database > Collections > `posts` and `users`.

      - Show the newly created documents persisting in cloud storage with matching `_id` and timestamps.

4. **Minute 2:30 - 3:00 | Persistence & Wrap-Up**:

      - Restart the server process in the terminal.

      - Execute `GET /posts` in Postman to prove that data was NOT lost upon restart (unlike Sprint 09 in-memory arrays).

---

## Project Structure

```

The-data-hub-sprint-10/

├── config/

│   └── db.js                 # MongoDB Atlas Mongoose connection module

├── controllers/

│   ├── postController.js     # MongoDB Post CRUD, ObjectId validation & top3 logic

│   └── userController.js     # User test creation and retrieval for populate()

├── middleware/

│   └── logger.js             # Custom request logging middleware (Sprint 09 preserved)

├── models/

│   ├── Post.js               # Mongoose Post model (title, content, authorId, createdAt)

│   └── User.js               # Mongoose User model (name, email, createdAt)

├── routes/

│   ├── postRoutes.js         # REST routes for /posts (including /recent/top3)

│   └── userRoutes.js         # REST routes for /users

├── .env.example              # Environment variables template

├── .gitignore                # Git ignore rules protecting .env* files

├── package.json              # Project dependencies (express, mongoose, dotenv)

├── package-lock.json

├── Prompts.md                # AI assistance history log (Sprint 09 + Sprint 10)

├── README.md                 # Complete project and API documentation

└── server.js                 # Express application entry point and server setup

```

---

## Sprint 09 to Sprint 10 Migration Summary

- **Storage**: Transitioned from transient `blogPosts = []` in `postController.js` to cloud-hosted MongoDB Atlas collections managed by Mongoose models.

- **Data Modeling**: Added `Post` and `User` schemas with ObjectId relationship (`authorId` ref `User`) and `.populate()`.

- **Querying**: Implemented `GET /posts/recent/top3` using `.sort({ createdAt: -1 }).limit(3)`.

- **Validation**: Added Mongoose schema validation and explicit `ObjectId.isValid()` checks, preventing server crashes from invalid IDs.

- **Preserved**: Retained custom logger, mock authentication (`POST /login`), 404 handler, global error handler, and Render-compatible port handling.

Sprint 10 Completion & Live Verification

The Sprint 10 Track B implementation, testing, documentation, GitHub repository setup, MongoDB Atlas persistence, and Render deployment have been completed and verified.

Implementation Verification

MongoDB Atlas connected through Mongoose.

Post and User Mongoose schemas implemented.

Full Post CRUD operations implemented.

authorId references the User model.

Mongoose .populate() returns related author details.

GET /posts/recent/top3 returns the three most recent posts ordered by createdAt descending.

ObjectId validation and database error handling are implemented.

Custom request logging, mock authentication, 404 handling, and global error handling are preserved.

Live Deployment Verification

The deployed API was verified using the live Render service:

GET / → API discovery/status response

GET /posts → MongoDB posts returned successfully

GET /posts/recent/top3 → three most recent posts returned

POST /users → user created successfully in MongoDB Atlas

POST /posts with authorId → post created successfully

.populate() → related user name and email returned successfully

Render runtime logs → MongoDB Atlas connection confirmed

Live Deployment

Render:
https://the-data-hub-sprint-10.onrender.com

GitHub Repository:
https://github.com/Sumit07333/The-data-hub-sprint-10

Sprint 10 Status

Sprint 10 Track B is complete and submission-ready.

