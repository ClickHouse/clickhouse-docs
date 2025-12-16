---
title: '在 ClickHouse 中使用 JOIN'
description: '在 ClickHouse 中使用 JOIN 的入门指南'
keywords: ['JOINs', 'SQL', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'SEMI JOIN', 'ANTI JOIN', 'ANY JOIN', 'ASOF JOIN']
sidebar_label: '在 ClickHouse 中使用 JOIN'
slug: /guides/working-with-joins
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import imdb_schema from '@site/static/images/starter_guides/joins/imdb_schema.png';
import inner_join from '@site/static/images/starter_guides/joins/inner_join.png';
import outer_join from '@site/static/images/starter_guides/joins/outer_join.png';
import cross_join from '@site/static/images/starter_guides/joins/cross_join.png';
import semi_join from '@site/static/images/starter_guides/joins/semi_join.png';
import anti_join from '@site/static/images/starter_guides/joins/anti_join.png';
import any_join from '@site/static/images/starter_guides/joins/any_join.png';
import asof_join from '@site/static/images/starter_guides/joins/asof_join.png';
import asof_example from '@site/static/images/starter_guides/joins/asof_example.png';

ClickHouse 完全支持标准 SQL 联接（join），从而实现高效的数据分析。
在本指南中，你将通过维恩图和示例查询，基于来自[关系型数据集仓库](https://relational.fit.cvut.cz/dataset/IMDb)的规范化 [IMDB](https://en.wikipedia.org/wiki/IMDb) 数据集，了解一些常用的联接类型以及如何使用它们。

## 测试数据和资源 {#test-data-and-resources}

用于创建和加载这些表的说明可以在[此处](/integrations/dbt/guides)找到。
如果您不想在本地创建和加载表，也可以在 [playground](https://sql.clickhouse.com?query_id=AACTS8ZBT3G7SSGN8ZJBJY) 中使用该数据集。

您将使用示例数据集中的以下四张表：

<Image img={imdb_schema} alt="IMDB 模式" />

这四张表中的数据对应电影，每部电影可以有一个或多个类型（genre）。
电影中的角色由演员扮演。

上图中的箭头表示[外键指向主键的关系](https://en.wikipedia.org/wiki/Foreign_key)。例如，`genres` 表中某一行的 `movie_id` 列包含来自 `movies` 表中某一行的 `id` 值。

电影与演员之间存在[多对多关系](https://en.wikipedia.org/wiki/Many-to-many_(data_model))。
这种多对多关系通过使用 `roles` 表被规范化为两个[一对多关系](https://en.wikipedia.org/wiki/One-to-many_(data_model))。
`roles` 表中的每一行都包含 `movies` 表和 `actors` 表中 `id` 列的值。

## ClickHouse 支持的 JOIN 类型 {#join-types-supported-in-clickhouse}

ClickHouse 支持以下类型的 JOIN：

- [INNER JOIN](#inner-join)
- [OUTER JOIN](#left--right--full-outer-join)
- [CROSS JOIN](#cross-join)
- [SEMI JOIN](#left--right-semi-join)
- [ANTI JOIN](#left--right-anti-join)
- [ANY JOIN](#left--right--inner-any-join)
- [ASOF JOIN](#asof-join)

在后续章节中，你将为上述每种 JOIN 类型编写示例查询。

## INNER JOIN {#inner-join}

`INNER JOIN` 对于每一对在连接键上匹配的行，返回由左表该行的列值与右表该行的列值组合而成的结果。
如果一行有多个匹配项，则会返回所有匹配项（意味着对于具有匹配连接键的行，会生成[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)）。

<Image img={inner_join} alt="INNER JOIN（内连接）" />

下面这个查询通过将 `movies` 表与 `genres` 表进行连接，来查找每部电影对应的类型：

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
INNER JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─name───────────────────────────────────┬─genre─────┐
│ 哈利·波特与混血王子 │ 动作    │
│ 哈利·波特与混血王子 │ 冒险 │
│ 哈利·波特与混血王子 │ 家庭    │
│ 哈利·波特与混血王子 │ 奇幻   │
│ 哈利·波特与混血王子 │ 惊悚  │
│ 龙珠Z                           │ 动作    │
│ 龙珠Z                           │ 冒险 │
│ 龙珠Z                           │ 喜剧    │
│ 龙珠Z                           │ 奇幻   │
│ 龙珠Z                           │ 科幻    │
└────────────────────────────────────────┴───────────┘
```

:::note
可以省略 `INNER` 关键字。
:::

可以通过使用以下其他连接类型之一来扩展或修改 `INNER JOIN` 的行为。

## (LEFT / RIGHT / FULL) OUTER JOIN {#left--right--full-outer-join}

`LEFT OUTER JOIN` 的行为类似于 `INNER JOIN`；另外，对于左表中未匹配的行，ClickHouse 会为右表的列返回[默认值](/sql-reference/statements/create/table#default_values)。

`RIGHT OUTER JOIN` 查询类似，同样会返回右表中未匹配行的值，并为左表的列返回默认值。

`FULL OUTER JOIN` 查询结合了 `LEFT` 和 `RIGHT OUTER JOIN`，会返回左右两张表中未匹配行的值，并分别为右表和左表的列返回默认值。

<Image img={outer_join} alt="外连接" />

:::note
ClickHouse 可以[配置](/operations/settings/settings#join_use_nulls)为返回 [NULL](/sql-reference/syntax/#null)，而不是默认值（但出于[性能原因](/sql-reference/data-types/nullable/#storage-features)，不太推荐这样做）。
:::

下面这个查询会找出所有没有类型（genre）的电影：它会查询 `movies` 表中在 `genres` 表里没有匹配项的所有行，因此在查询时会在 `movie_id` 列上得到默认值 0：

```sql
SELECT m.name
FROM movies AS m
LEFT JOIN genres AS g ON m.id = g.movie_id
WHERE g.movie_id = 0
ORDER BY
    m.year DESC,
    m.name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """太平洋战争"""                          │
│ """都灵2006：第二十届冬季奥运会"""        │
│ 亚瑟，电影版                              │
│ 通往特雷比西亚的桥                        │
│ 火星在白羊座                              │
│ 时空主宰                                  │
│ 路易斯·德拉克斯的第九条命                │
│ 悖论                                      │
│ 料理鼠王                                  │
│ """美国老爹"""                            │
└───────────────────────────────────────────┘
```

:::note
可以省略 `OUTER` 关键字。
:::

## CROSS JOIN {#cross-join}

`CROSS JOIN` 会在不考虑连接键的情况下生成两个表的笛卡尔积。
左表中的每一行都会与右表中的每一行组合。

<Image img={cross_join} alt="Cross Join" />

因此，下面的查询会将 `movies` 表中的每一行与 `genres` 表中的每一行组合：

```sql
SELECT
    m.name,
    m.id,
    g.movie_id,
    g.genre
FROM movies AS m
CROSS JOIN genres AS g
LIMIT 10;
```

```response
┌─name─┬─id─┬─movie_id─┬─genre───────┐
│ #28  │  0 │        1 │ Documentary │
│ #28  │  0 │        1 │ Short       │
│ #28  │  0 │        2 │ Comedy      │
│ #28  │  0 │        2 │ Crime       │
│ #28  │  0 │        5 │ Western     │
│ #28  │  0 │        6 │ Comedy      │
│ #28  │  0 │        6 │ Family      │
│ #28  │  0 │        8 │ Animation   │
│ #28  │  0 │        8 │ Comedy      │
│ #28  │  0 │        8 │ Short       │
└──────┴────┴──────────┴─────────────┘
```

虽然前面的示例查询本身意义不大，但可以通过添加 `WHERE` 子句来扩展，将匹配的行关联起来，从而复现 `INNER JOIN` 的行为，用于查找每部电影所属的一个或多个类型（genre）：

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

`CROSS JOIN` 的另一种语法是在 `FROM` 子句中用逗号分隔列出多个表。

如果在查询的 `WHERE` 子句中存在连接表达式，ClickHouse 会将 `CROSS JOIN` [重写](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/Core/Settings.h#L896) 为 `INNER JOIN`。

可以通过 [EXPLAIN SYNTAX](/sql-reference/statements/explain/#explain-syntax) 来验证示例查询（它会返回在 [执行](https://youtu.be/hP6G2Nlz_cA) 之前，查询被重写成的语法级优化版本）：

```sql
EXPLAIN SYNTAX
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─explain─────────────────────────────────────┐
│ SELECT                                      │
│     name AS name,                           │
│     genre AS genre                          │
│ FROM movies AS m                            │
│ ALL INNER JOIN genres AS g ON id = movie_id │
│ WHERE id = movie_id                         │
│ ORDER BY                                    │
│     year DESC,                              │
│     name ASC,                               │
│     genre ASC                               │
│ LIMIT 10                                    │
└─────────────────────────────────────────────┘
```

在语法优化后的 `CROSS JOIN` 查询版本中，`INNER JOIN` 子句中显式加入了 `ALL` 关键字，这是为了在将 `CROSS JOIN` 重写为 `INNER JOIN` 时，依然保持 `CROSS JOIN` 的笛卡尔积语义；而对于 `INNER JOIN`，其笛卡尔积行为可以被[禁用](/operations/settings/settings#join_default_strictness)。

```sql
ALL
```

并且由于如上所述，在 `RIGHT OUTER JOIN` 中可以省略 `OUTER` 关键字，并且可以添加可选的 `ALL` 关键字，因此你可以写成 `ALL RIGHT JOIN`，它同样可以正常工作。

## (LEFT / RIGHT) SEMI JOIN {#left--right-semi-join}

`LEFT SEMI JOIN` 查询会返回左表中那些在右表中至少存在一个联接键匹配的行的列值。
只会返回找到的第一个匹配（不会生成笛卡尔积）。

`RIGHT SEMI JOIN` 查询类似，它会返回右表中所有在左表中至少有一个匹配的行的列值，但同样只返回找到的第一个匹配。

<Image img={semi_join} alt="Semi Join（半连接）" />

此查询会找出所有在 2023 年出演过电影的演员/女演员。
请注意，如果使用普通（`INNER`）连接，如果某位演员/女演员在 2023 年有多个角色，他们会出现多次：

```sql
SELECT
    a.first_name,
    a.last_name
FROM actors AS a
LEFT SEMI JOIN roles AS r ON a.id = r.actor_id
WHERE toYear(created_at) = '2023'
ORDER BY id ASC
LIMIT 10;
```

```response
┌─first_name─┬─last_name──────────────┐
│ Michael    │ 'babeepower' Viera     │
│ Eloy       │ 'Chincheta'            │
│ Dieguito   │ 'El Cigala'            │
│ Antonio    │ 'El de Chipiona'       │
│ José       │ 'El Francés'           │
│ Félix      │ 'El Gato'              │
│ Marcial    │ 'El Jalisco'           │
│ José       │ 'El Morito'            │
│ Francisco  │ 'El Niño de la Manola' │
│ Víctor     │ 'El Payaso'            │
└────────────┴────────────────────────┘
```

## (LEFT / RIGHT) ANTI JOIN {#left--right-anti-join}

`LEFT ANTI JOIN` 返回左表中所有未匹配行的列值。

类似地，`RIGHT ANTI JOIN` 返回右表中所有未匹配行的列值。

<Image img={anti_join} alt="ANTI JOIN" />

前一个外连接示例查询的另一种写法，是使用 ANTI JOIN 来查找在数据集中没有任何类型的电影：

```sql
SELECT m.name
FROM movies AS m
LEFT ANTI JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    year DESC,
    name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """太平洋战争"""                          │
│ """都灵2006：第二十届冬季奥运会"""        │
│ 亚瑟，电影版                              │
│ 通往特雷比西亚的桥                        │
│ 火星在白羊座                              │
│ 时空主宰                                  │
│ 路易斯·德拉克斯的第九条命                │
│ 悖论                                      │
│ 料理鼠王                                  │
│ """美国老爹"""                            │
└───────────────────────────────────────────┘
```

## (LEFT / RIGHT / INNER) ANY JOIN {#left--right--inner-any-join}

`LEFT ANY JOIN` 是 `LEFT OUTER JOIN` 和 `LEFT SEMI JOIN` 的组合，这意味着 ClickHouse 会为左表中的每一行返回列值：如果在右表中存在匹配行，则与该匹配行的列值组合；如果不存在匹配行，则与右表的默认列值组合。
如果左表中的某一行在右表中有多个匹配行，ClickHouse 仅返回第一个找到的匹配行所组合出的列值（笛卡尔积被禁用）。

类似地，`RIGHT ANY JOIN` 是 `RIGHT OUTER JOIN` 和 `RIGHT SEMI JOIN` 的组合。

`INNER ANY JOIN` 则是禁用了笛卡尔积的 `INNER JOIN`。

<Image img={any_join} alt="Any Join" />

下面的示例使用两个通过 [values](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/TableFunctions/TableFunctionValues.h) [table function](/sql-reference/table-functions/) 构造的临时表（`left_table` 和 `right_table`），以抽象示例的方式演示 `LEFT ANY JOIN` 的用法：

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
LEFT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   1 │   0 │
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```

这是使用 `RIGHT ANY JOIN` 的同一条查询：

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
RIGHT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   2 │   2 │
│   3 │   3 │
│   3 │   3 │
│   0 │   4 │
└─────┴─────┘
```

下面是一个使用 `INNER ANY JOIN` 的查询：

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
INNER ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```

## ASOF JOIN {#asof-join}

`ASOF JOIN` 提供了非精确匹配的功能。
如果左表中的某一行在右表中没有精确匹配行，则会使用右表中与之“最近”的那一行作为匹配结果。

这对于时间序列分析尤其有用，并且可以显著降低查询复杂度。

<Image img={asof_join} alt="Asof Join" />

下面的示例对股票市场数据进行时间序列分析。
`quotes` 表按一天中具体时间存储股票代码的报价。
在示例数据中，价格每 10 秒更新一次。
`trades` 表列出了股票代码的成交记录——在某个时间点，某个代码成交了特定数量：

<Image img={asof_example} alt="Asof Example" />

为了计算每笔成交的具体成本，我们需要将成交记录与其最近的报价时间进行匹配。

使用 `ASOF JOIN` 可以以简洁的方式实现：使用 `ON` 子句指定精确匹配条件，使用 `AND` 子句指定最近匹配条件——对于某个特定的代码（精确匹配），需要在 `quotes` 表中查找该代码在成交时间点之前或正好在该时间点的、时间上“最近”的那一行（非精确匹配）：

```sql
SELECT
    t.symbol,
    t.volume,
    t.time AS trade_time,
    q.time AS closest_quote_time,
    q.price AS quote_price,
    t.volume * q.price AS final_price
FROM trades t
ASOF LEFT JOIN quotes q ON t.symbol = q.symbol AND t.time >= q.time
FORMAT Vertical;
```

```response
第1行:
──────
代码:               ABC
成交量:             200
交易时间:           2023-02-22 14:09:05
最近报价时间:       2023-02-22 14:09:00
报价:               32.11
最终价格:           6422

第2行:
──────
代码:               ABC
成交量:             300
交易时间:           2023-02-22 14:09:28
最近报价时间:       2023-02-22 14:09:20
报价:               32.15
最终价格:           9645
```

:::note
`ASOF JOIN` 的 `ON` 子句是必需的，用于在 `AND` 子句的非精确匹配条件之外，再指定一个精确匹配条件。
:::

## 摘要 {#summary}

本指南介绍 ClickHouse 如何支持所有标准 SQL JOIN 类型，以及用于提升分析查询能力的专用 JOIN。
有关 JOIN 的更多详细信息，请参阅 [JOIN](/sql-reference/statements/select/join) 语句的文档。