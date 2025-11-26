---
description: 'Alias テーブルエンジンは、別のテーブルへの透過的なプロキシを作成します。すべての操作は対象テーブルに委譲され、Alias 自体にはデータは保持されません。'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Alias テーブルエンジン'
doc_type: 'reference'
---



# Alias テーブルエンジン

`Alias` エンジンは、別のテーブルへのプロキシを作成するテーブルエンジンです。すべての読み取りおよび書き込み操作は対象テーブルに転送され、エイリアス自体はデータを保持せず、対象テーブルへの参照のみを保持します。



## テーブルを作成する

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

または、データベース名を明示的に指定して:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias` テーブルでは、カラムを明示的に定義することはできません。カラムは自動的に対象テーブルから継承されます。これにより、エイリアスは常に対象テーブルのスキーマと一致することが保証されます。
:::


## エンジンパラメータ {#engine-parameters}

- **`target_db (optional)`** — 対象テーブルを含むデータベース名。
- **`target_table`** — 対象テーブル名。



## サポートされる操作 {#supported-operations}

`Alias` テーブルエンジンは、主要な操作をすべてサポートします。 
### 対象テーブルへの操作 {#operations-on-target}

これらの操作は、エイリアスを介して対象テーブルに対して実行されます:

| Operation | Support | Description |
|-----------|---------|-------------|
| `SELECT` | ✅ | 対象テーブルからデータを読み取る |
| `INSERT` | ✅ | 対象テーブルにデータを書き込む |
| `INSERT SELECT` | ✅ | 対象テーブルへのバッチ挿入を行う |
| `ALTER TABLE ADD COLUMN` | ✅ | 対象テーブルにカラムを追加する |
| `ALTER TABLE MODIFY SETTING` | ✅ | 対象テーブルの設定を変更する |
| `ALTER TABLE PARTITION` | ✅ | 対象テーブルに対するパーティション操作 (DETACH/ATTACH/DROP) を行う |
| `ALTER TABLE UPDATE` | ✅ | 対象テーブル内の行を更新する (ミューテーション) |
| `ALTER TABLE DELETE` | ✅ | 対象テーブルから行を削除する (ミューテーション) |
| `OPTIMIZE TABLE` | ✅ | 対象テーブルを最適化する (パーツをマージする) |
| `TRUNCATE TABLE` | ✅ | 対象テーブルを空にする |

### `Alias` 自体への操作 {#operations-on-alias}

これらの操作はエイリアスのみに影響し、対象テーブルには **影響しません**:

| Operation | Support | Description |
|-----------|---------|-------------|
| `DROP TABLE` | ✅ | エイリアスのみを削除し、対象テーブルは変更されない |
| `RENAME TABLE` | ✅ | エイリアスの名前のみを変更し、対象テーブルは変更されない |



## 使用例

### 基本的なエイリアスの作成

同じデータベース内にシンプルなエイリアスを作成します。

```sql
-- ソーステーブルを作成
CREATE TABLE source_data (
    id UInt32,
    name String,
    value Float64
) ENGINE = MergeTree
ORDER BY id;

-- データを挿入
INSERT INTO source_data VALUES (1, 'one', 10.1), (2, 'two', 20.2);

-- エイリアスを作成
CREATE TABLE data_alias ENGINE = Alias('source_data');

-- エイリアス経由でクエリを実行
SELECT * FROM data_alias;
```

```text
┌─id─┬─name─┬─value─┐
│  1 │ one  │  10.1 │
│  2 │ two  │  20.2 │
└────┴──────┴───────┘
```

### データベース間エイリアス

別のデータベース内のテーブルを指すエイリアスを作成します：

```sql
-- データベースを作成
CREATE DATABASE db1;
CREATE DATABASE db2;

-- db1にソーステーブルを作成
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- db1.eventsを指すエイリアスをdb2に作成
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- またはdatabase.table形式を使用
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- 両方のエイリアスは同一に動作
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### エイリアス経由の書き込み操作

すべての書き込み操作はターゲットテーブルに転送されます。

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- エイリアスを介して挿入
INSERT INTO metrics_alias VALUES 
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- SELECTで挿入
INSERT INTO metrics_alias 
SELECT now(), 'disk_usage', number * 10 
FROM system.numbers 
LIMIT 5;

-- ターゲットテーブルにデータが格納されていることを確認
SELECT count() FROM metrics;  -- 7を返す
SELECT count() FROM metrics_alias;  -- 7を返す
```

### スキーマの変更

`ALTER` 操作は対象テーブルのスキーマを変更します。

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- エイリアス経由でカラムを追加
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- カラムは対象テーブルに追加される
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```

### データの変更

`UPDATE` および `DELETE` 操作がサポートされています。

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

-- エイリアス経由で更新
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- エイリアス経由で削除
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- 変更は対象テーブルに適用されます
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```

### パーティション操作

パーティション化されたテーブルでは、パーティション操作はフォワードされます。


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

-- エイリアス経由でパーティションをデタッチ
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- 2を返す（パーティション202402はデタッチ済み）

-- パーティションを再アタッチ
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- 3を返す
```

### テーブルの最適化

ターゲットテーブルに対するパーツのマージ処理を最適化します。

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- 複数の挿入により複数のパートが作成されます
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- パート数を確認します
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;

-- エイリアス経由で最適化します
OPTIMIZE TABLE events_alias FINAL;

-- ターゲットテーブルでパートがマージされます
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;  -- 1を返します
```

### エイリアスの管理

エイリアスは個別に名前を変更したり削除したりできます。

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- エイリアスの名前を変更（ターゲットテーブルは変更されません）
RENAME TABLE old_alias TO new_alias;

-- 同じテーブルに別のエイリアスを作成
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- エイリアスを1つ削除（ターゲットテーブルと他のエイリアスは変更されません）
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- 引き続き機能します
SELECT count() FROM important_data;  -- データは保持されており、2を返します
```
