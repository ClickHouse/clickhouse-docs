---
date: 2023-06-07
---

# How to determine a query's processing time without returning any rows

## Question

My query is returning many rows but I'm only interested in the query processing time. How do I omit the query output and check for query processing time?

## Answer

Append `FORMAT Null` to your query to configure the output format to `Null`. This prevents data from being transmitted to the client.

For example:

```sql
SELECT
    customer_id,
    count() AS total,
    any(review_headline)
FROM amazon_reviews
GROUP BY customer_id
ORDER BY total DESC
FORMAT Null
```

The response will return the number of rows processed and the elapsed time, but 0 rows will be returned:

```response
0 rows in set. Elapsed: 25.288 sec. Processed 222.04 million rows, 13.50 GB (8.78 million rows/s., 533.77 MB/s.)
```
