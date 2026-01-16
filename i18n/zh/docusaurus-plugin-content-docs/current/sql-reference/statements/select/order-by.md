---
description: 'ORDER BY 子句参考文档'
sidebar_label: 'ORDER BY'
slug: /sql-reference/statements/select/order-by
title: 'ORDER BY 子句'
doc_type: 'reference'
---

# ORDER BY 子句 \\{#order-by-clause\\}

`ORDER BY` 子句包含：

- 表达式列表，例如 `ORDER BY visits, search_phrase`，
- 引用 `SELECT` 子句中列的数字列表，例如 `ORDER BY 2, 1`，或者
- `ALL`，表示 `SELECT` 子句中的所有列，例如 `ORDER BY ALL`。

要禁用按列序号排序，将设置项 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 设为 0。
要禁用按 `ALL` 排序，将设置项 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) 设为 0。

`ORDER BY` 子句可以带有 `DESC`（降序）或 `ASC`（升序）修饰符，用于指定排序方向。
如果未显式指定排序顺序，则默认使用 `ASC`。
排序方向应用于单个表达式，而不是整个列表，例如 `ORDER BY Visits DESC, SearchPhrase`。
另外，排序是区分大小写的。

对于在排序表达式上具有相同值的行，返回顺序是任意且非确定性的。
如果在 `SELECT` 语句中省略 `ORDER BY` 子句，行的顺序同样是任意且非确定性的。

## 特殊值的排序 \\{#sorting-of-special-values\\}

对 `NaN` 和 `NULL` 的排序顺序有两种处理方式：

* 默认情况下或使用 `NULLS LAST` 修饰符时：先是普通值，然后是 `NaN`，最后是 `NULL`。
* 使用 `NULLS FIRST` 修饰符时：先是 `NULL`，然后是 `NaN`，最后是其他值。

### 示例 \\{#example\\}

对于下表

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    2 │
│ 1 │  nan │
│ 2 │    2 │
│ 3 │    4 │
│ 5 │    6 │
│ 6 │  nan │
│ 7 │ ᴺᵁᴸᴸ │
│ 6 │    7 │
│ 8 │    9 │
└───┴──────┘
```

运行查询 `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` 即可得到：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 7 │ ᴺᵁᴸᴸ │
│ 1 │  nan │
│ 6 │  nan │
│ 2 │    2 │
│ 2 │    2 │
│ 3 │    4 │
│ 5 │    6 │
│ 6 │    7 │
│ 8 │    9 │
└───┴──────┘
```

在对浮点数进行排序时，NaN 会与其他数值分开处理。无论是升序还是降序排序，NaN 都会排在末尾。换句话说，在升序排序时，它们被视为比所有其他数值都大而排在最后；在降序排序时，它们被视为比其余所有数值都小，但同样排在最后。

## 排序规则支持 \\{#collation-support\\}

对于按 [String](../../../sql-reference/data-types/string.md) 值排序，可以指定排序规则（比较方式）。示例：`ORDER BY SearchPhrase COLLATE 'tr'` —— 按关键字升序排序，使用土耳其字母表、不区分大小写，并假定字符串采用 UTF-8 编码。在 ORDER BY 中的每个表达式都可以独立指定或不指定 `COLLATE`。如果指定了 `ASC` 或 `DESC`，则应在其后写上 `COLLATE`。使用 `COLLATE` 时，排序始终为不区分大小写。

在 [LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md) 和 [Tuple](../../../sql-reference/data-types/tuple.md) 中均支持 `COLLATE`。

我们只建议在对少量行进行最终排序时使用 `COLLATE`，因为使用 `COLLATE` 的排序效率低于按字节进行的普通排序。

## 排序规则示例 \\{#collation-examples\\}

仅使用 [String](../../../sql-reference/data-types/string.md) 值的示例：

输入表：

```text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ABC  │
│ 3 │ 123a │
│ 4 │ abc  │
│ 5 │ BCA  │
└───┴──────┘
```

查询：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果：

```text
┌─x─┬─s────┐
│ 3 │ 123a │
│ 4 │ abc  │
│ 2 │ ABC  │
│ 1 │ bca  │
│ 5 │ BCA  │
└───┴──────┘
```

包含 [Nullable](../../../sql-reference/data-types/nullable.md) 的示例：

输入表：

```text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │ ABC  │
│ 4 │ 123a │
│ 5 │ abc  │
│ 6 │ ᴺᵁᴸᴸ │
│ 7 │ BCA  │
└───┴──────┘
```

查询：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果：

