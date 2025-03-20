# Execute SYSTEM statements on all nodes in ClickHouse Cloud

In order to execute the same [query](url) on all nodes of a ClickHouse cloud service, we can use [clusterAllReplicas](https://clickhouse.com/docs/en/sql-reference/table-functions/cluster/).
E.g. in order to get entries from a (node-local) system table from all nodes, you can use:
```
SELECT ... FROM clusterAllReplicas(default, system.TABLE) ...;
```

Similarly, you can execute the same [SYSTEM statement](https://clickhouse.com/docs/en/sql-reference/statements/system/) on all nodes with a single statement, by using the [ON CLUSTER](https://clickhouse.com/docs/en/sql-reference/distributed-ddl/) clause:
```
SYSTEM ... ON CLUSTER default;
```

For example for [dropping the filesystem cache](https://clickhouse.com/docs/en/sql-reference/statements/system/#drop-filesystem-cache) from all nodes, you can use:
```
SYSTEM DROP FILESYSTEM CACHE ON CLUSTER default;
```
