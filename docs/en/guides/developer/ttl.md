---
slug: /en/guides/developer/ttl
sidebar_label: Manage Data with TTL
sidebar_position: 2
keywords: [ttl, time to live, clickhouse, old, data]
---

# Manage Data with TTL (Time-to-live)

## Overview of TTL

TTL (time-to-live) refers to the capability of having rows or columns moved, deleted, or rolled up after a certain interval of time has passed. While the expression "time-to-live" sounds like it only applies to deleting old data, TTL has several use cases:

- Removing old data: no surprise, you can delete rows or columns after a specified time interval
- Moving data between disks: after a certain amount of time, you can move data between storage volumes - useful for deploying a hot/warm/cold architecture
- Data rollup: rollup your older data into various useful aggregations and computations before deleting it

:::note
TTL can be applied to entire tables or specific columns.
:::

## TTL Syntax

The `TTL` clause can appear after a column definition and/or at the end of the table definition. Use the `INTERVAL` clause to define a length of time (which needs to be a `Date` or `DateTime` data type). For example, the following table has two columns
with `TTL` clauses:

```sql
CREATE TABLE example1 (
   timestamp DateTime,
   x UInt32 TTL now() + INTERVAL 1 MONTH,
   y String TTL timestamp + INTERVAL 1 DAY,
   z String
)
ENGINE = MergeTree
ORDER BY tuple()
```

- The x column has a time to live of 1 month from now
- The y column has a time to live of 1 day from the timestamp column:
- When the interval lapses, the column expires. ClickHouse replaces the column value with the default value of its data type. If all the column values in the data part expire, ClickHouse deletes this column from the data part in the filesystem.

:::note
TTL rules can be altered or deleted. See the [Manipulations with Table TTL](/docs/en/sql-reference/statements/alter/ttl.md) page for more details.
:::

## Triggering TTL Events

The deleting or aggregating of expired rows is not immediate - it only occurs during table merges. If you have a table that's not actively merging (for whatever reason), there are two settings that trigger TTL events:

- `merge_with_ttl_timeout`: the minimum delay in seconds before repeating a merge with delete TTL. The default is 14400 seconds (4 hours).
- `merge_with_recompression_ttl_timeout`: the minimum delay in seconds before repeating a merge with recompression TTL (rules that roll up data before deleting). Default value: 14400 seconds (4 hours).

So by default, your TTL rules will be applied to your table at least once every 4 hours. Just modify the settings above if you need your TTL rules applied more frequently.

:::note
Not a great solution (or one that we recommend you use frequently), but you can also force a merge using `OPTIMIZE`:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` initializes an unscheduled merge of the parts of your table, and `FINAL` forces a reoptimization if your table is already a single part.
:::

## Removing Rows

To remove entire rows from a table after a certain amount of time, define the TTL rule at the table level:

```sql
CREATE TABLE customers (
timestamp DateTime,
name String,
balance Int32,
address String
)
ENGINE = MergeTree
ORDER BY timestamp
TTL timestamp + INTERVAL 12 HOUR
```

## Removing Columns

Instead of deleting the entire row, suppose you want just the balance and address columns to expire. Let's modify the `customers` table and add a TTL for both columns to be 2 hours:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## Implementing a Rollup
Suppose we want to delete rows after a certain amount of time but hang on to some of the data for reporting purposes. We don't want all the details - just a few aggregated results of historical data. This can be implemented by adding a `GROUP BY` clause to your `TTL` expression, along with some columns in your table to store the aggregated results.

Suppose in the following `hits` table we want to delete old rows, but hang on to the sum and maximum of the `hits` columns before removing the rows. We will need a field to store those values in, and we will need to add a `GROUP BY` clause to the `TTL` clause that rolls up the sum and maximum:

```sql
CREATE TABLE hits (
   timestamp DateTime,
   id String,
   hits Int32,
   max_hits Int32 DEFAULT hits,
   sum_hits Int64 DEFAULT hits
)
ENGINE = MergeTree
PRIMARY KEY (id, toStartOfDay(timestamp), timestamp)
TTL timestamp + INTERVAL 1 DAY
    GROUP BY id, toStartOfDay(timestamp)
    SET
        max_hits = max(max_hits),
        sum_hits = sum(sum_hits);
