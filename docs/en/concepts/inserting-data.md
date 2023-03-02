---
sidebar_position: 2
sidebar_label: Inserting Data
---

# Inserting Data into ClickHouse

You can use the familiar `INSERT INTO TABLE` command with ClickHouse, but it is important to understand that each insert into a `MergeTree` table causes a **part** to be created in storage. Even for a simple example, let's insert more than one row at a time:

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

- Notice the `timestamp` column is populated using various **Date** and **DateTime** functions. ClickHouse has hundreds of useful functions that you can [view in the **Functions** section](/en/sql-reference/functions/).

Let's verify it worked - you should see the four rows of data that were inserted.
```sql
SELECT * FROM helloworld.my_first_table
```

:::tip
Insert a large number of rows per batch - tens of thousands or even millions of rows at once. Don't worry - ClickHouse can easily handle that type of volume!
:::

:::tip
If you can not insert a lot of rows at once and you are using an HTTP client, use the [`async_insert` setting](../operations/settings/settings.md#async-insert), which batches your smaller inserts before inserting them into the table.
:::

## Integrating with ClickHouse

No matter where your data sits, there is likely a table function, table engine, or other type of tool available to insert your data into ClickHouse. Check out our [Integrations](../integrations/index.mdx) page for more details.