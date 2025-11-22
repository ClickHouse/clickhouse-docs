---
description: 'Alias テーブルエンジンは、別のテーブルへの透過的なプロキシを作成します。すべての操作はターゲットテーブルに転送されますが、エイリアス自体はデータを一切保持しません。'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Alias テーブルエンジン'
doc_type: 'reference'
---



# Alias テーブルエンジン

`Alias` エンジンは、別のテーブルへのプロキシとして機能します。すべての読み取りおよび書き込み操作は対象テーブルに転送され、エイリアス自体はデータを保持せず、対象テーブルへの参照のみを保持します。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

または、データベース名を明示的に指定する場合:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias`テーブルは明示的なカラム定義をサポートしていません。カラムはターゲットテーブルから自動的に継承されます。これにより、エイリアスは常にターゲットテーブルのスキーマと一致することが保証されます。
:::


## エンジンパラメータ {#engine-parameters}

- **`target_db (オプション)`** — 対象テーブルを含むデータベースの名前。
- **`target_table`** — 対象テーブルの名前。


## サポートされる操作 {#supported-operations}

`Alias`テーブルエンジンは、すべての主要な操作をサポートしています。

### ターゲットテーブルに対する操作 {#operations-on-target}

これらの操作はターゲットテーブルにプロキシされます:

| 操作                         | サポート | 説明                                         |
| ---------------------------- | ------- | --------------------------------------------------- |
| `SELECT`                     | ✅      | ターゲットテーブルからデータを読み取る                         |
| `INSERT`                     | ✅      | ターゲットテーブルにデータを書き込む                          |
| `INSERT SELECT`              | ✅      | ターゲットテーブルへのバッチ挿入                      |
| `ALTER TABLE ADD COLUMN`     | ✅      | ターゲットテーブルにカラムを追加                         |
| `ALTER TABLE MODIFY SETTING` | ✅      | ターゲットテーブルの設定を変更                        |
| `ALTER TABLE PARTITION`      | ✅      | ターゲットに対するパーティション操作（DETACH/ATTACH/DROP） |
| `ALTER TABLE UPDATE`         | ✅      | ターゲットテーブルの行を更新（ミューテーション）              |
| `ALTER TABLE DELETE`         | ✅      | ターゲットテーブルから行を削除（ミューテーション）            |
| `OPTIMIZE TABLE`             | ✅      | ターゲットテーブルを最適化（パーツをマージ）                 |
| `TRUNCATE TABLE`             | ✅      | ターゲットテーブルを切り詰める                               |

### エイリアス自体に対する操作 {#operations-on-alias}

これらの操作はエイリアスのみに影響し、ターゲットテーブルには影響**しません**:

| 操作           | サポート | 説明                                           |
| -------------- | ------- | ----------------------------------------------------- |
| `DROP TABLE`   | ✅      | エイリアスのみを削除、ターゲットテーブルは変更されない   |
| `RENAME TABLE` | ✅      | エイリアスのみを名前変更、ターゲットテーブルは変更されない |


## 使用例 {#usage-examples}

### 基本的なエイリアスの作成 {#basic-alias-creation}

同じデータベース内にシンプルなエイリアスを作成します:

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

### データベース間のエイリアス {#cross-database-alias}

異なるデータベース内のテーブルを参照するエイリアスを作成します:

```sql
-- データベースを作成
CREATE DATABASE db1;
CREATE DATABASE db2;

-- ソーステーブルを作成 in db1
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- db1.eventsを参照するエイリアスをdb2に作成
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- または database.table 形式を使用
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- 両方のエイリアスは同じように動作します
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### エイリアス経由の書き込み操作 {#write-operations}

すべての書き込み操作はターゲットテーブルに転送されます:

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- エイリアス経由で挿入
INSERT INTO metrics_alias VALUES
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- SELECTを使用して挿入
INSERT INTO metrics_alias
SELECT now(), 'disk_usage', number * 10
FROM system.numbers
LIMIT 5;

-- ターゲットテーブルにデータがあることを確認
SELECT count() FROM metrics;  -- 7を返します
SELECT count() FROM metrics_alias;  -- 7を返します
```

### スキーマの変更 {#schema-modification}

ALTER操作はターゲットテーブルのスキーマを変更します:

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- エイリアス経由でカラムを追加
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- カラムがターゲットテーブルに追加されます
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```

### データの変更 {#data-mutations}

UPDATEおよびDELETE操作がサポートされています:

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

-- 変更はターゲットテーブルに適用されます
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```

### パーティション操作 {#partition-operations}

パーティション化されたテーブルの場合、パーティション操作は転送されます:


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

-- エイリアス経由でパーティションをデタッチする
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- 2 を返す（パーティション 202402 がデタッチされている）

-- パーティションを再度アタッチする
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- 3 を返す
```

### テーブルの最適化 {#table-optimization}

最適化操作は、対象テーブル内のパーツをマージします:

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- 複数回の挿入を行うと複数のパーツが作成される
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- パーツ数を確認する
SELECT count() FROM system.parts
WHERE database = currentDatabase()
  AND table = 'events'
  AND active;

-- エイリアス経由で最適化を実行する
OPTIMIZE TABLE events_alias FINAL;

-- パーツは対象テーブル内でマージされる
SELECT count() FROM system.parts
WHERE database = currentDatabase()
  AND table = 'events'
  AND active;  -- Returns 1
```

### エイリアスの管理 {#alias-management}

エイリアスは個別に名前を変更したり削除したりできます:

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- エイリアスの名前を変更する（対象テーブルは変更されない）
RENAME TABLE old_alias TO new_alias;

-- 同じテーブルへの別のエイリアスを作成する
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- 1 つのエイリアスを削除する（対象テーブルおよび他のエイリアスは変更されない）
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- 引き続き利用できる
SELECT count() FROM important_data;  -- データは保持されたままで、2 を返す
```
