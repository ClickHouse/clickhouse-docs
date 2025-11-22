---
description: '`CHECK TABLE` 语句文档'
sidebar_label: 'CHECK TABLE'
sidebar_position: 41
slug: /sql-reference/statements/check-table
title: '`CHECK TABLE` 语句'
doc_type: 'reference'
---

ClickHouse 中的 `CHECK TABLE` 查询用于对某个特定表或其分区执行一致性检查。它通过验证校验和以及其他内部数据结构来确保数据的完整性。

具体来说，它会将实际的文件大小与存储在服务器上的预期值进行比较。如果文件大小与保存的值不匹配，则表示数据已损坏。例如，这可能是由于在查询执行期间系统崩溃导致的。

:::warning
`CHECK TABLE` 查询可能会读取表中的全部数据并占用大量资源，因此开销较大。
在执行此查询之前，请充分考虑其对性能和资源使用的潜在影响。
此查询不会提升系统性能，如果您不确定自己在做什么，就不应执行它。
:::



## 语法 {#syntax}

查询的基本语法如下:

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

- `table_name`: 指定要检查的表名。
- `partition_expression`: (可选)如果要检查表的特定分区,可以使用此表达式指定分区。
- `part_name`: (可选)如果要检查表中的特定数据部分,可以添加字符串字面量来指定部分名称。
- `FORMAT format`: (可选)允许指定结果的输出格式。
- `SETTINGS`: (可选)允许使用附加设置。
  - **`check_query_single_value_result`**: (可选)此设置允许在详细结果(`0`)或汇总结果(`1`)之间切换。
  - 也可以应用其他设置。如果不需要结果的确定性顺序,可以将 max_threads 设置为大于 1 的值以加快查询速度。

查询响应取决于 `check_query_single_value_result` 设置的值。
当 `check_query_single_value_result = 1` 时,仅返回包含单行的 `result` 列。如果完整性检查通过,此行中的值为 `1`,如果数据损坏则为 `0`。

当 `check_query_single_value_result = 0` 时,查询返回以下列:
- `part_path`: 指示数据部分的路径或文件名。
- `is_passed`: 如果此部分的检查成功则返回 1,否则返回 0。
- `message`: 与检查相关的任何附加消息,例如错误或成功消息。

`CHECK TABLE` 查询支持以下表引擎:

- [Log](../../engines/table-engines/log-family/log.md)
- [TinyLog](../../engines/table-engines/log-family/tinylog.md)
- [StripeLog](../../engines/table-engines/log-family/stripelog.md)
- [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

对使用其他表引擎的表执行此操作会导致 `NOT_IMPLEMENTED` 异常。

`*Log` 系列的引擎不提供故障时的自动数据恢复功能。使用 `CHECK TABLE` 查询可及时跟踪数据丢失情况。


## 示例 {#examples}

默认情况下，`CHECK TABLE` 查询显示表的总体检查状态：

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

如果您想查看每个数据部分的检查状态，可以使用 `check_query_single_value_result` 设置。

此外，要检查表的特定分区，可以使用 `PARTITION` 关键字。

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

输出：

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
│ 201003_3_3_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

同样，您可以使用 `PART` 关键字检查表的特定部分。

```sql
CHECK TABLE t0 PART '201003_7_7_0'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

输出：

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

请注意，当部分不存在时，查询会返回错误：

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### 接收"损坏"结果 {#receiving-a-corrupted-result}

:::warning
免责声明：此处描述的过程，包括直接从数据目录手动操作或删除文件，仅适用于实验或开发环境。请**勿**在生产服务器上尝试此操作，因为这可能导致数据丢失或其他意外后果。
:::

删除现有的校验和文件：

```bash
rm /var/lib/clickhouse-server/data/default/t0/201003_3_3_0/checksums.txt
```

````sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0


输出：

```text
┌─part_path────┬─is_passed─┬─message──────────────────────────────────┐
│ 201003_7_7_0 │         1 │                                          │
│ 201003_3_3_0 │         1 │ Checksums recounted and written to disk. │
└──────────────┴───────────┴──────────────────────────────────────────┘
````

如果 checksums.txt 文件丢失，可以恢复它。在对特定分区执行 CHECK TABLE 命令期间，它将被重新计算并重写，状态仍将报告为 'is_passed = 1'。

您可以使用 `CHECK ALL TABLES` 查询一次性检查所有现有的 `(Replicated)MergeTree` 表。

```sql
CHECK ALL TABLES
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```


```text
┌─database─┬─table────┬─part_path───┬─is_passed─┬─message─┐
│ default  │ t2       │ all_1_95_3  │         1 │         │
│ db1      │ table_01 │ all_39_39_0 │         1 │         │
│ default  │ t1       │ all_39_39_0 │         1 │         │
│ db1      │ t1       │ all_39_39_0 │         1 │         │
│ db1      │ table_01 │ all_1_6_1   │         1 │         │
│ default  │ t1       │ all_1_6_1   │         1 │         │
│ db1      │ t1       │ all_1_6_1   │         1 │         │
│ db1      │ table_01 │ all_7_38_2  │         1 │         │
│ db1      │ t1       │ all_7_38_2  │         1 │         │
│ default  │ t1       │ all_7_38_2  │         1 │         │
└──────────┴──────────┴─────────────┴───────────┴─────────┘
```


## 如果数据已损坏 {#if-the-data-is-corrupted}

如果表已损坏,您可以将未损坏的数据复制到另一个表中。操作步骤如下:

1.  创建一个与损坏表结构相同的新表。执行以下查询:`CREATE TABLE <new_table_name> AS <damaged_table_name>`。
2.  将 `max_threads` 值设置为 1,以便在单线程中处理后续查询。运行以下查询:`SET max_threads = 1`。
3.  执行查询 `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>`。该查询会将未损坏的数据从损坏的表复制到新表中。仅会复制损坏部分之前的数据。
4.  重启 `clickhouse-client` 以重置 `max_threads` 值。