```text
┌─x─┬─s────┐
│ 4 │ 123a │
│ 5 │ abc  │
│ 3 │ ABC  │
│ 1 │ bca  │
│ 7 │ BCA  │
│ 6 │ ᴺᵁᴸᴸ │
│ 2 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

使用 [Array](../../../sql-reference/data-types/array.md) 的示例：

输入表：

```text
┌─x─┬─s─────────────┐
│ 1 │ ['Z']         │
│ 2 │ ['z']         │
│ 3 │ ['a']         │
│ 4 │ ['A']         │
│ 5 │ ['z','a']     │
│ 6 │ ['z','a','a'] │
│ 7 │ ['']          │
└───┴───────────────┘
```

查询：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果：

```text
┌─x─┬─s─────────────┐
│ 7 │ ['']          │
│ 3 │ ['a']         │
│ 4 │ ['A']         │
│ 2 │ ['z']         │
│ 5 │ ['z','a']     │
│ 6 │ ['z','a','a'] │
│ 1 │ ['Z']         │
└───┴───────────────┘
```

包含 [LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 字符串的示例：

输入表：

```response
┌─x─┬─s───┐
│ 1 │ Z   │
│ 2 │ z   │
│ 3 │ a   │
│ 4 │ A   │
│ 5 │ za  │
│ 6 │ zaa │
│ 7 │     │
└───┴─────┘
```

查询：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果：

```response
┌─x─┬─s───┐
│ 7 │     │
│ 3 │ a   │
│ 4 │ A   │
│ 2 │ z   │
│ 1 │ Z   │
│ 5 │ za  │
│ 6 │ zaa │
└───┴─────┘
```

使用 [Tuple](../../../sql-reference/data-types/tuple.md) 的示例：

```response
┌─x─┬─s───────┐
│ 1 │ (1,'Z') │
│ 2 │ (1,'z') │
│ 3 │ (1,'a') │
│ 4 │ (2,'z') │
│ 5 │ (1,'A') │
│ 6 │ (2,'Z') │
│ 7 │ (2,'A') │
└───┴─────────┘
```

查询：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果：

```response
┌─x─┬─s───────┐
│ 3 │ (1,'a') │
│ 5 │ (1,'A') │
│ 2 │ (1,'z') │
│ 1 │ (1,'Z') │
│ 7 │ (2,'A') │
│ 4 │ (2,'z') │
│ 6 │ (2,'Z') │
└───┴─────────┘
```

## 实现细节 \\{#implementation-details\\}

如果在 `ORDER BY` 的基础上再指定足够小的 [LIMIT](../../../sql-reference/statements/select/limit.md)，会占用更少的 RAM。否则，内存消耗量与用于排序的数据量成正比。对于分布式查询处理，如果省略了 [GROUP BY](/sql-reference/statements/select/group-by)，排序会在远程服务器上部分完成，然后在发起请求的服务器上进行结果合并。这意味着对于分布式排序，需要排序的数据量可能会大于单个服务器上的可用内存。

如果 RAM 不足，可以使用外部存储执行排序（在磁盘上创建临时文件）。为此使用设置 `max_bytes_before_external_sort`。如果其值为 0（默认值），则禁用外部排序。如果启用该设置，当待排序数据量达到指定的字节数时，已收集的数据会被排序并写出到一个临时文件。所有数据读取完成后，所有已排序文件会被合并并输出结果。文件会写入配置中的 `/var/lib/clickhouse/tmp/` 目录（默认路径，你也可以使用 `tmp_path` 参数更改该设置）。你也可以只在查询超出内存限制时才启用落盘，例如 `max_bytes_ratio_before_external_sort=0.6` 将只会在查询达到 `60%` 内存限制（用户/服务器）时才触发落盘到磁盘。

执行查询时使用的内存可能会超过 `max_bytes_before_external_sort`。因此，该设置的取值必须显著小于 `max_memory_usage`。例如，如果你的服务器有 128 GB RAM，并且需要运行单个查询，可以将 `max_memory_usage` 设为 100 GB，将 `max_bytes_before_external_sort` 设为 80 GB。

外部排序的效率远低于在 RAM 中进行的排序。

## 数据读取优化 \\{#optimization-of-data-reading\\}

如果 `ORDER BY` 表达式的前缀与表的排序键前缀一致，则可以通过使用 [optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 设置来优化查询。

当启用 `optimize_read_in_order` 设置时，ClickHouse 服务器会使用表索引，并按照 `ORDER BY` 键的顺序读取数据。这样在指定了 [LIMIT](../../../sql-reference/statements/select/limit.md) 的情况下，可以避免读取全部数据。因此，对于数据量很大但 LIMIT 值较小的查询，请求处理会更快。

该优化同时支持 `ASC` 和 `DESC`，但无法与 [GROUP BY](/sql-reference/statements/select/group-by) 子句以及 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符同时使用。

当禁用 `optimize_read_in_order` 设置时，ClickHouse 服务器在处理 `SELECT` 查询时不会使用表索引。

在执行带有 `ORDER BY` 子句、较大 `LIMIT`，以及 [WHERE](../../../sql-reference/statements/select/where.md) 条件且在找到目标数据前需要读取大量记录的查询时，建议手动禁用 `optimize_read_in_order`。

该优化支持以下表引擎：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（包括[物化视图](/sql-reference/statements/create/view#materialized-view)），
- [Merge](../../../engines/table-engines/special/merge.md)，
- [Buffer](../../../engines/table-engines/special/buffer.md)

在 `MaterializedView` 引擎的表中，该优化适用于类似 `SELECT ... FROM merge_tree_table ORDER BY pk` 的视图。但对于类似 `SELECT ... FROM view ORDER BY pk` 的查询，如果视图定义中的查询本身没有 `ORDER BY` 子句，则不支持该优化。

## 带 WITH FILL 修饰符的 ORDER BY 表达式 \\{#order-by-expr-with-fill-modifier\\}

该修饰符也可以与 [LIMIT ... WITH TIES 修饰符](/sql-reference/statements/select/limit#limit--with-ties-modifier) 组合使用。

`WITH FILL` 修饰符可以在 `ORDER BY expr` 之后使用，并可带上可选的 `FROM expr`、`TO expr` 和 `STEP expr` 参数。
`expr` 列中所有缺失的值将按顺序补齐，其他列将按默认值进行填充。

如需对多个列进行填充，可在 `ORDER BY` 子句中每个字段名之后添加带有可选参数的 `WITH FILL` 修饰符。

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` 可用于数值类型字段（各种 float、decimal、int）或 Date/DateTime 类型字段。应用于 `String` 字段时，缺失值将被填充为空字符串。
当未指定 `FROM const_expr` 时，填充序列使用来自 `ORDER BY` 的 `expr` 字段最小值。
当未指定 `TO const_expr` 时，填充序列使用来自 `ORDER BY` 的 `expr` 字段最大值。
当指定了 `STEP const_numeric_expr` 时，对于数值类型，`const_numeric_expr` 按“原值”解释；对于 Date 类型，按 `days` 解释；对于 DateTime 类型，按 `seconds` 解释。它还支持表示时间和日期区间的 [INTERVAL](/sql-reference/data-types/special-data-types/interval/) 数据类型。
当省略 `STEP const_numeric_expr` 时，填充序列对数值类型使用 `1.0`，对 Date 类型使用 `1 day`，对 DateTime 类型使用 `1 second`。
当指定了 `STALENESS const_numeric_expr` 时，查询会持续生成行，直到原始数据中与前一行的差值超过 `const_numeric_expr`。
`INTERPOLATE` 可应用于未参与 `ORDER BY WITH FILL` 的列。这些列将基于前一行字段的值并应用 `expr` 来填充。如果未指定 `expr`，则会重复前一个值。省略该列表将导致包含所有允许的列。

