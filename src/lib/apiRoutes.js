export const API_ROUTES = {
    // books
    BOOKS: "/books",
    BOOK_BY_ID: (id) => `/books/${id}`,

    // library
    LIBRARY_ME: "/library/me",
    LIBRARY_ADD: "/library", // POST { bookId, shelf }
    LIBRARY_PROGRESS_BY_ID: (libraryId) => `/library/${libraryId}/progress`, // PATCH { pagesRead } or { progressType, ... }

    // reviews
    REVIEWS_BY_BOOK: (bookId) => `/reviews/approved?bookId=${bookId}`, // GET approved reviews
    REVIEW_CREATE: "/reviews", // POST new review (pending)
};
