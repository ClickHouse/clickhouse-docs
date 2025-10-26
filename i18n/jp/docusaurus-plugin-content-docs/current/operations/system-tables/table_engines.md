---
'description': 'システムテーブルは、サーバーがサポートするテーブルエンジンの説明と、それらがサポートする機能を含んでいます。'
'keywords':
- 'system table'
- 'table_engines'
'slug': '/operations/system-tables/table_engines'
'title': 'system.table_engines'
'doc_type': 'reference'
---


# system.table_engines

サーバーがサポートしているテーブルエンジンの説明と、その機能サポート情報を含みます。

このテーブルには以下のカラムが含まれています（カラムタイプは括弧内に示されています）：

- `name` (String) — テーブルエンジンの名前。
- `supports_settings` (UInt8) — テーブルエンジンが `SETTINGS` 句をサポートしているかどうかを示すフラグ。
- `supports_skipping_indices` (UInt8) — テーブルエンジンが [データスキッピングインデックス](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes) をサポートしているかどうかを示すフラグ。
- `supports_ttl` (UInt8) — テーブルエンジンが [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) をサポートしているかどうかを示すフラグ。
- `supports_sort_order` (UInt8) — テーブルエンジンが `PARTITION_BY`、`PRIMARY_KEY`、`ORDER_BY` および `SAMPLE_BY` 句をサポートしているかどうかを示すフラグ。
- `supports_replication` (UInt8) — テーブルエンジンが [データレプリケーション](../../engines/table-engines/mergetree-family/replication.md) をサポートしているかどうかを示すフラグ。
- `supports_duduplication` (UInt8) — テーブルエンジンがデータの重複排除をサポートしているかどうかを示すフラグ。
- `supports_parallel_insert` (UInt8) — テーブルエンジンが並行挿入をサポートしているかどうかを示すフラグ（[`max_insert_threads`](/operations/settings/settings#max_insert_threads) 設定を参照）。

例：

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

**関連情報**

- MergeTreeファミリーの [クエリ句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-query-clauses)
- Kafkaの [設定](/engines/table-engines/integrations/kafka#creating-a-table)
- Joinの [設定](../../engines/table-engines/special/join.md#join-limitations-and-settings)
