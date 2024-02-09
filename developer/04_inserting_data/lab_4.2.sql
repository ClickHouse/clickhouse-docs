--Step 1:
DESCRIBE s3('https://learn-clickhouse.s3.us-east-2.amazonaws.com/uk_property_prices.snappy.parquet');

--Step 2:
CREATE TABLE uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, date);

--Step 3:
INSERT INTO uk_price_paid
    SELECT *
    FROM url('https://learn-clickhouse.s3.us-east-2.amazonaws.com/uk_property_prices.snappy.parquet');

--Step 4:
SELECT count()
FROM uk_price_paid;

--Step 5:
SELECT avg(price)
FROM uk_price_paid
WHERE postcode1 = 'LU1' AND postcode2 = '5FT';

-- The primary key contains postcode1 and postcode2 as the first two columns, so filtering by both allows ClickHouse to skip the most granules.

--Step 6:
SELECT avg(price)
FROM uk_price_paid
WHERE postcode2 = '5FT';

-- The postcode2 column is the second column in the primary key, which allows ClickHouse to avoid about 1/3 of the table.
-- Not bad, but note that the second value of a primary key is not as helpful in our dataset as the first column of the primary key.
-- This all depends on your dataset, but this query gives you an idea of how you should think through and test if a column will be useful before adding it to the primary key.
-- In this example, postcode2 seems beneficial (assuming we need to filter by postcode2 regularly.)

--Step 7:
SELECT avg(price)
FROM uk_price_paid
WHERE town = 'YORK';

-- The town column is not a part of the primary key, so the primary index does not provide any skipping of granules.

