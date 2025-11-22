---
description: 'ORDER BY 子句文档说明'
sidebar_label: 'ORDER BY'
slug: /sql-reference/statements/select/order-by
title: 'ORDER BY 子句'
doc_type: 'reference'
---



# ORDER BY 子句

`ORDER BY` 子句包含

- 表达式列表，例如 `ORDER BY visits, search_phrase`，
- 在 `SELECT` 子句中引用列的编号列表，例如 `ORDER BY 2, 1`，或
- `ALL`，表示 `SELECT` 子句中的所有列，例如 `ORDER BY ALL`。

要禁用根据列序号进行排序，请将设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 设置为 0。
要禁用根据 `ALL` 进行排序，请将设置 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) 设置为 0。

`ORDER BY` 子句可以带有 `DESC`（降序）或 `ASC`（升序）修饰符，用于确定排序方向。
如果未显式指定排序顺序，则默认使用 `ASC`。
排序方向应用于单个表达式，而不是整个列表，例如 `ORDER BY Visits DESC, SearchPhrase`。
此外，排序是区分大小写的。

在排序表达式上取值相同的行将以任意且非确定性的顺序返回。
如果在 `SELECT` 语句中省略了 `ORDER BY` 子句，则行的顺序同样是任意且非确定性的。



## 特殊值的排序 {#sorting-of-special-values}

`NaN` 和 `NULL` 的排序顺序有两种方式:

- 默认情况下或使用 `NULLS LAST` 修饰符:先排列普通值,然后是 `NaN`,最后是 `NULL`。
- 使用 `NULLS FIRST` 修饰符:先排列 `NULL`,然后是 `NaN`,最后是其他值。

### 示例 {#example}

对于以下表:

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

运行查询 `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` 得到:

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

对浮点数进行排序时,NaN 与其他值分开处理。无论排序顺序如何,NaN 始终排在末尾。换句话说,在升序排序中,NaN 被视为比所有其他数字都大;而在降序排序中,NaN 被视为比所有其他数字都小。


## 排序规则支持 {#collation-support}

对于按 [String](../../../sql-reference/data-types/string.md) 值排序,可以指定排序规则(比较方式)。例如:`ORDER BY SearchPhrase COLLATE 'tr'` - 使用土耳其字母表按关键字升序排序,不区分大小写,假定字符串采用 UTF-8 编码。在 ORDER BY 中,每个表达式可以独立指定或不指定 `COLLATE`。如果指定了 `ASC` 或 `DESC`,`COLLATE` 需在其后指定。使用 `COLLATE` 时,排序始终不区分大小写。

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md) 和 [Tuple](../../../sql-reference/data-types/tuple.md) 支持排序规则。

我们仅建议在对少量行进行最终排序时使用 `COLLATE`,因为使用 `COLLATE` 排序的效率低于按字节进行的常规排序。


## 排序规则示例 {#collation-examples}

仅使用 [String](../../../sql-reference/data-types/string.md) 值的示例:

输入表:

```text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ABC  │
│ 3 │ 123a │
│ 4 │ abc  │
│ 5 │ BCA  │
└───┴──────┘
```

查询:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果:

```text
┌─x─┬─s────┐
│ 3 │ 123a │
│ 4 │ abc  │
│ 2 │ ABC  │
│ 1 │ bca  │
│ 5 │ BCA  │
└───┴──────┘
```

使用 [Nullable](../../../sql-reference/data-types/nullable.md) 的示例:

输入表:

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

查询:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果:

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

使用 [Array](../../../sql-reference/data-types/array.md) 的示例:

输入表:

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

查询:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果:

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

