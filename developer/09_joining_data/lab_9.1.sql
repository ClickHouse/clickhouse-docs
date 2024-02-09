--Step 1:
SELECT *
FROM s3('https://learnclickhouse.s3.us-east-2.amazonaws.com/datasets/mortgage_rates.csv');

--Step 2:
CREATE DICTIONARY uk_mortgage_rates (
    date DateTime64,
    variable Decimal32(2),
    fixed Decimal32(2),
    bank Decimal32(2)
)
PRIMARY KEY date
SOURCE(
  HTTP(
   url 'https://learnclickhouse.s3.us-east-2.amazonaws.com/datasets/mortgage_rates.csv'
   format 'CSVWithNames'
  )
)
LAYOUT(COMPLEX_KEY_HASHED())
LIFETIME(2628000000);


--Step 4:
WITH
    toStartOfMonth(uk_price_paid.date) AS month
SELECT
    month,
    count(),
    any(variable),
FROM uk_price_paid
JOIN uk_mortgage_rates
ON month = toStartOfMonth(uk_mortgage_rates.date)
GROUP BY month;

--Step 5:
WITH
    toStartOfMonth(uk_price_paid.date) AS month
SELECT
    month,
    count(),
    any(variable),
FROM uk_price_paid
JOIN uk_mortgage_rates
ON month = toStartOfMonth(uk_mortgage_rates.date)
WHERE month >= toDate('2000-01-01')
GROUP BY month
ORDER BY 2 DESC;

--Step 6:
SELECT
    corr(toFloat32(count),toFloat32(variable))
FROM (
    WITH
        toStartOfMonth(uk_price_paid.date) AS month
    SELECT
        month,
        count() AS count,
        any(variable) AS variable
    FROM uk_price_paid
    JOIN uk_mortgage_rates
    ON month = toStartOfMonth(uk_mortgage_rates.date)
    GROUP BY month
);

--Step 7:
SELECT
    corr(toFloat32(count),toFloat32(fixed))
FROM (
    WITH
        toStartOfMonth(uk_price_paid.date) AS month
    SELECT
        month,
        count() AS count,
        any(fixed) AS fixed
    FROM uk_price_paid
    JOIN uk_mortgage_rates
    ON month = toStartOfMonth(uk_mortgage_rates.date)
    WHERE month >= toDate('2000-01-01')
    GROUP BY month
);