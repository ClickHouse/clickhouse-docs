---
date: 2023-05-18
---

# How to calculate the ratio of empty/zero values in every column in a table

If a column is sparse (empty or contains mostly zeros), ClickHouse can encode it in a sparse format and automatically optimize calculations - the data does not require full decompression during queries. In fact, if you know how sparse a column is, you can define its ratio using the [`ratio_of_defaults_for_sparse_serialization` setting](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#ratio_of_defaults_for_sparse_serialization) to optimize serialization.

This handy query can take a while, but it analyzes every row in your table and determines the ratio of values that are zero (or the default) in every column in the specified table:

```sql
SELECT *
    APPLY x -> (x = defaultValueOfArgumentType(x)) APPLY avg APPLY x -> round(x, 3)
FROM table_name
FORMAT Vertical
```

For example, we ran this query above on the [environmental sensors dataset](https://clickhouse.com/docs/en/getting-started/example-datasets/environmental-sensors) table named `sensors` which has over 20B rows and 19 columns:

```sql
SELECT *
    APPLY x -> (x = defaultValueOfArgumentType(x)) APPLY avg APPLY x -> round(x, 3)
FROM sensors
FORMAT Vertical
```

Here is response:

```response

Row 1:
──────
round(avg(equals(sensor_id, defaultValueOfArgumentType(sensor_id))), 3):                 0
round(avg(equals(sensor_type, defaultValueOfArgumentType(sensor_type))), 3):             0.159
round(avg(equals(location, defaultValueOfArgumentType(location))), 3):                   0
round(avg(equals(lat, defaultValueOfArgumentType(lat))), 3):                             0.001
round(avg(equals(lon, defaultValueOfArgumentType(lon))), 3):                             0.001
round(avg(equals(timestamp, defaultValueOfArgumentType(timestamp))), 3):                 0
round(avg(equals(P1, defaultValueOfArgumentType(P1))), 3):                               0.474
round(avg(equals(P2, defaultValueOfArgumentType(P2))), 3):                               0.475
round(avg(equals(P0, defaultValueOfArgumentType(P0))), 3):                               0.995
round(avg(equals(durP1, defaultValueOfArgumentType(durP1))), 3):                         0.999
round(avg(equals(ratioP1, defaultValueOfArgumentType(ratioP1))), 3):                     0.999
round(avg(equals(durP2, defaultValueOfArgumentType(durP2))), 3):                         1
round(avg(equals(ratioP2, defaultValueOfArgumentType(ratioP2))), 3):                     1
round(avg(equals(pressure, defaultValueOfArgumentType(pressure))), 3):                   0.83
round(avg(equals(altitude, defaultValueOfArgumentType(altitude))), 3):                   1
round(avg(equals(pressure_sealevel, defaultValueOfArgumentType(pressure_sealevel))), 3): 1
round(avg(equals(temperature, defaultValueOfArgumentType(temperature))), 3):             0.532
round(avg(equals(humidity, defaultValueOfArgumentType(humidity))), 3):                   0.544

1 row in set. Elapsed: 992.041 sec. Processed 20.69 billion rows, 1.39 TB (20.86 million rows/s., 1.40 GB/s.)
```

From the results above:

- the `sensor_id` columns is not sparse at all. In fact, every row has a non-zero value
- the `sensor_type` is only sparse about 15.9% of the time
- the `P0` column is very sparse: 99.9% of the values are zero
- the `pressure` column is quite sparse at 83%
- and `temperature` column has 53.2% of its values missing or zero

Like we said, it's a handy query for computing how sparse your columns are in a ClickHouse table!