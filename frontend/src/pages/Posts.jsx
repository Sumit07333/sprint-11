import React, { useState, useEffect, useRef } from 'react';
import { getPosts, createPost, deletePost } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  Database,
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  Calendar,
  User,
  UploadCloud,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';

export default function Posts() {
  // State for posts retrieved from MongoDB Atlas
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form input states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Track ID of post currently being deleted to show granular loading
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const fileInputRef = useRef(null);

  /**
   * P0 MANDATORY REQUIREMENT:
   * Uses React useEffect to execute GET /api/posts and persist in React state.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPostsData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPosts(controller.signal);
        setPosts(data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(
          err.message ||
            'Unable to connect to the backend. Please make sure the API server is running.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPostsData();

    return () => {
      controller.abort();
    };
  }, []);

  // Manage temporary browser object URL for file preview cleanup
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Please select a valid image file (JPEG, PNG, WebP).');
        return;
      }
      setFormError(null);
      setImageFile(file);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * P1 MANDATORY REQUIREMENT:
   * Handles Post Creation using FormData (no manual multipart headers, no Base64).
   */
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    // Validate required fields
    if (!title.trim()) {
      setFormError('Post title is required.');
      return;
    }
    if (!content.trim()) {
      setFormError('Post content is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const createdPost = await createPost(formData);

      // On success: update UI state immediately without full page reload
      setPosts((prevPosts) => [createdPost, ...prevPosts]);

      // Reset form
      setTitle('');
      setContent('');
      handleClearImage();
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err) {
      setFormError(
        err.message || 'Failed to create post. Please verify backend and Cloudinary connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * P1 MANDATORY REQUIREMENT:
   * Handles Post Deletion by ObjectId.
   * Updates React state immediately without full page reload.
   */
  const handleDeletePost = async (postId) => {
    if (!postId || deletingId) return;

    // Prevent duplicate clicks
    setDeletingId(postId);
    setDeleteError(null);

    try {
      await deletePost(postId);
      // Remove post from local React state immediately
      setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
    } catch (err) {
      setDeleteError(
        err.message || 'Failed to delete post. The post has been preserved in the UI.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Format created date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <section className="border-b border-neutral-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Database className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                The Data Hub <span className="text-amber-400">— MongoDB Posts</span>
              </h1>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Persistent Fullstack Integration (Sprint 11 Track B). Posts are persisted in MongoDB Atlas
              and image uploads are securely processed through Multer and Cloudinary.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-neutral-300 border border-neutral-700">
              {posts.length} {posts.length === 1 ? 'Stored Post' : 'Stored Posts'}
            </span>
          </div>
        </div>
      </section>

      {/* Post Creation Form Section */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-7 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-neutral-800">
          <PlusCircle className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white font-mono">Create New Post</h2>
        </div>

        {formSuccess && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 text-xs sm:text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Post created successfully and persisted in MongoDB Atlas!</span>
          </div>
        )}

        {formError && (
          <div className="mb-5 rounded-xl bg-red-950/40 border border-red-500/30 p-3.5 text-xs sm:text-sm text-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label htmlFor="post-title" className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Title <span className="text-amber-400">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Behind the Scenes: The Cinematography of Dune"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="post-content" className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Content <span className="text-amber-400">*</span>
            </label>
            <textarea
              id="post-content"
              required
              rows={4}
              disabled={isSubmitting}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share thoughts, movie analysis, production trivia, or review notes..."
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50 resize-y"
            />
          </div>

          {/* Optional Image Upload */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Image Thumbnail <span className="text-neutral-500 font-normal normal-case">(Optional — Uploaded to Cloudinary)</span>
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                ref={fileInputRef}
                id="post-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isSubmitting}
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              >
                <UploadCloud className="h-4 w-4 text-amber-400" />
                <span>{imageFile ? 'Change Image' : 'Select Image File'}</span>
              </button>

              {imageFile && (
                <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                  <span className="truncate max-w-[200px]">{imageFile.name}</span>
                  <span className="text-neutral-500">({(imageFile.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-neutral-400 hover:text-red-400 p-0.5"
                    title="Remove selected image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Local Preview of Selected Image */}
            {imagePreviewUrl && (
              <div className="mt-3 relative w-32 h-24 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950">
                <img
                  src={imagePreviewUrl}
                  alt="Selected preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                  <span>Publishing Post...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Publish to MongoDB</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Delete Feedback Notification */}
      {deleteError && (
        <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4 text-xs sm:text-sm text-red-300">
          {deleteError}
        </div>
      )}

      {/* Posts Listing Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-mono">Persisted Posts Stream</h2>
          </div>
          <span className="text-xs text-neutral-400">
            Source: <strong className="text-neutral-200">MongoDB Atlas</strong>
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingSpinner message="Retrieving posts from MongoDB Atlas..." />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorMessage
            title="Backend Connection Error"
            message={error}
            onRetry={() => {
              setIsLoading(true);
              setError(null);
              getPosts()
                .then(setPosts)
                .catch((err) => setError(err.message))
                .finally(() => setIsLoading(false));
            }}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && posts.length === 0 && (
          <EmptyState
            icon={Database}
            title="No Posts in MongoDB Atlas"
            description="The database currently has no blog posts. Use the form above to publish your first post with an optional image thumbnail."
            actionText="Create First Post"
            onAction={() => {
              window.scrollTo({ top: 100, behavior: 'smooth' });
            }}
          />
        )}

        {/* Populated Posts Grid */}
        {!isLoading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const postId = post._id || post.id;
              const isDeleting = deletingId === postId;
              const hasImage = Boolean(post.imageUrl && typeof post.imageUrl === 'string');

              return (
                <article
                  key={postId}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden backdrop-blur-sm transition-all hover:border-neutral-700 hover:shadow-lg"
                >
                  <div>
                    {/* Image Thumbnail with Fallback */}
                    {hasImage ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 border-b border-neutral-800">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            // If Cloudinary URL fails to load, gracefully display fallback placeholder
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          style={{ display: 'none' }}
                          className="h-full w-full items-center justify-center bg-neutral-900 text-neutral-500"
                        >
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative aspect-[21/9] w-full flex items-center justify-center bg-neutral-950/60 border-b border-neutral-800/80 text-neutral-600">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <ImageIcon className="h-4 w-4" />
                          <span>No Image Attached</span>
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-bold text-white tracking-tight line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line line-clamp-4">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  {/* Post Footer & Delete Action */}
                  <div className="px-5 pb-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      {post.authorId && (
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <User className="h-3.5 w-3.5 text-neutral-500" />
                          <span className="truncate max-w-[120px]">
                            {post.authorId.name || post.authorId.email || 'Author'}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDeletePost(postId)}
                      title="Delete post from MongoDB"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-red-950 hover:text-red-400 hover:border-red-500/30 border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border border-red-400 border-t-transparent" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
