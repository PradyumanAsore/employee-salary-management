# Performance Considerations

## Scale

The system manages approximately 10,000 employees. This is a modest dataset — well within a single-server architecture.

## Database

### Indexes

| Column(s) | Purpose | Impact |
|-----------|---------|--------|
| `employee_id` (UNIQUE) | Lookup by HR-assigned ID | Fast exact-match lookups |
| `email` (UNIQUE) | Uniqueness enforcement, login-ready | Prevents duplicates efficiently |
| `department` | Filter queries | Avoids full table scan for department filters |
| `country` | Filter queries | Avoids full table scan for country filters |
| `(last_name, first_name)` | Composite index for default sort and name search | Covers the most common ordering |

### Query Efficiency

- **List endpoint:** Uses Django ORM with `.filter()` chains — one SQL query per page, no N+1
- **Analytics:** Uses `.values().annotate()` — single SQL query per analytics endpoint with `GROUP BY`
- **Median:** Computed in Python since SQLite lacks a median aggregate. For the ~10K dataset, fetching sorted salary values per currency (max ~3,500 values) is fast enough (<50ms)
- **Pagination:** Enforced at the API level (max 100 per page). No endpoint returns all 10K records

### Decisions We Made

| Decision | Rationale |
|----------|-----------|
| No caching layer | 10K records + SQLite is fast enough without Redis/Memcached |
| No search index | Django ORM's `icontains` is sufficient at this scale. A 10K-row `LIKE` query on indexed columns is fast |
| Bulk create for seed | `bulk_create()` in batches of 1,000 completes in ~15 seconds for 10K records |
| No query optimization (select_related/prefetch) | Single model, no foreign keys, so no N+1 risk |

### What We'd Change at 100K+ Records

- Add PostgreSQL full-text search or Elasticsearch for search
- Cache analytics results (they change infrequently)
- Consider materialized views for department/country aggregations
- PostgreSQL's `percentile_cont` for native median calculation
- Database connection pooling

## Frontend

- **Debounced search:** 300ms delay prevents excessive API calls while typing
- **Pagination:** Client requests only 25 records per page
- **No client-side state management library:** React `useState` is sufficient for this scope
- **Code splitting:** Vite's automatic chunk splitting ensures reasonable bundle sizes