```

Some notes on the `hits` table:

- The `GROUP BY` columns in the `TTL` clause must be a prefix of the `PRIMARY KEY`, and we want to group our results by the start of the day. Therefore, `toStartOfDay(timestamp)` was added to the primary key
- We added two fields to store the aggregated results: `max_hits` and `sum_hits`
- Setting the default value of `max_hits` and `sum_hits` to `hits` is necessary for our logic to work, based on how the `SET` clause is defined

## Implementing a hot/warm/cold architecture

:::note
If you are using ClickHouse Cloud, the steps in the lesson are not applicable. You do not need to worry about moving old data around in ClickHouse Cloud.
:::

A common practice when working with large amounts of data is to move that data around as it gets older. Here are the steps for implementing a hot/warm/cold architecture in ClickHouse using the `TO DISK` and `TO VOLUME` clauses of the `TTL` command. (By the way, it doesn't have to be a hot and cold thing - you can use TTL to move data around for whatever use case you have.)

1. The `TO DISK` and `TO VOLUME` options refer to the names of disks or volumes defined in your ClickHouse configuration files. Create a new file named `my_system.xml` (or any file name) that defines your disks, then define volumes that use your disks.  Place the XML file in `/etc/clickhouse-server/config.d/` to have the configuration applied to your system:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <default>
            </default>
           <hot_disk>
              <path>./hot/</path>
           </hot_disk>
           <warm_disk>
              <path>./warm/</path>
           </warm_disk>
           <cold_disk>
              <path>./cold/</path>
           </cold_disk>
        </disks>
        <policies>
            <default>
                <volumes>
                    <default>
                        <disk>default</disk>
                    </default>
                    <hot_volume>
                        <disk>hot_disk</disk>
                    </hot_volume>
                    <warm_volume>
                        <disk>warm_disk</disk>
                    </warm_volume>
                    <cold_volume>
                        <disk>cold_disk</disk>
                    </cold_volume>
                </volumes>
            </default>
        </policies>
    </storage_configuration>
</clickhouse>
```

2. The configuration above refers to three disks that point to folders that ClickHouse can read from and write to. Volumes can contain one or more disks - we defined a volume for each of the three disks. Let's view the disks:

```sql
SELECT name, path, free_space, total_space
FROM system.disks
```

```response
┌─name────────┬─path───────────┬───free_space─┬──total_space─┐
│ cold_disk   │ ./data/cold/   │ 179143311360 │ 494384795648 │
│ default     │ ./             │ 179143311360 │ 494384795648 │
│ hot_disk    │ ./data/hot/    │ 179143311360 │ 494384795648 │
│ medium_disk │ ./data/medium/ │ 179143311360 │ 494384795648 │
└─────────────┴────────────────┴──────────────┴──────────────┘
```

3. And…let's verify the volumes:

```sql
SELECT
    volume_name,
    disks
FROM system.storage_policies
```

```response
┌─volume_name─┬─disks─────────┐
│ default     │ ['default']   │
│ hot_volume  │ ['hot_disk']  │
│ warm_volume │ ['warm_disk'] │
│ cold_volume │ ['cold_disk'] │
└─────────────┴───────────────┘
```

4. Now we will add a `TTL` rule that moves the data between the hot, warm and cold volumes:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. The new `TTL` rule should materialize, but you can force it to make sure:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. Verify your data has moved to its expected disks using the `system.parts` table:

```sql
Using the system.parts table, view which disks the parts are on for the crypto_prices table:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

The response will look like:

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
