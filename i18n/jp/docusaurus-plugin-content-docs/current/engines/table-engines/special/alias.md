---
description: 'Alias テーブルエンジンは、別のテーブルへの透過的なプロキシとして機能します。すべての操作は対象テーブルに転送され、エイリアス自体はデータを保持しません。'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Alias テーブルエンジン'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Alias テーブルエンジン \{#alias-table-engine\}

<ExperimentalBadge/>

`Alias` エンジンは、別のテーブルへのプロキシを作成します。すべての読み取りおよび書き込み操作は対象テーブルに転送され、エイリアス自体はデータを保持せず、対象テーブルへの参照のみを保持します。

:::info
これは実験的な機能であり、将来のリリースで後方互換性を損なう形で変更される可能性があります。
`Alias` テーブルエンジンを使用するには、
[allow_experimental_alias_table_engine](/operations/settings/settings#allow_experimental_alias_table_engine) 設定を有効にしてください。
次のコマンドを実行します: `set allow_experimental_alias_table_engine = 1`。
:::

## テーブルの作成 \{#creating-a-table\}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

または、データベース名を明示的に指定する場合：

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias` テーブルでは、明示的な列定義を行うことはできません。列はターゲットテーブルから自動的に継承されます。これにより、エイリアスは常にターゲットテーブルのスキーマと一致します。
:::

## エンジンパラメータ \{#engine-parameters\}

- **`target_db (optional)`** — 対象テーブルを含むデータベースの名前（省略可能）。
- **`target_table`** — 対象テーブルの名前。

## サポートされている操作 \{#supported-operations\}

`Alias` テーブルエンジンは、主要な操作をすべてサポートします。 

### ターゲットテーブルに対する操作 \{#operations-on-target\}

これらの操作はターゲットテーブルに対してプロキシ経由で実行されます:

| Operation | Support | Description |
|-----------|---------|-------------|
| `SELECT` | ✅ | ターゲットテーブルからデータを読み取る |
| `INSERT` | ✅ | ターゲットテーブルにデータを書き込む |
| `INSERT SELECT` | ✅ | ターゲットテーブルへのバッチ挿入を行う |
| `ALTER TABLE ADD COLUMN` | ✅ | ターゲットテーブルに列を追加する |
| `ALTER TABLE MODIFY SETTING` | ✅ | ターゲットテーブルの設定を変更する |
| `ALTER TABLE PARTITION` | ✅ | ターゲットに対するパーティション操作 (DETACH/ATTACH/DROP) を行う |
| `ALTER TABLE UPDATE` | ✅ | ターゲットテーブルの行を更新する (mutation) |
| `ALTER TABLE DELETE` | ✅ | ターゲットテーブルから行を削除する (mutation) |
| `OPTIMIZE TABLE` | ✅ | ターゲットテーブルを最適化する (パートをマージ) |
| `TRUNCATE TABLE` | ✅ | ターゲットテーブルを空にする |

### エイリアス自体への操作 \{#operations-on-alias\}

これらの操作はエイリアスのみに作用し、ターゲットテーブルには**影響しません**。

| Operation | Support | Description |
|-----------|---------|-------------|
| `DROP TABLE` | ✅ | エイリアスのみを削除し、ターゲットテーブルには変更が加わらない |
| `RENAME TABLE` | ✅ | エイリアスの名前だけを変更し、ターゲットテーブルには変更が加わらない |

## 使用例 \{#usage-examples\}

### 基本的なエイリアスの作成 \{#basic-alias-creation\}

同一データベース内で簡単なエイリアスを作成します。

```sql
-- Create source table
CREATE TABLE source_data (
    id UInt32,
    name String,
    value Float64
) ENGINE = MergeTree
ORDER BY id;

-- Insert some data
INSERT INTO source_data VALUES (1, 'one', 10.1), (2, 'two', 20.2);

-- Create alias
CREATE TABLE data_alias ENGINE = Alias('source_data');

-- Query through alias
SELECT * FROM data_alias;
```

```text
┌─id─┬─name─┬─value─┐
│  1 │ one  │  10.1 │
│  2 │ two  │  20.2 │
└────┴──────┴───────┘
```

### データベース間エイリアス \{#cross-database-alias\}

別のデータベース内のテーブルを参照するエイリアスを作成します。

```sql
-- Create databases
CREATE DATABASE db1;
CREATE DATABASE db2;

-- Create source table in db1
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- Create alias in db2 pointing to db1.events
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- Or using database.table format
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- Both aliases work identically
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### エイリアス経由での書き込み操作 \{#write-operations\}

すべての書き込みはターゲットテーブルに転送されます。

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- Insert through alias
INSERT INTO metrics_alias VALUES 
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- Insert with SELECT
INSERT INTO metrics_alias 
SELECT now(), 'disk_usage', number * 10 
FROM system.numbers 
LIMIT 5;

-- Verify data is in the target table
SELECT count() FROM metrics;  -- Returns 7
SELECT count() FROM metrics_alias;  -- Returns 7
```

### スキーマの変更 \{#schema-modification\}

ALTER 操作は対象テーブルのスキーマを変更します。

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- Add column through alias
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- Column is added to target table
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```

### データの変更 \{#data-mutations\}

UPDATE 文および DELETE 文がサポートされています。

```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float64,
    status String DEFAULT 'active'
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE products_alias ENGINE = Alias('products');

INSERT INTO products_alias VALUES 
    (1, 'item_one', 100.0, 'active'),
    (2, 'item_two', 200.0, 'active'),
    (3, 'item_three', 300.0, 'inactive');

-- Update through alias
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- Delete through alias
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- Changes are applied to target table
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```

### パーティション操作 \{#partition-operations\}

パーティション化されたテーブルでは、パーティション操作はそのまま伝播されます。

```sql
CREATE TABLE logs (
    date Date,
    level String,
    message String
) ENGINE = MergeTree
PARTITION BY toYYYYMM(date)
ORDER BY date;

CREATE TABLE logs_alias ENGINE = Alias('logs');

INSERT INTO logs_alias VALUES 
    ('2024-01-15', 'INFO', 'message1'),
    ('2024-02-15', 'ERROR', 'message2'),
    ('2024-03-15', 'INFO', 'message3');

-- Detach partition through alias
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Returns 2 (partition 202402 detached)

-- Attach partition back
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Returns 3
```

### テーブル最適化 \{#table-optimization\}

ターゲットテーブル内のパーツをマージする処理を最適化します。

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- Multiple inserts create multiple parts
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- Check parts count
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;

-- Optimize through alias
OPTIMIZE TABLE events_alias FINAL;

-- Parts are merged in target table
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;  -- Returns 1
```

### エイリアスの管理 \{#alias-management\}

エイリアスはそれぞれ独立して名前を変更したり削除したりできます。

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- Rename alias (target table unchanged)
RENAME TABLE old_alias TO new_alias;

-- Create another alias to same table
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- Drop one alias (target table and other aliases unchanged)
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- Still works
SELECT count() FROM important_data;  -- Data intact, returns 2
```