不带 `WITH FILL` 的查询示例：

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

结果：

```text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

使用 `WITH FILL` 修饰符后的同一查询：

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

结果：

```text
┌───n─┬─source───┐
│   0 │          │
│ 0.5 │          │
│   1 │ original │
│ 1.5 │          │
│   2 │          │
│ 2.5 │          │
│   3 │          │
│ 3.5 │          │
│   4 │ original │
│ 4.5 │          │
│   5 │          │
│ 5.5 │          │
│   7 │ original │
└─────┴──────────┘
```

对于包含多个字段的情况，例如 `ORDER BY field2 WITH FILL, field1 WITH FILL`，填充顺序将与 `ORDER BY` 子句中字段的先后顺序一致。

示例：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d2 WITH FILL,
    d1 WITH FILL STEP 5;
```

结果：

```text
┌───d1───────┬───d2───────┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-01 │ 1970-01-03 │          │
│ 1970-01-01 │ 1970-01-04 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-01-01 │ 1970-01-06 │          │
│ 1970-01-01 │ 1970-01-07 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

字段 `d1` 不会被填充默认值，这是因为我们没有针对 `d2` 的重复取值，因此无法正确计算 `d1` 的序列。

下面是修改了 `ORDER BY` 中字段后的查询：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP 5,
    d2 WITH FILL;
```

