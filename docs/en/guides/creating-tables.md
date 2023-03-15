---
sidebar_position: 1
sidebar_label: Creating Tables
---

# Creating Tables in ClickHouse

 Like most database management systems, ClickHouse logically groups tables into **databases**. Use the `CREATE DATABASE` command to create a new database in ClickHouse:

  ```sql
  CREATE DATABASE IF NOT EXISTS helloworld
  ```

Similarly, use `CREATE TABLE` to define a new table. (If you do not specify the database name, the table will be in the
`default` database.) The following table named is `my_first_table` in the `helloworld` database:

  ```sql
  CREATE TABLE helloworld.my_first_table
  (
      user_id UInt32,
      message String,
      timestamp DateTime,
      metric Float32
  )
  ENGINE = MergeTree()
  PRIMARY KEY (user_id, timestamp)
  ```

In the example above, `my_first_table` is a `MergeTree` table with four columns:

- `user_id`:  a 32-bit unsigned integer
- `message`: a `String` data type, which replaces types like `VARCHAR`, `BLOB`, `CLOB` and others from other database systems
- `timestamp`: a `DateTime` value, which represents an instant in time
- `metric`: a 32-bit floating point number

  :::note
  The table engine determines:
   - How and where the data is stored
   - Which queries are supported
   - Whether or not the data is replicated

  There are many engines to choose from, but for a simple table on a single-node ClickHouse server, [MergeTree](/en/engines/table-engines/mergetree-family/mergetree.md) is your likely choice.
  :::

  ## A Brief Intro to Primary Keys

  Before you go any further, it is important to understand how primary keys work in ClickHouse (the implementation
  of primary keys might seem unexpected!):

    - primary keys in ClickHouse are **_not unique_** for each row in a table

  The primary key of a ClickHouse table determines how the data is sorted when written to disk. Every 8,192 rows or 10MB of
  data (referred to as the **index granularity**) creates an entry in the primary key index file. This granularity concept
  creates a **sparse index** that can easily fit in memory, and the granules represent a stripe of the smallest amount of
  column data that gets processed during `SELECT` queries.

  The primary key can be defined using the `PRIMARY KEY` parameter. If you define a table without a `PRIMARY KEY` specified,
  then the key becomes the tuple specified in the `ORDER BY` clause. If you specify both a `PRIMARY KEY ` and an `ORDER BY`, the primary key must be a subset of the sort order.

  The primary key is also the sorting key, which is a tuple of `(user_id, timestamp)`.  Therefore, the data stored in each
  column file will be sorted by `user_id`, then `timestamp`.

:::tip
For more details, check out the [Creating Databases and Tables](https://learn.clickhouse.com/visitor_catalog_class/show/1043458/) training course in ClickHouse Academy.
:::