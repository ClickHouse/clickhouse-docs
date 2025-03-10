---
slug: /sql-reference/statements/select/order-by
sidebar_label: 'ORDER BY'
---


# ORDER BY 子句

`ORDER BY` 子句包含

- 表达式列表，例如 `ORDER BY visits, search_phrase`，
- 引用 `SELECT` 子句中列的数字列表，例如 `ORDER BY 2, 1`，或
- `ALL`，表示 `SELECT` 子句的所有列，例如 `ORDER BY ALL`。

要禁用按列编号排序，请将设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 设置为 0。
要禁用按 `ALL` 排序，请将设置 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) 设置为 0。

`ORDER BY` 子句可以通过 `DESC`（降序）或 `ASC`（升序）修饰符进行修饰，以确定排序方向。
除非指定了显式的排序顺序，默认使用 `ASC`。
排序方向适用于单个表达式，而不是整个列表，例如 `ORDER BY Visits DESC, SearchPhrase`。
此外，排序是区分大小写的。

对于具有相同排序表达式值的行将以任意且非确定性顺序返回。
如果在 `SELECT` 语句中省略 `ORDER BY` 子句，则行的顺序也是任意且非确定性。

## 特殊值的排序 {#sorting-of-special-values}

对 `NaN` 和 `NULL` 排序顺序有两种处理方式：

- 默认情况下或使用 `NULLS LAST` 修饰符：先是值，然后是 `NaN`，最后是 `NULL`。
- 使用 `NULLS FIRST` 修饰符：先是 `NULL`，然后是 `NaN`，最后是其他值。

### 示例 {#example}

对于表

``` text
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

运行查询 `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` 以获取：

``` text
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

当浮点数被排序时，NaNs 会与其他值分开。无论排序顺序如何，NaNs 都在最后。换句话说，对于升序排序，NaNs 被放置在所有其他数字之上，而对于降序排序，它们被放置在剩余数字之下。

## 排序支持 {#collation-support}

对于按 [String](../../../sql-reference/data-types/string.md) 值排序，可以指定排序规则（比较）。示例：`ORDER BY SearchPhrase COLLATE 'tr'` - 用土耳其字母表按关键字升序排序，区分大小写，假设字符串为 UTF-8 编码。`COLLATE` 可以单独为 `ORDER BY` 中的每个表达式指定或不指定。如果指定了 `ASC` 或 `DESC`，则 `COLLATE` 在其后指定。在使用 `COLLATE` 时，排序始终为不区分大小写。

排序规则在 [LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md) 和 [Tuple](../../../sql-reference/data-types/tuple.md) 中受到支持。

我们只建议在最终排序少量行时使用 `COLLATE`，因为使用 `COLLATE` 的排序效率低于按字节正常排序。

## 排序示例 {#collation-examples}

仅包含 [String](../../../sql-reference/data-types/string.md) 值的示例：

输入表：

``` text
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

``` text
┌─x─┬─s────┐
│ 3 │ 123a │
│ 4 │ abc  │
│ 2 │ ABC  │
│ 1 │ bca  │
│ 5 │ BCA  │
└───┴──────┘
```

使用 [Nullable](../../../sql-reference/data-types/nullable.md) 的示例：

输入表：

``` text
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

``` text
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

``` text
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

