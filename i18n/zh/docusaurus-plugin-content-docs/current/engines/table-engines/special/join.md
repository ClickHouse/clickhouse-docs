---
description: '用于 JOIN 操作的可选预构建数据结构。'
sidebar_label: 'Join'
sidebar_position: 70
slug: /engines/table-engines/special/join
title: 'Join 表引擎'
doc_type: 'reference'
---



# Join 表引擎

用于 [JOIN](/sql-reference/statements/select/join) 操作的可选预构建数据结构。

:::note
在 ClickHouse Cloud 中，如果您的服务创建时使用的版本早于 25.4，则需要通过 `SET compatibility=25.4` 将兼容性设置为至少 25.4。
:::



## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

详细说明请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询。


## 引擎参数 {#engine-parameters}

### `join_strictness` {#join_strictness}

`join_strictness` – [JOIN 严格性](/sql-reference/statements/select/join#supported-types-of-join)。

### `join_type` {#join_type}

`join_type` – [JOIN 类型](/sql-reference/statements/select/join#supported-types-of-join)。

### 键列 {#key-columns}

`k1[, k2, ...]` – 来自 `USING` 子句的键列,`JOIN` 操作将基于这些列执行。

输入 `join_strictness` 和 `join_type` 参数时无需使用引号,例如 `Join(ANY, LEFT, col1)`。这些参数必须与表所用的 `JOIN` 操作相匹配。如果参数不匹配,ClickHouse 不会抛出异常,但可能返回错误的数据。


## 特性和建议 {#specifics-and-recommendations}

### 数据存储 {#data-storage}

`Join` 表数据始终位于内存中。当向表中插入行时,ClickHouse 会将数据块写入磁盘目录,以便在服务器重启时恢复数据。

如果服务器异常重启,磁盘上的数据块可能会丢失或损坏。在这种情况下,您可能需要手动删除损坏的数据文件。

### 选择和插入数据 {#selecting-and-inserting-data}

您可以使用 `INSERT` 查询向 `Join` 引擎表添加数据。如果表是使用 `ANY` 严格模式创建的,则会忽略重复键的数据。使用 `ALL` 严格模式时,所有行都会被添加。

`Join` 引擎表的主要使用场景如下:

- 将表放置在 `JOIN` 子句的右侧。
- 调用 [joinGet](/sql-reference/functions/other-functions.md/#joinGet) 函数,该函数允许您像从字典中提取数据一样从表中提取数据。

### 删除数据 {#deleting-data}

`Join` 引擎表的 `ALTER DELETE` 查询以 [mutations](/sql-reference/statements/alter/index.md#mutations) 的形式实现。`DELETE` mutation 读取过滤后的数据并覆写内存和磁盘中的数据。

### 限制和设置 {#join-limitations-and-settings}

创建表时,会应用以下设置:

#### `join_use_nulls` {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### `max_rows_in_join` {#max_rows_in_join}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### `max_bytes_in_join` {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### `join_overflow_mode` {#join_overflow_mode}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### `join_any_take_last_row` {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)

#### `join_use_nulls` {#join_use_nulls-1}

#### 持久化 {#persistent}

禁用 Join 和 [Set](/engines/table-engines/special/set.md) 表引擎的持久化功能。

减少 I/O 开销。适用于追求性能且不需要持久化的场景。

可能的值:

- 1 — 启用。
- 0 — 禁用。

默认值:`1`。

`Join` 引擎表不能用于 `GLOBAL JOIN` 操作。

`Join` 引擎允许在 `CREATE TABLE` 语句中指定 [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) 设置。[SELECT](/sql-reference/statements/select/index.md) 查询应具有相同的 `join_use_nulls` 值。


## 使用示例 {#example}

创建左侧表:

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

创建右侧 `Join` 表:

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

连接表:

```sql
SELECT * FROM id_val ANY LEFT JOIN id_val_join USING (id);
```

```text
┌─id─┬─val─┬─id_val_join.val─┐
│  1 │  11 │              21 │
│  2 │  12 │               0 │
│  3 │  13 │              23 │
└────┴─────┴─────────────────┘
```

或者,您可以指定连接键值从 `Join` 表中检索数据:

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

从 `Join` 表中删除一行:

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
