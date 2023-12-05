---
date: 2023-12-05
---

# Detach a partition in ClickHouse Cloud

Techincally, it is not possible to detach a partition in ClickHouse Cloud. However, you can move a partition between tables or copy it to a new table and drop it from the old table. This can be a useful strategy to employ with aging data where the tables are partitioned by timeframe. 

## Move a partition between the tables

```sql
ALTER TABLE db1.table1_partition_test MOVE PARTITION 'a' TO TABLE db1.table2_partition_test;
```

## Copy the partition to a new table and drop the partition from the old table

```sql
ALTER TABLE db1.table2_partition_test ATTACH PARTITION 'a' FROM db1.table1_partition_test;
ALTER TABLE db1.table1_partition_test DROP PARTITION 'a';
```

More details on [manipulating partitions and parts](../docs/en/sql-reference/statements/alter/partition.md).
