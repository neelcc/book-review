// src/pages/BookDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./BookDetail.css";

function BookDetail() {
  const { id } = useParams(); // book id from url
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKENDURL = process.env.REACT_APP_BACKEND_URL;


  // review form state
  const [user, setUser] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line
  }, [id]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKENDURL}/api/books/${id}`);
      setBook(res.data);
    } catch (err) {
      console.error("Error fetching book:", err);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText || rating === 0) {
      return alert("Please enter a review and select a rating.");
    }

    setSubmitting(true);
    try {
      console.log(id);

      await axios.post(`${BACKENDURL}/api/books/${id}/reviews`, {
        user: user || "Anonymous",
        comment: reviewText,
        rating,
      });

      // Clear inputs
      setUser("");
      setReviewText("");
      setRating(0);

      // Refresh book to get updated reviews and rating
      await fetchBook();
    } catch (err) {
      console.error("Error adding review:", err);
      alert("Failed to add review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!book) {
    return <div className="error">Book not found.</div>;
  }

  return (
    <div className="book-detail-container">
      <Link to="/explore" className="back-btn">← Back to Explore</Link>

      <div className="book-detail-card">
        <img
          src={book.cover || book.image || "https://via.placeholder.com/250x350"}
          alt={book.title}
          className="detail-cover"
          onError={(e) => (e.target.src = "https://via.placeholder.com/250x350")}
        />

        <div className="detail-info">
          <h1>{book.title}</h1>
          <h3>by {book.author}</h3>
          <p className="short-desc">{book.description}</p>
          <p className="rating">⭐ {book.rating || "0.0"}</p>

          <h4>Reviews:</h4>
          {book.reviews && book.reviews.length > 0 ? (
            <ul className="reviews-list">
              {book.reviews.map((r, i) => (
                <li key={r._id || i} className="review-item">
                  <div className="review-header">
                    <strong>{r.user || "Anonymous"}</strong>
                    {r.rating !== undefined && (
                      <span className="review-rating"> — ⭐ {r.rating}</span>
                    )}
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  <small className="review-date">{new Date(r.date).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews yet.</p>
          )}

          {/* Add Review Form */}
          <div className="add-review-section">
            <h4>Add a Review</h4>
            <form onSubmit={handleAddReview} className="review-form">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />

              <textarea
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="3"
              />

              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value="0">Select rating</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} ⭐
                  </option>
                ))}
              </select>

              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
