--Step 6:
SELECT
    PROJECT,
    count() AS c
FROM pypi
GROUP BY PROJECT
ORDER BY c DESC
LIMIT 100;

--Step 7:
-- All of the rows were read, because the query had no WHERE clause - so ClickHouse needed to process every granule.

--Step 9:
SELECT
    PROJECT,
    count() AS c
FROM pypi
WHERE toStartOfMonth(TIMESTAMP) = '2023-04-01'
GROUP BY PROJECT
ORDER BY c DESC
LIMIT 100;

--Step 10:
--Your answer may vary by a granule or two, but the query only has to process 565,248 rows, which is exactly 8,192 x 69. So the query processed 69 granules instead of performing a scan of the entire table. Why? Because the primary key is the TIMESTAMP column, which allows ClickHouse to skip about 1/4 of the data.

--Step 12:
--The PROJECT column is not in the primary key, so the primary index is no help in skipping granules.

--Step 14:
--None. Even though PROJECT was added to the primary key, it did not allow ClickHouse to skip any granules. Why? Because the TIMESTAMP has a high cardinality that is making any subsequent columns in the primary key difficult to be useful.

--Step 16:
--The first column of the primary key is an important and powerful design decision. By putting PROJECT first, we are assuring that our queries that filter by PROJECT will process a minimum amount of rows.