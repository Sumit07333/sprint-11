# Sprint 11 Integrated Base — Cine-Stream + The Data Hub

This project combines the two existing sprint codebases without rewriting or deleting their original source files.

## Source mapping
- `frontend/` = Sprint 8 Cine-Stream React/Vite frontend
- `backend/` = Sprint 10 The Data Hub Node/Express/MongoDB backend

## Sprint 11 implementation still required
1. Configure CORS in the backend and authorize the frontend origin.
2. Add a frontend API base URL using `VITE_API_URL`; do not hardcode localhost for production.
3. Connect the React UI to the backend GET endpoint and render persisted backend data.
4. Add a React create form that sends POST data to the backend.
5. Add a delete action that sends DELETE and updates local UI state.
6. Add loading and backend-error UI states.
7. Add multipart image upload with `FormData` on the frontend.
8. Add Multer on the backend to parse uploads.
9. Upload images to Cloudinary; do not store Base64 or binary data in MongoDB.
10. Store the returned Cloudinary URL in the MongoDB document and render the thumbnail in the UI.
11. Preserve existing Sprint 8 Cine-Stream functionality and existing Sprint 10 MongoDB/Post/User functionality.
12. Keep Sprint 10 endpoints backward-compatible where practical; add `/api/...` routes for the Sprint 11 client rather than unnecessarily breaking existing `/posts` and `/users` routes.
13. Prepare separate production configuration for Vercel frontend and Render backend.

## Important boundary
This repository is a Sprint 11 working copy. Do not push these changes to the original Sprint 8 or Sprint 10 repositories. Create/use a separate Sprint 11 repository if syncing with GitHub.
