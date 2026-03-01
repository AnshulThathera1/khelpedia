import Link from "next/link";

export default function Pagination({ currentPage, totalPages, searchParams }) {
    if (totalPages <= 1) return null;

    const getPageUrl = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page);
        return `/tournaments?${params.toString()}`;
    };

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        // Simple logic to show current, first, last, and neighbors
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            pages.push(i);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            pages.push("...");
        }
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "3rem", flexWrap: "wrap" }}>
            <Link
                href={getPageUrl(Math.max(1, currentPage - 1))}
                className={`filter-chip ${currentPage === 1 ? 'disabled' : ''}`}
                style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
                ← Prev
            </Link>

            {pages.map((p, idx) => (
                p === "..." ? (
                    <span key={`dots-${idx}`} style={{ padding: "6px 12px", color: "var(--text-muted)" }}>...</span>
                ) : (
                    <Link
                        key={p}
                        href={getPageUrl(p)}
                        className={`filter-chip ${currentPage === p ? 'active' : ''}`}
                    >
                        {p}
                    </Link>
                )
            ))}

            <Link
                href={getPageUrl(Math.min(totalPages, currentPage + 1))}
                className={`filter-chip ${currentPage === totalPages ? 'disabled' : ''}`}
                style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
                Next →
            </Link>
        </div>
    );
}