结果：

```text
┌───d1───────┬───d2───────┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-16 │ 1970-01-01 │          │
│ 1970-01-21 │ 1970-01-01 │          │
│ 1970-01-26 │ 1970-01-01 │          │
│ 1970-01-31 │ 1970-01-01 │          │
│ 1970-02-05 │ 1970-01-01 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-02-15 │ 1970-01-01 │          │
│ 1970-02-20 │ 1970-01-01 │          │
│ 1970-02-25 │ 1970-01-01 │          │
│ 1970-03-02 │ 1970-01-01 │          │
│ 1970-03-07 │ 1970-01-01 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

下面的查询在列 `d1` 上为每条填充的数据使用 1 天的 `INTERVAL` 类型：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP INTERVAL 1 DAY,
    d2 WITH FILL;
```

结果：

```response
┌─────────d1─┬─────────d2─┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-12 │ 1970-01-01 │          │
│ 1970-01-13 │ 1970-01-01 │          │
│ 1970-01-14 │ 1970-01-01 │          │
│ 1970-01-15 │ 1970-01-01 │          │
│ 1970-01-16 │ 1970-01-01 │          │
│ 1970-01-17 │ 1970-01-01 │          │
│ 1970-01-18 │ 1970-01-01 │          │
│ 1970-01-19 │ 1970-01-01 │          │
│ 1970-01-20 │ 1970-01-01 │          │
│ 1970-01-21 │ 1970-01-01 │          │
│ 1970-01-22 │ 1970-01-01 │          │
│ 1970-01-23 │ 1970-01-01 │          │
│ 1970-01-24 │ 1970-01-01 │          │
│ 1970-01-25 │ 1970-01-01 │          │
│ 1970-01-26 │ 1970-01-01 │          │
│ 1970-01-27 │ 1970-01-01 │          │
│ 1970-01-28 │ 1970-01-01 │          │
│ 1970-01-29 │ 1970-01-01 │          │
│ 1970-01-30 │ 1970-01-01 │          │
│ 1970-01-31 │ 1970-01-01 │          │
│ 1970-02-01 │ 1970-01-01 │          │
│ 1970-02-02 │ 1970-01-01 │          │
│ 1970-02-03 │ 1970-01-01 │          │
│ 1970-02-04 │ 1970-01-01 │          │
│ 1970-02-05 │ 1970-01-01 │          │
│ 1970-02-06 │ 1970-01-01 │          │
│ 1970-02-07 │ 1970-01-01 │          │
│ 1970-02-08 │ 1970-01-01 │          │
│ 1970-02-09 │ 1970-01-01 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-02-11 │ 1970-01-01 │          │
│ 1970-02-12 │ 1970-01-01 │          │
│ 1970-02-13 │ 1970-01-01 │          │
│ 1970-02-14 │ 1970-01-01 │          │
│ 1970-02-15 │ 1970-01-01 │          │
│ 1970-02-16 │ 1970-01-01 │          │
│ 1970-02-17 │ 1970-01-01 │          │
│ 1970-02-18 │ 1970-01-01 │          │
│ 1970-02-19 │ 1970-01-01 │          │
│ 1970-02-20 │ 1970-01-01 │          │
│ 1970-02-21 │ 1970-01-01 │          │
│ 1970-02-22 │ 1970-01-01 │          │
│ 1970-02-23 │ 1970-01-01 │          │
│ 1970-02-24 │ 1970-01-01 │          │
│ 1970-02-25 │ 1970-01-01 │          │
│ 1970-02-26 │ 1970-01-01 │          │
│ 1970-02-27 │ 1970-01-01 │          │
│ 1970-02-28 │ 1970-01-01 │          │
│ 1970-03-01 │ 1970-01-01 │          │
│ 1970-03-02 │ 1970-01-01 │          │
│ 1970-03-03 │ 1970-01-01 │          │
│ 1970-03-04 │ 1970-01-01 │          │
│ 1970-03-05 │ 1970-01-01 │          │
│ 1970-03-06 │ 1970-01-01 │          │
│ 1970-03-07 │ 1970-01-01 │          │
│ 1970-03-08 │ 1970-01-01 │          │
│ 1970-03-09 │ 1970-01-01 │          │
│ 1970-03-10 │ 1970-01-01 │          │
│ 1970-03-11 │ 1970-01-01 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

未使用 `STALENESS` 的查询示例：

```sql
SELECT number AS key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL;
```

结果：

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ original │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   3 │     0 │          │
 5. │   4 │     0 │          │
 6. │   5 │    25 │ original │
 7. │   6 │     0 │          │
 8. │   7 │     0 │          │
 9. │   8 │     0 │          │
10. │   9 │     0 │          │
11. │  10 │    50 │ original │
12. │  11 │     0 │          │
13. │  12 │     0 │          │
14. │  13 │     0 │          │
15. │  14 │     0 │          │
16. │  15 │    75 │ original │
    └─────┴───────┴──────────┘
```

