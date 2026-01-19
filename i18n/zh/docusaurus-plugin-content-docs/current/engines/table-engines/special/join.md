---
description: '用于 JOIN 操作的可选预构建数据结构。'
sidebar_label: 'Join'
sidebar_position: 70
slug: /engines/table-engines/special/join
title: 'Join 表引擎'
doc_type: 'reference'
---

# Join 表引擎 \{#join-table-engine\}

用于 [JOIN](/sql-reference/statements/select/join) 操作的可选预构建数据结构。

:::note
在 ClickHouse Cloud 中，如果服务创建时使用的版本早于 25.4，则需要通过 `SET compatibility=25.4` 将兼容性级别设置为不低于 25.4。
:::

## 创建表 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

## 引擎参数 \{#engine-parameters\}

### `join_strictness` \{#join_strictness\}

`join_strictness` – [JOIN 严格性](/sql-reference/statements/select/join#supported-types-of-join)。

### `join_type` \{#join_type\}

`join_type` – [JOIN 类型](/sql-reference/statements/select/join#supported-types-of-join)。

### 键列 \{#key-columns\}

`k1[, k2, ...]` – 来自 `USING` 子句的键列，`JOIN` 操作基于这些列进行。

输入 `join_strictness` 和 `join_type` 参数时不要使用引号，例如 `Join(ANY, LEFT, col1)`。它们必须与该表将要使用的 `JOIN` 操作相匹配。如果参数不匹配，ClickHouse 不会抛出异常，并且可能返回错误的数据。

## 细节与建议 \{#specifics-and-recommendations\}

### 数据存储 \{#data-storage\}

`Join` 表的数据始终位于内存（RAM）中。向表中插入行时，ClickHouse 会将数据块写入磁盘上的目录，以便在服务器重启时可以进行恢复。

如果服务器未正常重启，磁盘上的数据块可能会丢失或损坏。在这种情况下，可能需要手动删除包含损坏数据的文件。

### 查询与插入数据 \{#selecting-and-inserting-data\}

可以使用 `INSERT` 查询向 `Join` 引擎表中添加数据。如果表在创建时使用了 `ANY` 严格性，则会忽略重复键的数据。在 `ALL` 严格性下，所有行都会被添加。

`Join` 引擎表的主要使用场景如下：

- 将表放在 `JOIN` 子句的右侧。
- 调用 [joinGet](/sql-reference/functions/other-functions.md/#joinGet) 函数，以与从字典中提取数据相同的方式从表中提取数据。

### 删除数据 \{#deleting-data\}

针对 `Join` 引擎表的 `ALTER DELETE` 查询是作为[变更（mutation）](/sql-reference/statements/alter/index.md#mutations)实现的。`DELETE` 变更会读取过滤后的数据，并覆盖内存和磁盘中的数据。

### 限制与设置 \{#join-limitations-and-settings\}

创建表时，会应用以下设置：

#### `join_use_nulls` \{#join_use_nulls\}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### `max_rows_in_join` \{#max_rows_in_join\}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### `max_bytes_in_join` \{#max_bytes_in_join\}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### `join_overflow_mode` \{#join_overflow_mode\}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### `join_any_take_last_row` \{#join_any_take_last_row\}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)
#### `join_use_nulls` \{#join_use_nulls-1\}

#### Persistent \{#persistent\}

为 Join 和 [Set](/engines/table-engines/special/set.md) 表引擎禁用持久化。

降低 I/O 开销。适用于追求性能但不需要持久化的场景。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

默认值：`1`。

`Join` 引擎表不能用于 `GLOBAL JOIN` 操作。

`Join` 引擎允许在 `CREATE TABLE` 语句中指定 [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) 设置。[SELECT](/sql-reference/statements/select/index.md) 查询必须使用相同的 `join_use_nulls` 值。

## 用法示例 \{#example\}

创建左侧的表：

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

创建右表（`Join` 右侧的表）：

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

联接这些表：

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

作为替代方案，你可以通过指定连接键的值，从 `Join` 表中检索数据：

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

从 `Join` 表中删除一行记录：

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