``` text
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

使用 [LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 字符串的示例：

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

## 实施细节 {#implementation-details}

如果除了 `ORDER BY` 外，还指定了足够小的 [LIMIT](../../../sql-reference/statements/select/limit.md)，则使用的内存较少。否则，花费的内存量与用于排序的数据量成正比。对于分布式查询处理，如果省略 [GROUP BY](/sql-reference/statements/select/group-by)，则排序部分在远程服务器上进行，结果在请求服务器上合并。这意味着对于分布式排序，待排序的数据量可能大于单个服务器上的内存。

如果内存不足，可以在外部内存中进行排序（在磁盘上创建临时文件）。为此，使用设置 `max_bytes_before_external_sort`。如果设置为 0（默认），则禁用外部排序。如果启用，当待排序的数据量达到指定字节数时，收集到的数据将被排序并转储到临时文件中。读取所有数据后，所有已排序的文件将合并并输出结果。文件写入配置中的 `/var/lib/clickhouse/tmp/` 目录（默认情况下，但可以使用 `tmp_path` 参数更改此设置）。

运行查询可能会使用比 `max_bytes_before_external_sort` 更多的内存。因此，该设置必须具有明显小于 `max_memory_usage` 的值。例如，如果服务器有 128 GB 的 RAM，且您需要运行单个查询，将 `max_memory_usage` 设置为 100 GB，并将 `max_bytes_before_external_sort` 设置为 80 GB。

外部排序的效率远低于 RAM 中的排序。

## 数据读取的优化 {#optimization-of-data-reading}

如果 `ORDER BY` 表达式有一个与表排序键相同的前缀，可以使用设置 [optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 优化查询。

当启用 `optimize_read_in_order` 设置时，ClickHouse 服务器使用表索引并按 `ORDER BY` 键的顺序读取数据。这可以避免在指定了 [LIMIT](../../../sql-reference/statements/select/limit.md) 的情况下读取所有数据。因此，对于大数据的小限制的查询处理更快。

优化适用于 `ASC` 和 `DESC`，并且与 [GROUP BY](/sql-reference/statements/select/group-by) 子句以及 [FINAL](/sql-reference/statements/select/from#final-modifier) 修饰符不兼容。

当禁用 `optimize_read_in_order` 设置时，ClickHouse 服务器在处理 `SELECT` 查询时不使用表索引。

在运行具有 `ORDER BY` 子句、大 `LIMIT` 和 [WHERE](../../../sql-reference/statements/select/where.md) 条件的查询时，可以考虑手动禁用 `optimize_read_in_order`，因为这需要在找到查询数据之前读取大量记录。

优化支持以下表引擎：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（包括 [物化视图](/sql-reference/statements/create/view#materialized-view)），
- [Merge](../../../engines/table-engines/special/merge.md)，
- [Buffer](../../../engines/table-engines/special/buffer.md)

在 `MaterializedView` 引擎的表中，优化支持视图，例如 `SELECT ... FROM merge_tree_table ORDER BY pk`。但是在查询像 `SELECT ... FROM view ORDER BY pk` 如果视图查询没有 `ORDER BY` 子句时则不支持。

## 带填充修饰符的 ORDER BY Expr {#order-by-expr-with-fill-modifier}

此修饰符也可以与 [LIMIT ... WITH TIES 修饰符](/sql-reference/statements/select/limit#limit--with-ties-modifier) 结合使用。

`WITH FILL` 修饰符可以在 `ORDER BY expr` 后面设置，后面可选参数为 `FROM expr`、`TO expr` 和 `STEP expr`。
所有缺失的 `expr` 列的值将按顺序填充，其他列将填充默认值。

要填充多个列，在 `ORDER BY` 部分的每个字段名称后添加 `WITH FILL` 修饰符及可选参数。

``` sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` 可应用于具有数值（所有类型的浮点、十进制、整型）或日期/日期时间类型的字段。应用于 `String` 字段时，缺失的值填充为空字符串。
当未定义 `FROM const_expr` 时，填充顺序使用 `ORDER BY` 中 `expr` 字段的最小值。
当未定义 `TO const_expr` 时，填充顺序使用 `ORDER BY` 中 `expr` 字段的最大值。
当定义了 `STEP const_numeric_expr` 时，`const_numeric_expr` 解释为数值类型的原样，作为日期类型的 `days`，作为日期时间类型的 `seconds`。它还支持表示时间和日期间隔的 [INTERVAL](/sql-reference/data-types/special-data-types/interval/) 数据类型。
当省略 `STEP const_numeric_expr` 时，填充序列使用数值类型的 `1.0`、日期类型的 `1 day` 和日期时间类型的 `1 second`。
当定义了 `STALENESS const_numeric_expr` 时，查询将生成行，直到原始数据中与前一行的差异超过 `const_numeric_expr`。
`INTERPOLATE` 可以应用于不参与 `ORDER BY WITH FILL` 的列。这些列根据先前字段的值来填充，应用 `expr`。如果未提供 `expr`，则会重复先前的值。省略列表将导致包括所有允许的列。

没有 `WITH FILL` 的查询示例：

``` sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

结果：

``` text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

应用 `WITH FILL` 修饰符后的相同查询：

``` sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

结果：

``` text
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

对于多个字段的情况 `ORDER BY field2 WITH FILL, field1 WITH FILL`，填充顺序将遵循 `ORDER BY` 子句中字段的顺序。

示例：

``` sql
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

``` text
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

字段 `d1` 没有填充并使用默认值，因为我们对 `d2` 值没有重复值，无法正确计算 `d1` 的序列。

以下查询在 `ORDER BY` 中更改字段后的结果：

``` sql
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

``` text
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

以下查询使用 `INTERVAL` 数据类型的每个填充在列 `d1` 上的示例：

``` sql
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
└────────────┴────────────┴──────────┘
```

没有 `STALENESS` 的查询示例：

``` sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL;
```

结果：

``` text
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

在应用 `STALENESS 3` 后相同的查询：

``` sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

结果：

``` text
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

没有 `INTERPOLATE` 的查询示例：

``` sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

结果：

``` text
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

应用 `INTERPOLATE` 后的相同查询：

``` sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5 INTERPOLATE (inter AS inter + 1);
```

结果：

``` text
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

## 按排序前缀填充 {#filling-grouped-by-sorting-prefix}

填充具有特定列相同值的行独立地可能很有用，一个很好的例子是填充时间序列中的缺失值。
假设有以下时间序列表：

``` sql
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

我们希望以 1 秒间隔填充每个传感器的缺失值。
实现此目的的方法是将 `sensor_id` 列用作填充 `timestamp` 列的排序前缀：

```sql
SELECT *
FROM timeseries
ORDER BY
    sensor_id,
    timestamp WITH FILL
INTERPOLATE ( value AS 9999 )
```

结果：

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

在这里，`value` 列用 `9999` 插值，以便填充的行更为显眼。
这种行为由设置 `use_with_fill_by_sorting_prefix` 控制（默认启用）。

## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