对同一查询应用 `STALENESS 3` 后：

```sql
SELECT number AS key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

结果：

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ original │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   5 │    25 │ original │
 5. │   6 │     0 │          │
 6. │   7 │     0 │          │
 7. │  10 │    50 │ original │
 8. │  11 │     0 │          │
 9. │  12 │     0 │          │
10. │  15 │    75 │ original │
11. │  16 │     0 │          │
12. │  17 │     0 │          │
    └─────┴───────┴──────────┘
```

未使用 `INTERPOLATE` 的查询示例：

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number AS inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

结果：

```text
┌───n─┬─source───┬─inter─┐
│   0 │          │     0 │
│ 0.5 │          │     0 │
│   1 │ original │     1 │
│ 1.5 │          │     0 │
│   2 │          │     0 │
│ 2.5 │          │     0 │
│   3 │          │     0 │
│ 3.5 │          │     0 │
│   4 │ original │     4 │
│ 4.5 │          │     0 │
│   5 │          │     0 │
│ 5.5 │          │     0 │
│   7 │ original │     7 │
└─────┴──────────┴───────┘
```

应用 `INTERPOLATE` 后的同一查询：

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number AS inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5 INTERPOLATE (inter AS inter + 1);
```

结果：

```text
┌───n─┬─source───┬─inter─┐
│   0 │          │     0 │
│ 0.5 │          │     0 │
│   1 │ original │     1 │
│ 1.5 │          │     2 │
│   2 │          │     3 │
│ 2.5 │          │     4 │
│   3 │          │     5 │
│ 3.5 │          │     6 │
│   4 │ original │     4 │
│ 4.5 │          │     5 │
│   5 │          │     6 │
│ 5.5 │          │     7 │
│   7 │ original │     7 │
└─────┴──────────┴───────┘
```

## 按排序前缀分组填充 \\{#filling-grouped-by-sorting-prefix\\}

在某些情况下，按特定列中取值相同的行分别独立进行填充会很有用——一个很好的示例就是在时间序列中填充缺失值。
假设有如下的时间序列表：

```sql
CREATE TABLE timeseries
(
    `sensor_id` UInt64,
    `timestamp` DateTime64(3, 'UTC'),
    `value` Float64
)
ENGINE = Memory;

SELECT * FROM timeseries;

┌─sensor_id─┬───────────────timestamp─┬─value─┐
│       234 │ 2021-12-01 00:00:03.000 │     3 │
│       432 │ 2021-12-01 00:00:01.000 │     1 │
│       234 │ 2021-12-01 00:00:07.000 │     7 │
│       432 │ 2021-12-01 00:00:05.000 │     5 │
└───────────┴─────────────────────────┴───────┘
```

我们希望以 1 秒为间隔，分别对每个传感器填充缺失值。
具体做法是使用 `sensor_id` 列作为排序前缀，对 `timestamp` 列进行填充：

```sql
SELECT *
FROM timeseries
ORDER BY
    sensor_id,
    timestamp WITH FILL
INTERPOLATE ( value AS 9999 )

┌─sensor_id─┬───────────────timestamp─┬─value─┐
│       234 │ 2021-12-01 00:00:03.000 │     3 │
│       234 │ 2021-12-01 00:00:04.000 │  9999 │
│       234 │ 2021-12-01 00:00:05.000 │  9999 │
│       234 │ 2021-12-01 00:00:06.000 │  9999 │
│       234 │ 2021-12-01 00:00:07.000 │     7 │
│       432 │ 2021-12-01 00:00:01.000 │     1 │
│       432 │ 2021-12-01 00:00:02.000 │  9999 │
│       432 │ 2021-12-01 00:00:03.000 │  9999 │
│       432 │ 2021-12-01 00:00:04.000 │  9999 │
│       432 │ 2021-12-01 00:00:05.000 │     5 │
└───────────┴─────────────────────────┴───────┘
```

在这里，`value` 列被填充值为 `9999`，只是为了让填充的行更加显眼。
此行为通过设置 `use_with_fill_by_sorting_prefix` 参数来控制（该参数默认启用）。

## 相关内容 \\{#related-content\\}

- 博客文章：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
