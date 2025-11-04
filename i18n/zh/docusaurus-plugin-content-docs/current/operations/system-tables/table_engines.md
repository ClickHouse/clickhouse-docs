---
'description': '系统表，包含服务器支持的表引擎及其支持的功能的描述。'
'keywords':
- 'system table'
- 'table_engines'
'slug': '/operations/system-tables/table_engines'
'title': 'system.table_engines'
'doc_type': 'reference'
---


# system.table_engines

包含服务器支持的表引擎的描述及其功能支持信息。

该表包含以下列（列类型以括号表示）：

- `name` (String) — 表引擎的名称。
- `supports_settings` (UInt8) — 表示表引擎是否支持 `SETTINGS` 子句的标志。
- `supports_skipping_indices` (UInt8) — 表示表引擎是否支持 [数据跳过索引](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes) 的标志。
- `supports_ttl` (UInt8) — 表示表引擎是否支持 [生存时间 (TTL)](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 的标志。
- `supports_sort_order` (UInt8) — 表示表引擎是否支持子句 `PARTITION_BY`、`PRIMARY_KEY`、`ORDER_BY` 和 `SAMPLE_BY` 的标志。
- `supports_replication` (UInt8) — 表示表引擎是否支持 [数据复制](../../engines/table-engines/mergetree-family/replication.md) 的标志。
- `supports_deduplication` (UInt8) — 表示表引擎是否支持数据去重的标志。
- `supports_parallel_insert` (UInt8) — 表示表引擎是否支持并行插入（参见 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置）的标志。

示例：

```sql
SELECT *
FROM system.table_engines
WHERE name IN ('Kafka', 'MergeTree', 'ReplicatedCollapsingMergeTree')
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
