# It's Pi Day! Let's calculate pi using SQL

Happy Pi Day! We thought it would be fun to calculate pi using SQL queries in ClickHouse. Here is what we came up with so far...

1. This one uses the ClickHouse `numbers_mt` table function to return 1B rows and only takes 40ms to compute the calculation:

```sql
SELECT 4 * sum(if(number % 2, -1, 1) / ((number * 2) + 1))
FROM numbers_mt(1000000000.)

┌─multiply(4, sum(divide(if(modulo(number, 2), -1, 1), plus(multiply(number, 2), 1))))─┐
│                                                                   3.1415926525898294 │
└──────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.486 sec. Processed 1.00 billion rows, 8.00 GB (2.06 billion rows/s., 16.45 GB/s.)
```

2. The following example also processes 1B numbers, just not as quickly:

```sql
SELECT 3 + (4 * sum(if((number % 2) = 0, if((number % 4) = 0, -1 / ((number * (number + 1)) * (number + 2)), 1 / ((number * (number + 1)) * (number + 2))), 0))) AS number
FROM numbers_mt(2, 10000000000)

┌───────────number─┐
│ 3.14159265258081 │
└──────────────────┘

1 row in set. Elapsed: 9.648 sec. Processed 10.00 billion rows, 80.00 GB (1.04 billion rows/s., 8.29 GB/s.)
```

3. This one is obviously our favorite in ClickHouse (and the most accurate!):

```sql
SELECT pi()

┌──────────────pi()─┐
│ 3.141592653589793 │
└───────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

4. Someone knew their trigonometry with this one:

```sql
SELECT 2 * asin(1) AS pi

┌────────────────pi─┐
│ 3.141592653589793 │
└───────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

5. Here is a handy API that lets you specify the number of digits you want:

```sql
SELECT *
FROM url('https://api.pi.delivery/v1/pi?start=0&numberOfDigits=100', 'JSONEachRow')

┌───────────────content─┐
│ 3.1415926535897933e99 │
└───────────────────────┘

1 row in set. Elapsed: 0.556 sec.
```

:::note
If you have any more, we'd love for you to contribute. Thanks!
:::