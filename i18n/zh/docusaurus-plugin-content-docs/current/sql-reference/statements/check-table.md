---
description: 'CHECK TABLE 文档'
sidebar_label: 'CHECK TABLE'
sidebar_position: 41
slug: /sql-reference/statements/check-table
title: 'CHECK TABLE 语句'
doc_type: 'reference'
---

ClickHouse 中的 `CHECK TABLE` 查询用于对特定表或其分区执行校验。它通过验证校验和以及其他内部数据结构来确保数据完整性。

尤其是，它会将实际文件大小与存储在服务器上的预期值进行比较。如果文件大小与存储值不匹配，则意味着数据已损坏。例如，这可能是由于在查询执行期间系统崩溃造成的。

:::warning
`CHECK TABLE` 查询可能会读取表中的所有数据并占用较多资源，因此资源消耗较高。
在执行该查询之前，请考虑其对性能和资源使用的潜在影响。
该查询不会提升系统性能，如果未完全理解其影响，请不要执行该查询。
:::

## 语法 \\{#syntax\\}

查询的基本语法如下：

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

* `table_name`：指定要检查的表名。
* `partition_expression`：（可选）如果要检查表中的某个特定分区，可以使用该表达式来指定分区。
* `part_name`：（可选）如果要检查表中的某个特定数据分片，可以添加字符串字面量来指定分片名称。
* `FORMAT format`：（可选）用于指定结果的输出格式。
* `SETTINGS`：（可选）用于设置附加参数。
  * （可选）：[check&#95;query&#95;single&#95;value&#95;result](../../operations/settings/settings#check_query_single_value_result)：该设置控制输出是详细结果（`0`）还是汇总结果（`1`）。
  * 也可以应用其他设置。如果你不需要结果具有确定性的顺序，可以将 `max_threads` 设为大于 1 的值以加快查询速度。

查询的响应结果取决于 `check_query_single_value_result` 设置的取值。
当 `check_query_single_value_result = 1` 时，仅返回包含单行的 `result` 列。如果完整性检查通过，该行中的值为 `1`；如果数据损坏，则为 `0`。

当 `check_query_single_value_result = 0` 时，查询会返回以下列：

* `part_path`：表示数据分片的路径或文件名。
  * `is_passed`：如果该分片的检查成功则返回 1，否则返回 0。
  * `message`：与检查相关的任何附加消息，例如错误或成功消息。

`CHECK TABLE` 查询支持以下表引擎：

* [Log](../../engines/table-engines/log-family/log.md)
* [TinyLog](../../engines/table-engines/log-family/tinylog.md)
* [StripeLog](../../engines/table-engines/log-family/stripelog.md)
* [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

在使用其他表引擎的表上执行该查询会引发 `NOT_IMPLEMENTED` 异常。

`*Log` 家族中的引擎在发生故障时不提供自动数据恢复。使用 `CHECK TABLE` 查询来及时跟踪数据丢失情况。

## 示例 \\{#examples\\}

默认情况下，`CHECK TABLE` 查询会显示表的整体检查状态：

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

如果你想查看每个数据分片的检查状态，可以使用 `check_query_single_value_result` 设置。

另外，如果要检查表的某个特定分区，可以使用 `PARTITION` 关键字。

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

同样，你可以使用 `PART` 关键字来检查表中的特定数据分片。

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

请注意，如果该 part 不存在，查询将报错：

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### 遇到“Corrupted”结果 \\{#receiving-a-corrupted-result\\}

:::warning
免责声明：此处描述的操作步骤（包括直接在数据目录中手动修改或删除文件）仅适用于实验或开发环境。**不要**在生产服务器上尝试此操作，否则可能导致数据丢失或其他意外后果。
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

如果缺少 `checksums.txt` 文件，可以恢复该文件。它会在针对特定分区执行 `CHECK TABLE` 命令时被重新计算并写回磁盘，且状态仍将报告为 `is_passed = 1`。

可以通过使用 `CHECK ALL TABLES` 查询一次性检查所有现有的 `(Replicated)MergeTree` 表。

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

如果表已损坏，可以将未损坏的数据复制到另一张表。操作步骤如下：

1.  创建一个与损坏表结构相同的新表。执行查询：`CREATE TABLE <new_table_name> AS <damaged_table_name>`。
2.  将 `max_threads` 的值设置为 1，以便下一条查询以单线程方式执行。执行查询：`SET max_threads = 1`。
3.  执行查询：`INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>`。此查询会将未损坏的数据从损坏表复制到另一张表中，只会复制到损坏位置之前的数据。
4.  重启 `clickhouse-client` 以重置 `max_threads` 的值。