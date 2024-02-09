--Step 3:
ALTER TABLE uk_price_paid
    ADD INDEX county_index county
    TYPE set(10)
    GRANULARITY 5;

--Step 4:
ALTER TABLE uk_price_paid
    MATERIALIZE INDEX county_index;

--Step 6:
About 6.6M rows were scanned, instead of the entire 28M rows.

--Step 8:
ALTER TABLE uk_price_paid
DROP INDEX county_index;

--Step 9:
ALTER TABLE uk_price_paid
    ADD INDEX county_index county
    TYPE set(10)
    GRANULARITY 1;

--Step 10:
ALTER TABLE uk_price_paid
    MATERIALIZE INDEX county_index;

--Step 12:
EXPLAIN indexes = 1 SELECT
    formatReadableQuantity(count()),
    avg(price)
FROM uk_price_paid
WHERE county = 'GREATER LONDON';
