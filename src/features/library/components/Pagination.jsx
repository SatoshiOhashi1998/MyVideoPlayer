export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        前へ
      </button>

      {Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1

        return (
          <button
            key={pageNumber}
            className={pageNumber === page ? 'active' : ''}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        )
      })}

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        次へ
      </button>
    </div>
  )
}