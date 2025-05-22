
# system.table_engine

包含服务器支持的表引擎及其功能支持信息的描述。

此表包含以下列（列的类型在括号中显示）：

- `name` (String) — 表引擎的名称。
- `supports_settings` (UInt8) — 指示表引擎是否支持 `SETTINGS` 子句的标志。
- `supports_skipping_indices` (UInt8) — 指示表引擎是否支持 [数据跳过索引](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes) 的标志。
- `supports_ttl` (UInt8) — 指示表引擎是否支持 [生存时间 (TTL)](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 的标志。
- `supports_sort_order` (UInt8) — 指示表引擎是否支持子句 `PARTITION_BY`、`PRIMARY_KEY`、`ORDER_BY` 和 `SAMPLE_BY` 的标志。
- `supports_replication` (UInt8) — 指示表引擎是否支持 [数据复制](../../engines/table-engines/mergetree-family/replication.md) 的标志。
- `supports_duduplication` (UInt8) — 指示表引擎是否支持数据去重的标志。
- `supports_parallel_insert` (UInt8) — 指示表引擎是否支持并行插入（参见 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置）的标志。

示例：

```sql
SELECT *
FROM system.table_engines
WHERE name in ('Kafka', 'MergeTree', 'ReplicatedCollapsingMergeTree')
```

```text
┌─name──────────────────────────┬─supports_settings─┬─supports_skipping_indices─┬─supports_sort_order─┬─supports_ttl─┬─supports_replication─┬─supports_deduplication─┬─supports_parallel_insert─┐
│ MergeTree                     │                 1 │                         1 │                   1 │            1 │                    0 │                      0 │                        1 │
│ Kafka                         │                 1 │                         0 │                   0 │            0 │                    0 │                      0 │                        0 │
│ ReplicatedCollapsingMergeTree │                 1 │                         1 │                   1 │            1 │                    1 │                      1 │                        1 │
└───────────────────────────────┴───────────────────┴───────────────────────────┴─────────────────────┴──────────────┴──────────────────────┴────────────────────────┴──────────────────────────┘
```

**另见**

- MergeTree 家族 [查询子句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-query-clauses)
- Kafka [设置](/engines/table-engines/integrations/kafka#creating-a-table)
- Join [设置](../../engines/table-engines/special/join.md#join-limitations-and-settings)
