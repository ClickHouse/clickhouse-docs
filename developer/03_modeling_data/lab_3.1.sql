--Step 3:
SELECT uniqExact(COUNTRY_CODE)
FROM pypi;

-- You will notice there are only 186 unique values of the country code, which makes it a great candidate for LowCardinality.

--Step 4:
SELECT
    uniqExact(PROJECT),
    uniqExact(URL)
FROM pypi;

-- There are over 24,000 unique values of PROJECT, which is large - but not too large. We will try LowCardinality on this column as well and see if it improves storage and query performance. The URL has over 79,000 unique values, and we can assume that a URL could have a lot of different values, so it is probably a bad choice for LowCardinality.

--Step 5:
CREATE TABLE pypi3 (
    TIMESTAMP DateTime,
    COUNTRY_CODE LowCardinality(String),
    URL String,
    PROJECT LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (PROJECT, TIMESTAMP);

INSERT INTO pypi3
    SELECT * FROM pypi2;
