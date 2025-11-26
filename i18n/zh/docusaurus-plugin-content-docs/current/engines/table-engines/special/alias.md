---
description: 'Alias 表引擎会创建到另一张表的透明代理。所有操作都会被转发到目标表，而别名表自身不存储任何数据。'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Alias 表引擎'
doc_type: 'reference'
---



# Alias 表引擎

`Alias` 引擎会创建一个指向另一张表的代理表。所有读写操作都会转发到目标表，而别名表本身不存储任何数据，只维护对目标表的引用。



## 创建表

```sql
CREATE TABLE [数据库名.]别名表名
ENGINE = Alias(目标表)
```

或者显式地指定数据库名称：

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias` 表不支持显式定义列。列会自动从目标表继承，这可以确保别名表始终与目标表的表结构保持一致。
:::


## 引擎参数 {#engine-parameters}

- **`target_db (optional)`** — 目标表所在数据库的名称。
- **`target_table`** — 目标表名称。



## 支持的操作 {#supported-operations}

`Alias` 表引擎支持所有主要操作。 
### 目标表上的操作 {#operations-on-target}

这些操作会被转发到目标表：

| Operation | Support | Description |
|-----------|---------|-------------|
| `SELECT` | ✅ | 从目标表读取数据 |
| `INSERT` | ✅ | 向目标表写入数据 |
| `INSERT SELECT` | ✅ | 向目标表执行批量插入 |
| `ALTER TABLE ADD COLUMN` | ✅ | 向目标表添加列 |
| `ALTER TABLE MODIFY SETTING` | ✅ | 修改目标表设置 |
| `ALTER TABLE PARTITION` | ✅ | 在目标表上执行分区操作（DETACH/ATTACH/DROP） |
| `ALTER TABLE UPDATE` | ✅ | 更新目标表中的行（变更，mutation） |
| `ALTER TABLE DELETE` | ✅ | 从目标表删除行（变更，mutation） |
| `OPTIMIZE TABLE` | ✅ | 优化目标表（合并数据分片） |
| `TRUNCATE TABLE` | ✅ | 截断目标表 |

### 对别名本身的操作 {#operations-on-alias}

这些操作只影响别名，**不会**影响目标表：

| Operation | Support | Description |
|-----------|---------|-------------|
| `DROP TABLE` | ✅ | 仅删除别名，目标表保持不变 |
| `RENAME TABLE` | ✅ | 仅重命名别名，目标表保持不变 |



## 用法示例

### 创建基本别名

在同一数据库中创建一个简单的别名：

```sql
-- 创建源表
CREATE TABLE source_data (
    id UInt32,
    name String,
    value Float64
) ENGINE = MergeTree
ORDER BY id;

-- 插入数据
INSERT INTO source_data VALUES (1, 'one', 10.1), (2, 'two', 20.2);

-- 创建别名
CREATE TABLE data_alias ENGINE = Alias('source_data');

-- 通过别名查询
SELECT * FROM data_alias;
```

```text
┌─id─┬─name─┬─value─┐
│  1 │ one  │  10.1 │
│  2 │ two  │  20.2 │
└────┴──────┴───────┘
```

### 跨数据库别名

创建一个指向其他数据库中某张表的别名：

```sql
-- 创建数据库
CREATE DATABASE db1;
CREATE DATABASE db2;

-- 在 db1 中创建源表
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- 在 db2 中创建指向 db1.events 的别名
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- 或使用 database.table 格式
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- 两个别名的工作方式相同
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### 通过别名进行写入操作

所有写入操作都会转发到目标表：

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- 通过别名插入数据
INSERT INTO metrics_alias VALUES 
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- 使用 SELECT 语句插入数据
INSERT INTO metrics_alias 
SELECT now(), 'disk_usage', number * 10 
FROM system.numbers 
LIMIT 5;

-- 验证数据已写入目标表
SELECT count() FROM metrics;  -- 返回 7
SELECT count() FROM metrics_alias;  -- 返回 7
```

### 表结构修改

`ALTER` 操作会修改目标表的表结构：

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- 通过别名添加列
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- 列被添加到目标表
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```

### 数据变更

支持 `UPDATE` 和 `DELETE` 操作：

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

-- 通过别名进行更新
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- 通过别名进行删除
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- 变更将应用到目标表
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```

### 分区操作

对于分区表，分区操作会转发：


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

-- 通过别名分离分区
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- 返回 2（分区 202402 已分离）

-- 重新附加分区
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- 返回 3
```

### 表优化

OPTIMIZE 操作会在目标表中合并数据分片：

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- 多次插入创建多个数据部分
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- 检查数据部分数量
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;

-- 通过别名表优化
OPTIMIZE TABLE events_alias FINAL;

-- 数据部分在目标表中合并
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;  -- 返回 1
```

### 别名管理

可以分别对别名进行重命名或删除：

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- 重命名别名（目标表保持不变）
RENAME TABLE old_alias TO new_alias;

-- 为同一张表创建另一个别名
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- 删除一个别名（目标表和其他别名保持不变）
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- 仍然有效
SELECT count() FROM important_data;  -- 数据完整，返回 2
```
