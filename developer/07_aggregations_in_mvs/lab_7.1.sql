--Step 2:
CREATE TABLE prices_sum_dest
(
    town LowCardinality(String),
    sum_of_prices UInt64
)
ENGINE = SummingMergeTree
PRIMARY KEY town;

CREATE MATERIALIZED VIEW prices_sum_view
TO prices_sum_dest
AS
    SELECT
        town,
        sum(price) AS sum_of_prices
    FROM uk_price_paid
    GROUP BY town;

INSERT INTO prices_sum_dest
    SELECT
        town,
        sum(price) AS sum_of_prices
    FROM uk_price_paid
    GROUP BY town;

--Step 5:
SELECT
    town,
    sum(sum_of_prices) AS sum,
    formatReadableQuantity(sum)
FROM prices_sum_dest
GROUP BY town
ORDER BY sum DESC
LIMIT 10;
