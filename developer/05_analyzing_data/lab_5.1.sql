--Step 1:
SELECT *
FROM uk_price_paid
WHERE price >= 100_000_000
ORDER BY price desc;

--Step 2:
SELECT count()
FROM uk_price_paid
WHERE price > 1_000_000;

--Step 3:
SELECT uniqExact(town)
FROM uk_price_paid;

--Step 4:
SELECT
    town,
    count() AS c
FROM uk_price_paid
GROUP BY town
ORDER BY c DESC
LIMIT 1;

--Step 5:
SELECT topKIf(10)(town, town != 'LONDON')
FROM uk_price_paid;

--Step 6:
SELECT
    town,
    avg(price) AS avg_price
FROM uk_price_paid
GROUP BY town
ORDER BY avg_price DESC
LIMIT 10;

--Step 7:
SELECT
    argMax(addr1, price),
    argMax(addr2, price),
    argMax(street, price),
    argMax(town, price)
FROM uk_price_paid;

SELECT
    addr1,
    addr2,
    street,
    town
FROM uk_price_paid
ORDER BY price DESC
LIMIT 1;

--Step 8:
SELECT
    avgIf(price, type = 'detached'),
    avgIf(price, type = 'semi-detached'),
    avgIf(price, type = 'terraced'),
    avgIf(price, type = 'flat'),
    avgIf(price, type = 'other')
FROM uk_price_paid;

--Step 9:
SELECT
    formatReadableQuantity(sum(price))
FROM uk_price_paid
WHERE
    county IN ['AVON','ESSEX','DEVON','KENT','CORNWALL']
    AND
    date >= toDate('2020-01-01') AND date <= toDate('2020-12-31');


--Step 10:
SELECT
    toStartOfMonth(date) AS month,
    avg(price) AS avg_price
FROM uk_price_paid
WHERE
    date >= toDate('2005-01-01') AND date <= toDate('2010-12-31')
GROUP BY month
ORDER BY month ASC;

--Step 11:
SELECT
    toStartOfDay(date) AS day,
    count()
FROM uk_price_paid
WHERE
    town = 'LIVERPOOL'
    AND date >= toDate('2020-01-01') AND date <= toDate('2020-12-31')
GROUP BY day
ORDER BY day ASC;

--Step 12:
WITH (
    SELECT max(price)
    FROM uk_price_paid
) AS overall_max
SELECT
    town,
    max(price) / overall_max
FROM uk_price_paid
GROUP BY town
ORDER BY 2 DESC;
