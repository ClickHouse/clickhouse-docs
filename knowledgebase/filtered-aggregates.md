---
date: 2023-03-01
---

# Filtered aggregates in ClickHouse


ClickHouse provides a simple and intuitive way to write _filtered aggregates_. For example, compare the standard SQL way to write filtered aggregates (which work fine in ClickHouse) with the shorthand syntax using the `-If` [aggregate function combinator](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/combinators/), which can be appended to any aggregate function:

```sql
--standard SQL
SELECT
   avg(number)
FILTER (WHERE number > 50)
FROM numbers(100)

--ClickHouse using an aggregate combinator
SELECT
   avgIf(number, number > 50)
FROM numbers(100)
```

Similarly, there is a `-Distinct` aggregate combinator:

```sql
--standard SQL
SELECT avg(DISTINCT number)

--ClickHouse using an aggregate combinator
SELECT avgDistinct(number)
```

Why are filtered aggregates are important? Because they allow you to implement the **"segment comparison"** feature in web analytics services.
For example:

```sql
WITH
   Region = 'us' AS segment1,
   Browser = 'Chrome' AS segment2
SELECT
   uniqIf(UserID, segment1),
   uniqIf(UserID, segment2)
WHERE segment1 OR segment2
```

Check out the [aggregate function combinator](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/combinators/) page in the docs
for more details.