使用 [LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 字符串的示例:

输入表:

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

查询:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

结果:

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

使用 [Tuple](../../../sql-reference/data-types/tuple.md) 的示例:


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


## 实现细节 {#implementation-details}

如果在 `ORDER BY` 之外指定了足够小的 [LIMIT](../../../sql-reference/statements/select/limit.md),则会使用更少的 RAM。否则,内存消耗量与待排序数据量成正比。对于分布式查询处理,如果省略了 [GROUP BY](/sql-reference/statements/select/group-by),排序会在远程服务器上部分完成,然后在请求服务器上合并结果。这意味着对于分布式排序,待排序的数据量可能大于单个服务器的内存容量。

如果 RAM 不足,可以在外部内存中执行排序(在磁盘上创建临时文件)。为此请使用 `max_bytes_before_external_sort` 设置。如果设置为 0(默认值),则禁用外部排序。如果启用,当待排序的数据量达到指定的字节数时,收集的数据会被排序并转储到临时文件中。读取所有数据后,所有已排序的文件会被合并并输出结果。文件会写入配置中的 `/var/lib/clickhouse/tmp/` 目录(默认情况下,但您可以使用 `tmp_path` 参数更改此设置)。您还可以仅在查询超出内存限制时才使用磁盘溢出,即 `max_bytes_ratio_before_external_sort=0.6` 将仅在查询达到 `60%` 内存限制(用户/服务器)时启用磁盘溢出。

运行查询可能会使用超过 `max_bytes_before_external_sort` 的内存。因此,此设置的值必须明显小于 `max_memory_usage`。例如,如果您的服务器有 128 GB RAM 并且需要运行单个查询,请将 `max_memory_usage` 设置为 100 GB,将 `max_bytes_before_external_sort` 设置为 80 GB。

外部排序的效率远低于 RAM 排序。


## 数据读取优化 {#optimization-of-data-reading}

如果 `ORDER BY` 表达式的前缀与表排序键一致,可以通过使用 [optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 设置来优化查询。

启用 `optimize_read_in_order` 设置后,ClickHouse 服务器将使用表索引并按 `ORDER BY` 键的顺序读取数据。这样可以在指定 [LIMIT](../../../sql-reference/statements/select/limit.md) 时避免读取全部数据。因此,对大数据集使用较小 limit 值的查询处理速度会更快。

该优化支持 `ASC` 和 `DESC` 两种排序方式,但不能与 [GROUP BY](/sql-reference/statements/select/group-by) 子句和 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符同时使用。

禁用 `optimize_read_in_order` 设置后,ClickHouse 服务器在处理 `SELECT` 查询时不会使用表索引。

当运行包含 `ORDER BY` 子句、较大 `LIMIT` 值以及需要在找到查询数据之前读取大量记录的 [WHERE](../../../sql-reference/statements/select/where.md) 条件的查询时,建议手动禁用 `optimize_read_in_order`。

以下表引擎支持该优化:

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)(包括[物化视图](/sql-reference/statements/create/view#materialized-view))
- [Merge](../../../engines/table-engines/special/merge.md)
- [Buffer](../../../engines/table-engines/special/buffer.md)

在 `MaterializedView` 引擎表中,该优化适用于类似 `SELECT ... FROM merge_tree_table ORDER BY pk` 的视图查询。但如果视图查询本身不包含 `ORDER BY` 子句,则不支持类似 `SELECT ... FROM view ORDER BY pk` 的查询。


## ORDER BY 表达式 WITH FILL 修饰符 {#order-by-expr-with-fill-modifier}

此修饰符也可以与 [LIMIT ... WITH TIES 修饰符](/sql-reference/statements/select/limit#limit--with-ties-modifier) 结合使用。

`WITH FILL` 修饰符可以设置在 `ORDER BY expr` 之后,并带有可选的 `FROM expr`、`TO expr` 和 `STEP expr` 参数。
`expr` 列的所有缺失值将被顺序填充,其他列将使用默认值填充。

要填充多个列,请在 `ORDER BY` 部分的每个字段名称后添加带有可选参数的 `WITH FILL` 修饰符。

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` 可以应用于数值类型(所有类型的浮点数、十进制数、整数)或 Date/DateTime 类型的字段。当应用于 `String` 字段时,缺失值将用空字符串填充。
当未定义 `FROM const_expr` 时,填充序列使用 `ORDER BY` 中 `expr` 字段的最小值。
当未定义 `TO const_expr` 时,填充序列使用 `ORDER BY` 中 `expr` 字段的最大值。
当定义 `STEP const_numeric_expr` 时,`const_numeric_expr` 对于数值类型按原样解释,对于 Date 类型解释为 `天`,对于 DateTime 类型解释为 `秒`。它还支持表示时间和日期间隔的 [INTERVAL](/sql-reference/data-types/special-data-types/interval/) 数据类型。
当省略 `STEP const_numeric_expr` 时,填充序列对于数值类型使用 `1.0`,对于 Date 类型使用 `1 天`,对于 DateTime 类型使用 `1 秒`。
当定义 `STALENESS const_numeric_expr` 时,查询将生成行,直到与原始数据中前一行的差值超过 `const_numeric_expr`。
`INTERPOLATE` 可以应用于不参与 `ORDER BY WITH FILL` 的列。这些列基于前一个字段值通过应用 `expr` 来填充。如果不存在 `expr`,将重复前一个值。省略列表将导致包含所有允许的列。

不使用 `WITH FILL` 的查询示例:

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

结果:

```text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

应用 `WITH FILL` 修饰符后的相同查询:

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

结果:

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

对于多个字段的情况 `ORDER BY field2 WITH FILL, field1 WITH FILL`,填充顺序将遵循 `ORDER BY` 子句中字段的顺序。

示例:

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

结果:


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

字段 `d1` 没有被填充而是使用了默认值，这是因为对于每个 `d2` 的取值都不存在重复记录，因此无法正确计算 `d1` 的序列。

下面是在 `ORDER BY` 中更改排序字段后的查询：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    '原始数据' AS source
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

下面的查询对列 `d1` 中的每条数据都使用了 1 天的 `INTERVAL` 数据类型：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    '原始数据' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP INTERVAL 1 DAY,
    d2 WITH FILL;
```


结果：

```response
┌─────────d1─┬─────────d2─┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ 原始数据 │
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
│ 1970-02-10 │ 1970-01-05 │ 原始数据 │
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
│ 1970-03-12 │ 1970-01-08 │ 原始数据 │
└────────────┴────────────┴──────────┘
```

未使用 `STALENESS` 的查询示例：

```sql
SELECT number AS key, 5 * number value, '原始数据' AS source
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

应用 `STALENESS 3` 之后的同一条查询：

```sql
SELECT number AS key, 5 * number value, '原始数据' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

结果：

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ 原始数据 │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   5 │    25 │ 原始数据 │
 5. │   6 │     0 │          │
 6. │   7 │     0 │          │
 7. │  10 │    50 │ 原始数据 │
 8. │  11 │     0 │          │
 9. │  12 │     0 │          │
10. │  15 │    75 │ 原始数据 │
11. │  16 │     0 │          │
12. │  17 │     0 │          │
    └─────┴───────┴──────────┘
```

未使用 `INTERPOLATE` 的查询示例：

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, '原始' AS source, number AS inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

结果：

```text
┌───n─┬─source───┬─inter─┐
│   0 │          │     0 │
│ 0.5 │          │     0 │
│   1 │ 原始值 │     1 │
│ 1.5 │          │     0 │
│   2 │          │     0 │
│ 2.5 │          │     0 │
│   3 │          │     0 │
│ 3.5 │          │     0 │
│   4 │ 原始值 │     4 │
│ 4.5 │          │     0 │
│   5 │          │     0 │
│ 5.5 │          │     0 │
│   7 │ 原始值 │     7 │
└─────┴──────────┴───────┘
```

应用了 `INTERPOLATE` 之后的同一条查询：

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


## 按排序前缀分组填充 {#filling-grouped-by-sorting-prefix}

在特定列中具有相同值的行可以独立填充,这在很多场景下非常有用——一个典型的例子是填充时间序列中的缺失值。
假设有以下时间序列表:

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

我们希望为每个传感器独立填充缺失值,填充间隔为 1 秒。
实现方法是将 `sensor_id` 列作为填充 `timestamp` 列的排序前缀:

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

这里,`value` 列使用 `9999` 进行插值,以便更清楚地显示填充的行。
此行为由设置 `use_with_fill_by_sorting_prefix` 控制(默认启用)


## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
