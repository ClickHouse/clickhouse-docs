---
description: 'Alias 表引擎创建一个指向另一张表的透明代理。所有操作都会转发至目标表，而别名本身不存储任何数据。'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Alias 表引擎'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Alias 表引擎 {#alias-table-engine}

<ExperimentalBadge/>

`Alias` 引擎会创建指向另一张表的代理。所有读写操作都会被转发到目标表，而别名表本身不存储任何数据，只维护对目标表的引用。

:::info
这是一个实验性特性，在未来版本中可能会以不向后兼容的方式发生变更。
要启用 Alias 表引擎，请通过设置 [allow_experimental_alias_table_engine](/operations/settings/settings#allow_experimental_alias_table_engine)。
输入命令 `set allow_experimental_alias_table_engine = 1`。
:::

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

或者显式地指定数据库名称：

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias` 表不支持显式定义列。列会自动从目标表继承，从而确保该别名表始终与目标表的 schema 保持一致。
:::

## 引擎参数 {#engine-parameters}

- **`target_db（可选）`** — 包含目标表的数据库名称。
- **`target_table`** — 目标表的名称。

## 支持的操作 {#supported-operations}

`Alias` 表引擎支持所有主要操作。 

### 目标表上的操作 {#operations-on-target}

这些操作会被转发到目标表：

| Operation | Support | Description |
|-----------|---------|-------------|
| `SELECT` | ✅ | 从目标表读取数据 |
| `INSERT` | ✅ | 向目标表写入数据 |
| `INSERT SELECT` | ✅ | 批量向目标表插入数据 |
| `ALTER TABLE ADD COLUMN` | ✅ | 向目标表添加列 |
| `ALTER TABLE MODIFY SETTING` | ✅ | 修改目标表的设置 |
| `ALTER TABLE PARTITION` | ✅ | 在目标表上执行分区操作（DETACH/ATTACH/DROP） |
| `ALTER TABLE UPDATE` | ✅ | 更新目标表中的行（mutation 变更） |
| `ALTER TABLE DELETE` | ✅ | 从目标表删除行（mutation 变更） |
| `OPTIMIZE TABLE` | ✅ | 优化目标表（合并数据片段） |
| `TRUNCATE TABLE` | ✅ | 截断目标表 |

### 对别名本身的操作 {#operations-on-alias}

这些操作只会影响别名，**不会**影响目标表：

| 操作 | 支持情况 | 描述 |
|-----------|---------|-------------|
| `DROP TABLE` | ✅ | 仅删除别名，目标表保持不变 |
| `RENAME TABLE` | ✅ | 仅重命名别名，目标表保持不变 |

## 使用示例 {#usage-examples}

### 创建基本别名 {#basic-alias-creation}

在同一数据库中创建一个简单的别名：

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

### 跨数据库别名 {#cross-database-alias}

创建一个指向不同数据库中某个表的别名：

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

### 通过别名执行写入操作 {#write-operations}

经由别名的所有写入操作都会被转发到其目标表：

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

### 表结构修改 {#schema-modification}

`ALTER` 操作用于修改目标表的表结构：

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

### 数据变更 {#data-mutations}

支持 UPDATE 和 DELETE 操作：

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

### 分区操作 {#partition-operations}

对于分区表，分区操作将被转发：

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

### 表优化 {#table-optimization}

对目标表中的分片执行合并优化操作：

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

### 别名管理 {#alias-management}

可以分别对别名进行重命名或删除：

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
