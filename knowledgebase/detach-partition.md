---
title: Is it possible to detach a partition in ClickHouse Cloud?
description: "While ClickHouse Cloud does not allow detaching partitions, you can move a partition between tables."
date: 2023-08-30
---

# Is it possible to detach a partition in ClickHouse Cloud? {#is-it-possible-to-detach-a-partition-in-clickhouse-cloud}

While ClickHouse Cloud does not allow detaching partitions, you can use this approach to move a partition between the tables:

For example:
`ALTER TABLE db1.table1_partition_test MOVE PARTITION 'a' TO TABLE db1.table2_partition_test;`

Alternatively, you can copy the partition to the new table and drop the partition form the old table:
```
ALTER TABLE db1.table2_partition_test ATTACH PARTITION 'a' FROM db1.table1_partition_test;
ALTER TABLE db1.table1_partition_test DROP PARTITION 'a';
```


More details on [detaching partitions](https://clickhouse.com/docs/en/sql-reference/statements/alter/partition#detach-partitionpart).
