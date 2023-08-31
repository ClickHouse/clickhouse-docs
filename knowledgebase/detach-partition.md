---
date: 2023-08-30
---

# Is it possible to detach a partition in ClickHouse Cloud? {#is-it-possible-to-detach-a-partition-in-clickhouse-cloud}

While ClickHouse Cloud does not allow detaching partitions, you can move a partition between tables or copy it to a new table and drop it from the old table. This can be a useful strategy to employ with aging data where the tables are partitioned by timeframe. 

## Move a partition between the tables

```
ALTER TABLE db1.table1_partition_test MOVE PARTITION 'a' TO TABLE db1.table2_partition_test;
```

## Copy the partition to a new table and drop the partition from the old table


```
ALTER TABLE db1.table2_partition_test ATTACH PARTITION 'a' FROM db1.table1_partition_test;
ALTER TABLE db1.table1_partition_test DROP PARTITION 'a';
```


More details on [detaching partitions](https://clickhouse.com/docs/en/sql-reference/statements/alter/partition#detach-partitionpart).
