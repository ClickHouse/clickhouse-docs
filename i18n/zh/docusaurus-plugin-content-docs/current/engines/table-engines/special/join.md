---
'description': '用于 JOIN 操作的可选准备数据结构。'
'sidebar_label': 'Join'
'sidebar_position': 70
'slug': '/engines/table-engines/special/join'
'title': 'Join 表引擎'
---


# Join Table Engine

用于 [JOIN](/sql-reference/statements/select/join) 操作的可选预处理数据结构。

:::note
这不是关于 [JOIN 子句](/sql-reference/statements/select/join) 本身的文章。
:::

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

查看 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

## 引擎参数 {#engine-parameters}

### join_strictness {#join_strictness}

`join_strictness` – [JOIN 严格性](/sql-reference/statements/select/join#supported-types-of-join)。

### join_type {#join_type}

`join_type` – [JOIN 类型](/sql-reference/statements/select/join#supported-types-of-join)。

### 主键列 {#key-columns}

`k1[, k2, ...]` – 来自 `USING` 子句的主键列，进行 `JOIN` 操作。

在没有引号的情况下输入 `join_strictness` 和 `join_type` 参数，例如 `Join(ANY, LEFT, col1)`。它们必须与表将用于的 `JOIN` 操作匹配。如果参数不匹配，ClickHouse 不会抛出异常，可能会返回不正确的数据。

## 特性和建议 {#specifics-and-recommendations}

### 数据存储 {#data-storage}

`Join` 表数据始终位于 RAM 中。当向表中插入行时，ClickHouse 会将数据块写入磁盘上的目录，以便在服务器重启时可以恢复。

如果服务器错误地重启，磁盘上的数据块可能会丢失或损坏。在这种情况下，您可能需要手动删除包含损坏数据的文件。

### 选择和插入数据 {#selecting-and-inserting-data}

您可以使用 `INSERT` 查询向 `Join` 引擎表添加数据。如果表是使用 `ANY` 严格性创建的，则重复键的数据将被忽略。使用 `ALL` 严格性时，所有行都会被添加。

`Join` 引擎表的主要用例如下：

- 将表放置在 `JOIN` 子句的右侧。
- 调用 [joinGet](/sql-reference/functions/other-functions.md/#joinget) 函数，该函数允许您以与字典相同的方式从表中提取数据。

### 删除数据 {#deleting-data}

对于 `Join` 引擎表的 `ALTER DELETE` 查询实现为 [变更](/sql-reference/statements/alter/index.md#mutations)。`DELETE` 变更读取过滤后的数据，并覆盖内存和磁盘中的数据。

### 限制和设置 {#join-limitations-and-settings}

创建表时，应用以下设置：

#### join_use_nulls {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### max_rows_in_join {#max_rows_in_join}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### max_bytes_in_join {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### join_overflow_mode {#join_overflow_mode}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### join_any_take_last_row {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)
#### join_use_nulls {#join_use_nulls-1}

#### persistent {#persistent}

禁用 `Join` 和 [Set](/engines/table-engines/special/set.md) 表引擎的持久性。

减少 I/O 开销。适用于追求性能且不需要持久性的场景。

可能的值：

- 1 — 开启。
- 0 — 关闭。

默认值：`1`。

`Join` 引擎表不能在 `GLOBAL JOIN` 操作中使用。

`Join` 引擎允许在 `CREATE TABLE` 语句中指定 [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) 设置。 [SELECT](/sql-reference/statements/select/index.md) 查询应具有相同的 `join_use_nulls` 值。

## 使用示例 {#example}

创建左侧表：

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

创建右侧 `Join` 表：

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

连接表：

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

作为替代，您可以指定连接键值从 `Join` 表中检索数据：

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

从 `Join` 表删除一行：

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
