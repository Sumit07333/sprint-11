# Sprint 11 - Fullstack System Integration

## Track B - Fullstack Developer

This project integrates the Sprint 8 React/Vite frontend with the Sprint 10 Node.js/Express/MongoDB backend.

The application uses:

- React
- Vite
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Multer
- Cloudinary
- Vercel
- Render

---

## Project Structure

```text
sprint11-final/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── api/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

# Sprint 11 Features

## Phase 1 - Frontend and Backend Integration

- React/Vite frontend connected to Express backend.
- MongoDB Atlas used as persistent database.
- REST API available through `/api/*` routes.
- CORS configured on Express.
- Frontend uses `VITE_API_URL`.
- Posts are fetched from MongoDB using `useEffect`.
- Posts are rendered dynamically in the React UI.
- Existing Sprint 8 Cine-Stream functionality is preserved.
- Existing Sprint 10 backend functionality is preserved.

---

# Phase 2 - CRUD Integration

## Create Post

The frontend provides a form for creating posts.

The form sends:

- title
- content
- optional authorId
- optional image

using `FormData`.

The backend stores the post in MongoDB.

## Delete Post

Posts can be deleted from the UI.

After successful deletion:

- the backend deletes the MongoDB document
- the frontend immediately updates its local state

## Loading and Error Handling

The application includes:

- loading states
- error states
- empty states
- backend error handling

---

# Phase 3 - Image Upload

Image uploads use the following flow:

```text
React
   ↓
FormData
   ↓
Multer
   ↓
Cloudinary
   ↓
Cloudinary secure URL
   ↓
MongoDB
```

Images are NOT stored as:

- Base64
- raw binary
- Buffer data

MongoDB stores only the Cloudinary URL in:

```text
imageUrl
```

---

# API Routes

## Posts

```text
GET     /api/posts
GET     /api/posts/:id
POST    /api/posts
PUT     /api/posts/:id
DELETE  /api/posts/:id
```

## Users

```text
GET     /api/users
GET     /api/users/:id
POST    /api/users
```

## Login

```text
POST    /api/login
```

Legacy routes from Sprint 10 are also preserved.

---

# Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Do not commit `.env` to GitHub.

---

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000

VITE_TMDB_KEY=your_tmdb_api_key

GEMINI_API_KEY=your_gemini_api_key
```

Do not commit `.env` to GitHub.

---

# Local Development

## Backend

Open a terminal:

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Persistence Test

The application supports persistent MongoDB storage.

The following flow can be used to verify persistence:

1. Open the Data Hub page.
2. Create a new post.
3. Add an image.
4. Submit the form.
5. Verify the post appears.
6. Refresh the browser.
7. Verify the post still exists.
8. Delete the post.
9. Refresh the browser again.
10. Verify the deleted post remains deleted.

This confirms that the application uses MongoDB persistence instead of only frontend/local state.

---

# Image Upload Test

The image upload flow can be verified by:

1. Opening the Data Hub page.
2. Creating a new post.
3. Selecting an image.
4. Submitting the post.
5. Verifying that the image thumbnail appears.
6. Verifying that the image is hosted through Cloudinary.
7. Refreshing the page.
8. Verifying that the image still appears.

MongoDB stores the Cloudinary URL rather than the raw image data.

---

# Deployment

## Frontend - Vercel

Deploy the `frontend` directory to Vercel.

Set the following production environment variable:

```env
VITE_API_URL=https://YOUR-RENDER-BACKEND-URL
```

Do not use:

```env
VITE_API_URL=http://localhost:5000
```

for production.

---

## Backend - Render

Deploy the `backend` directory to Render.

Configure the following environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string

CLIENT_URL=https://YOUR-VERCEL-FRONTEND-URL

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Render provides the `PORT` environment variable.

---

# Security

The following files must never be committed:

```text
.env
.env.local
.env.production
```

Only environment templates such as:

```text
.env.example
```

should be committed.

Never commit:

- MongoDB passwords
- MongoDB connection strings containing credentials
- Cloudinary API secrets
- Gemini API keys
- TMDB API keys when they are intended to remain private

---

# Sprint 11 Acceptance Checklist

## Phase 1 - Integration

- [x] React/Vite frontend
- [x] Express backend
- [x] MongoDB Atlas
- [x] CORS
- [x] `VITE_API_URL`
- [x] `useEffect` GET request
- [x] MongoDB posts displayed in React

## Phase 2 - CRUD

- [x] POST form
- [x] POST data stored in MongoDB
- [x] DELETE functionality
- [x] Local state update after delete
- [x] Loading state
- [x] Error state
- [x] Empty state

## Phase 3 - Image Upload

- [x] FormData image upload
- [x] Multer
- [x] Cloudinary
- [x] Cloudinary secure URL
- [x] `imageUrl` stored in MongoDB
- [x] No Base64/raw binary stored in MongoDB
- [x] Image thumbnail displayed

## Existing Functionality

- [x] Sprint 8 Cine-Stream functionality preserved
- [x] Sprint 10 backend functionality preserved
- [x] Legacy routes preserved
- [x] `/api/*` routes available

## Deployment Configuration

- [x] Vercel configuration
- [x] Render configuration
- [x] Environment variable templates
- [x] Secrets excluded from Git

---

# Local Verification Status

The following local functionality has been tested:

- MongoDB Atlas connection
- GET posts
- Create post
- MongoDB persistence
- Browser refresh persistence
- Cloudinary image upload
- Image thumbnail rendering
- Delete post
- Local UI update after delete
- Persistence after deletion and refresh

---

# Important

Never commit real API keys, passwords, MongoDB credentials, or Cloudinary secrets to GitHub.

Use `.env` files for local development and configure production secrets through Vercel and Render environment variables.
