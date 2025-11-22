---
description: 'Alias 表引擎创建指向另一张表的透明代理。所有操作都会转发到目标表，而别名本身不存储任何数据。'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Alias 表引擎'
doc_type: 'reference'
---



# Alias 表引擎

`Alias` 引擎会创建一个指向另一张表的代理。所有读写操作都会被转发到目标表，而别名本身不存储任何数据，只维护对目标表的引用。



## 创建表 {#creating-a-table}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

或指定显式数据库名称:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias` 表不支持显式列定义。列将自动从目标表继承。这确保别名始终与目标表的架构保持一致。
:::


## 引擎参数 {#engine-parameters}

- **`target_db (可选)`** — 包含目标表的数据库名称。
- **`target_table`** — 目标表名称。


## 支持的操作 {#supported-operations}

`Alias` 表引擎支持所有主要操作。

### 目标表操作 {#operations-on-target}

以下操作会代理到目标表:

| 操作                         | 支持 | 描述                                         |
| ---------------------------- | ------- | --------------------------------------------------- |
| `SELECT`                     | ✅      | 从目标表读取数据                         |
| `INSERT`                     | ✅      | 向目标表写入数据                          |
| `INSERT SELECT`              | ✅      | 批量插入到目标表                      |
| `ALTER TABLE ADD COLUMN`     | ✅      | 向目标表添加列                         |
| `ALTER TABLE MODIFY SETTING` | ✅      | 修改目标表设置                        |
| `ALTER TABLE PARTITION`      | ✅      | 对目标表执行分区操作(DETACH/ATTACH/DROP) |
| `ALTER TABLE UPDATE`         | ✅      | 更新目标表中的行(变更操作)              |
| `ALTER TABLE DELETE`         | ✅      | 从目标表删除行(变更操作)            |
| `OPTIMIZE TABLE`             | ✅      | 优化目标表(合并数据部分)                 |
| `TRUNCATE TABLE`             | ✅      | 清空目标表                               |

### 别名自身操作 {#operations-on-alias}

以下操作仅影响别名,**不会**影响目标表:

| 操作      | 支持 | 描述                                           |
| -------------- | ------- | ----------------------------------------------------- |
| `DROP TABLE`   | ✅      | 仅删除别名,目标表保持不变   |
| `RENAME TABLE` | ✅      | 仅重命名别名,目标表保持不变 |


## 使用示例 {#usage-examples}

### 基本别名创建 {#basic-alias-creation}

在同一数据库中创建简单别名:

```sql
-- 创建源表
CREATE TABLE source_data (
    id UInt32,
    name String,
    value Float64
) ENGINE = MergeTree
ORDER BY id;

-- 插入一些数据
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

### 跨数据库别名 {#cross-database-alias}

创建指向不同数据库中表的别名:

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

-- 两个别名的工作方式完全相同
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```

### 通过别名进行写操作 {#write-operations}

所有写操作都会转发到目标表:

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- 通过别名插入
INSERT INTO metrics_alias VALUES
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- 使用 SELECT 插入
INSERT INTO metrics_alias
SELECT now(), 'disk_usage', number * 10
FROM system.numbers
LIMIT 5;

-- 验证数据在目标表中
SELECT count() FROM metrics;  -- 返回 7
SELECT count() FROM metrics_alias;  -- 返回 7
```

### 模式修改 {#schema-modification}

ALTER 操作会修改目标表的模式:

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

### 数据变更 {#data-mutations}

支持 UPDATE 和 DELETE 操作:

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

-- 通过别名更新
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- 通过别名删除
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- 更改应用于目标表
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```

### 分区操作 {#partition-operations}

对于分区表,分区操作会被转发:


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

### 表优化 {#table-optimization}

OPTIMIZE 操作会在目标表中合并数据片段：

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- 多次插入会创建多个数据片段
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- 检查数据片段数量
SELECT count() FROM system.parts
WHERE database = currentDatabase()
  AND table = 'events'
  AND active;

-- 通过别名执行 OPTIMIZE
OPTIMIZE TABLE events_alias FINAL;

-- 目标表中的数据片段已合并
SELECT count() FROM system.parts
WHERE database = currentDatabase()
  AND table = 'events'
  AND active;  -- Returns 1
```

### 别名管理 {#alias-management}

可以独立重命名或删除别名：

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

-- 删除其中一个别名（目标表和其他别名保持不变）
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- 仍然可正常工作
SELECT count() FROM important_data;  -- 数据完好，返回 2
```
