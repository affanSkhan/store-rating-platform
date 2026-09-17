export default function RatingStars({ value = 0, interactive = false, onChange }) {
  const current = Number(value) || 0;
  return (
    <div className="stars" role={interactive ? 'radiogroup' : undefined} aria-label={`Rating ${current} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= current ? 'star active' : 'star'}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
