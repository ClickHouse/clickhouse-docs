---
description: "サーバーによってサポートされているテーブルエンジンの説明と、それらがサポートする機能の情報を含むシステムテーブル。"
slug: /operations/system-tables/table_engines
title: "system.table_engines"
keywords: ["system table", "table_engines"]
---

サーバーによってサポートされているテーブルエンジンとその機能サポート情報の説明を含みます。

このテーブルには以下のカラムが含まれています（カラムの型はカッコ内に示されています）：

- `name` (String) — テーブルエンジンの名前。
- `supports_settings` (UInt8) — テーブルエンジンが `SETTINGS` 句をサポートしているかどうかを示すフラグ。
- `supports_skipping_indices` (UInt8) — テーブルエンジンが [データスキッピングインデックス](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes) をサポートしているかどうかを示すフラグ。
- `supports_ttl` (UInt8) — テーブルエンジンが [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) をサポートしているかどうかを示すフラグ。
- `supports_sort_order` (UInt8) — テーブルエンジンが `PARTITION_BY`、`PRIMARY_KEY`、`ORDER_BY` および `SAMPLE_BY` 句をサポートしているかどうかを示すフラグ。
- `supports_replication` (UInt8) — テーブルエンジンが [データレプリケーション](../../engines/table-engines/mergetree-family/replication.md) をサポートしているかどうかを示すフラグ。
- `supports_deduplication` (UInt8) — テーブルエンジンがデータの重複排除をサポートしているかどうかを示すフラグ。
- `supports_parallel_insert` (UInt8) — テーブルエンジンが並列挿入をサポートしているかどうかを示すフラグ（[max_insert_threads](/operations/settings/settings#max_insert_threads) 設定を参照）。

例：

``` sql
SELECT *
FROM system.table_engines
WHERE name in ('Kafka', 'MergeTree', 'ReplicatedCollapsingMergeTree')
```

``` text
┌─name──────────────────────────┬─supports_settings─┬─supports_skipping_indices─┬─supports_sort_order─┬─supports_ttl─┬─supports_replication─┬─supports_deduplication─┬─supports_parallel_insert─┐
│ MergeTree                     │                 1 │                         1 │                   1 │            1 │                    0 │                      0 │                        1 │
│ Kafka                         │                 1 │                         0 │                   0 │            0 │                    0 │                      0 │                        0 │
│ ReplicatedCollapsingMergeTree │                 1 │                         1 │                   1 │            1 │                    1 │                      1 │                        1 │
└───────────────────────────────┴───────────────────┴───────────────────────────┴─────────────────────┴──────────────┴──────────────────────┴────────────────────────┴──────────────────────────┘
```

**参照**

- MergeTreeファミリーの [クエリ句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-query-clauses)
- Kafka [設定](/engines/table-engines/integrations/kafka#creating-a-table)
- ジョイン [設定](../../engines/table-engines/special/join.md#join-limitations-and-settings)
