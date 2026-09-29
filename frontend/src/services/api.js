/**
 * Centralized API Service Layer for MongoDB Data Hub Backend (Sprint 11 Track B)
 *
 * All requests consume import.meta.env.VITE_API_URL for production configuration (e.g. Render)
 * and fall back to local dev URL or relative paths.
 */

/**
 * Normalizes and returns the configured backend API base URL.
 * Never hardcodes production endpoints in application code.
 * @returns {string}
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // When VITE_API_URL is omitted in local dev, default to empty string so
  // relative calls pass through Vite proxy, or default to http://localhost:5000.
  return '';
}

/**
 * GET /api/posts
 * Retrieves all blog posts from MongoDB Atlas via the Express backend.
 *
 * @param {AbortSignal} [signal] - Optional abort signal for cancellation
 * @returns {Promise<Array>} List of post objects
 */
export async function getPosts(signal = null) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/posts`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server responded with status ${response.status} when fetching posts.`
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error('Failed to fetch posts from backend:', error);
    throw new Error(
      error.message || 'Unable to connect to the backend. Please make sure the API server is running.'
    );
  }
}

/**
 * POST /api/posts
 * Submits a new post to the backend using multipart FormData.
 * Supports title, content, optional authorId, and optional image upload to Cloudinary.
 *
 * CRITICAL: Does NOT set Content-Type header manually so the browser
 * automatically assigns multipart/form-data with the correct boundary.
 *
 * @param {FormData} formData - Pre-constructed FormData containing title, content, and optional image
 * @returns {Promise<Object>} Created post document
 */
export async function createPost(formData) {
  if (!(formData instanceof FormData)) {
    throw new Error('createPost requires a valid FormData object.');
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/posts`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // NOTE: Intentionally no 'Content-Type' header here.
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server responded with status ${response.status} when creating post.`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create post:', error);
    throw new Error(
      error.message || 'Unable to connect to the backend. Please make sure the API server is running.'
    );
  }
}

/**
 * DELETE /api/posts/:id
 * Deletes a single post from MongoDB Atlas by ObjectId.
 * Affects MongoDB posts only; does NOT touch TMDB movies or favorites.
 *
 * @param {string} id - MongoDB ObjectId of the post to delete
 * @returns {Promise<Object>} Deletion confirmation response
 */
export async function deletePost(id) {
  if (!id) {
    throw new Error('Post ID is required for deletion.');
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/posts/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server responded with status ${response.status} when deleting post.`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw new Error(
      error.message || 'Unable to connect to the backend. Please make sure the API server is running.'
    );
  }
}
