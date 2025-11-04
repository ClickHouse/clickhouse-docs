---
'description': 'CHECK TABLE 的文档'
'sidebar_label': 'CHECK TABLE'
'sidebar_position': 41
'slug': '/sql-reference/statements/check-table'
'title': 'CHECK TABLE 语句'
'doc_type': 'reference'
---

在 ClickHouse 中，`CHECK TABLE` 查询用于对特定表或其分区执行验证检查。它通过验证校验和和其他内部数据结构来确保数据的完整性。

特别地，它比较实际文件大小与存储在服务器上的预期值。如果文件大小与存储的值不匹配，则意味着数据已损坏。这可能是由系统在查询执行期间崩溃等原因引起的。

:::warning
`CHECK TABLE` 查询可能会读取表中的所有数据并占用一些资源，因此资源密集型。
在执行此查询之前，请考虑对性能和资源利用的潜在影响。
此查询不会提高系统的性能，您不应在不确定自己在做什么的情况下执行它。
:::

## 语法 {#syntax}

查询的基本语法如下：

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

- `table_name`：指定要检查的表的名称。
- `partition_expression`： （可选）如果您想检查表的特定分区，可以使用此表达式来指定分区。
- `part_name`： （可选）如果您想检查表中的特定部分，可以添加字符串文字以指定部分名称。
- `FORMAT format`： （可选）允许您指定结果的输出格式。
- `SETTINGS`： （可选）允许其他设置。
  - **`check_query_single_value_result`**： （可选）此设置允许您在详细结果（`0`）或汇总结果（`1`）之间切换。
  - 其他设置也可以应用。如果您不需要结果的确定性顺序，可以将 max_threads 设置为大于 1 的值以加快查询速度。

查询响应取决于 `check_query_single_value_result` 设置的值。
在 `check_query_single_value_result = 1` 的情况下，仅返回包含单行的 `result` 列。此行中的值为 `1`，如果完整性检查通过，如果数据已损坏，则为 `0`。

当 `check_query_single_value_result = 0` 时，查询返回以下列：
    - `part_path`：指示数据部分的路径或文件名。
    - `is_passed`：如果此部分的检查成功则返回 1，否则返回 0。
    - `message`：与检查相关的任何附加消息，例如错误或成功消息。

`CHECK TABLE` 查询支持以下表引擎：

- [Log](../../engines/table-engines/log-family/log.md)
- [TinyLog](../../engines/table-engines/log-family/tinylog.md)
- [StripeLog](../../engines/table-engines/log-family/stripelog.md)
- [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

在其他表引擎上执行时会导致 `NOT_IMPLEMENTED` 异常。

来自 `*Log` 家族的引擎在失败时不提供自动数据恢复。使用 `CHECK TABLE` 查询及时跟踪数据丢失。

## 示例 {#examples}

默认情况下，`CHECK TABLE` 查询显示一般表检查状态：

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

如果您想查看每个单独数据部分的检查状态，可以使用 `check_query_single_value_result` 设置。

此外，要检查表的特定分区，您可以使用 `PARTITION` 关键字。

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

请注意，当部分不存在时，查询返回错误：

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### 接收'已损坏'结果 {#receiving-a-corrupted-result}

:::warning
免责声明：这里描述的过程，包括手动操作或直接删除数据目录中的文件，仅适用于实验或开发环境。**不**要在生产服务器上尝试此操作，因为这可能导致数据丢失或其他意外后果。
:::

删除现有的校验和文件：

```bash
rm /var/lib/clickhouse-server/data/default/t0/201003_3_3_0/checksums.txt
```

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0


Output:

```text
┌─part_path────┬─is_passed─┬─message──────────────────────────────────┐
│ 201003_7_7_0 │         1 │                                          │
│ 201003_3_3_0 │         1 │ Checksums recounted and written to disk. │
└──────────────┴───────────┴──────────────────────────────────────────┘
```

如果 checksums.txt 文件缺失，可以恢复。在 CHECK TABLE 命令执行特定分区时，它将被重新计算并重写，状态仍将报告为 'is_passed = 1'。

您可以通过使用 `CHECK ALL TABLES` 查询检查所有现有的 `(Replicated)MergeTree` 表。

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

如果表已损坏，您可以将未损坏的数据复制到另一个表。为此：

1. 创建一个与损坏表具有相同结构的新表。为此执行查询 `CREATE TABLE <new_table_name> AS <damaged_table_name>`。
2. 将 `max_threads` 值设置为 1，以在单线程中处理下一个查询。为此运行查询 `SET max_threads = 1`。
3. 执行查询 `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>`。此请求将未损坏的数据从损坏的表复制到另一个表中。仅会复制损坏部分之前的数据。
4. 重新启动 `clickhouse-client` 以重置 `max_threads` 值。
