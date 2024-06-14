---
title: "How do I check compression ratios for my data in ClickHouse?"
---

## Question

How do I check compression ratios for my data in ClickHouse?

## Answer

As described in [this blog post](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema), you can check compression ratios with the following query:

```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = '<table>'
GROUP BY name
ORDER BY sum(data_compressed_bytes) DESC
```

However, using this depends on whether the data parts are compact or in-memory (these don't have per column statistics) so it would show zero for them. You can check the part_type column from system.parts table for it.

What I would recommend though is to check the parts table for compression. You can just replace the query you have with system.parts instead of system.columns.

There's also this query that you can use as well:

```sql
SELECT
    disk_name,
    database,
    table,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    round(usize / size, 2) AS compr_rate, sum(rows) AS rows,
    count() AS part_count
FROM system.parts
WHERE (active = 1)
AND (table LIKE '%')
AND (database LIKE '%')
GROUP BY disk_name, database, table
ORDER BY size DESC;
```

Whether compact or wide parts are used by default depends on the amount of data that's getting ingested into parts - this determines whether it is going to be stored in compact or wide format:

- In Wide format each column is stored in a separate file in a filesystem
- In Compact format all columns are stored in one file.

The settings that determine this are the `min_bytes_for_wide_part` and `min_rows_for_wide_part` settings of the table engine. If the number of bytes or rows in a data part is less then the corresponding values, the part is stored in Compact format. Otherwise it is stored in Wide format.

So to check the compression ratio, looking at the system.parts table is probably the best bet.
