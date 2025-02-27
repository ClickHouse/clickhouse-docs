---
slug: /sql-reference/statements/undrop
sidebar_label: UNDROP
---

# UNDROP テーブル

テーブルの削除をキャンセルします。

ClickHouse バージョン 23.3 以降では、DROP TABLE 文を発行してから `database_atomic_delay_before_drop_table_sec` (デフォルトで 8 分) 内に Atomic データベース内のテーブルを UNDROP することが可能です。削除されたテーブルは、`system.dropped_tables` というシステムテーブルにリストされます。

削除されたテーブルに関連付けられた `TO` 句のないマテリアライズドビューがある場合、そのビューの内部テーブルも UNDROP する必要があります。

:::tip
[DROP TABLE](/sql-reference/statements/drop.md) も参照してください。
:::

構文:

``` sql
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
行 1:
──────
index:                 0
database:              default
table:                 tab
uuid:                  aa696a1a-1d70-4e60-a841-4c80827706cc
engine:                MergeTree
metadata_dropped_path: /var/lib/clickhouse/metadata_dropped/default.tab.aa696a1a-1d70-4e60-a841-4c80827706cc.sql
table_dropped_time:    2023-04-05 14:12:12

1 行がセットに含まれています。経過時間: 0.001 秒。 
```

```sql
UNDROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;
```

```response
成功。

セットに行はありません。経過時間: 0.001 秒。 
```

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
