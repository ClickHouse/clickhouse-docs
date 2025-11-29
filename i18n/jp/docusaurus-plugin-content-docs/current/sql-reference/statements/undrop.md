---
description: 'UNDROP TABLE 文のドキュメント'
sidebar_label: 'UNDROP'
slug: /sql-reference/statements/undrop
title: 'UNDROP TABLE'
doc_type: 'reference'
---

# UNDROP TABLE {#undrop-table}

テーブルの削除を取り消します。

ClickHouse バージョン 23.3 以降では、Atomic データベース内で `DROP TABLE` ステートメントを実行してから `database_atomic_delay_before_drop_table_sec`（デフォルトでは 8 分）以内であれば、そのテーブルを UNDROP できます。削除されたテーブルは `system.dropped_tables` というシステムテーブルに一覧表示されます。

削除されたテーブルに関連付けられており、`TO` 句を持たないマテリアライズドビューがある場合は、そのビューのインナーテーブルも UNDROP する必要があります。

:::tip
[DROP TABLE](/sql-reference/statements/drop.md) も参照してください
:::

構文:

```sql
UNDROP TABLE [db.]name [UUID '<uuid>'] [ON CLUSTER cluster]
```

**例**

```sql
CREATE TABLE tab
(
    `id` UInt8
)
ENGINE = MergeTree
ORDER BY id;

DROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;
```

```response
1 行目:
──────
index:                 0
database:              default
table:                 tab
uuid:                  aa696a1a-1d70-4e60-a841-4c80827706cc
engine:                MergeTree
metadata_dropped_path: /var/lib/clickhouse/metadata_dropped/default.tab.aa696a1a-1d70-4e60-a841-4c80827706cc.sql
table_dropped_time:    2023-04-05 14:12:12

1 行が結果セットに含まれます。経過時間: 0.001 秒。 
```

````sql
UNDROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;

```response
Ok.

0 rows in set. Elapsed: 0.001 sec. 
````

```sql
DESCRIBE TABLE tab
FORMAT Vertical;
```

```response
行 1:
──────
name:               id
type:               UInt8
default_type:       
default_expression: 
comment:            
codec_expression:   
ttl_expression:     
```
