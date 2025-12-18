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

ClickHouse 完全支持标准 SQL JOIN，从而实现高效的数据分析。
在本指南中，我们将借助维恩（Venn）图和示例查询，了解一些常用的 JOIN 类型，并展示如何在一个规范化的 [IMDB](https://en.wikipedia.org/wiki/IMDb) 数据集上使用它们，该数据集来源于 [relational dataset repository](https://relational.fit.cvut.cz/dataset/IMDb)。


## 测试数据和资源 {#test-data-and-resources}

有关如何创建和加载这些表的说明可以在[此处](/integrations/dbt/guides)找到。
如果你不想在本地创建和加载这些表，该数据集也可以在 [playground](https://sql.clickhouse.com?query_id=AACTS8ZBT3G7SSGN8ZJBJY) 中直接使用。

你将使用示例数据集中的以下四个表：

<Image img={imdb_schema} alt="IMDB Schema" />

这四个表中的数据表示电影，每部电影可以有一个或多个类型（genre）。
电影中的角色由演员扮演。

上图中的箭头表示[外键到主键的关系](https://en.wikipedia.org/wiki/Foreign_key)。例如，`genres` 表中某一行的 `movie_id` 列包含 `movies` 表中某一行的 `id` 值。

电影与演员之间是[多对多关系](https://en.wikipedia.org/wiki/Many-to-many_(data_model))。
这种多对多关系通过使用 `roles` 表被规范化为两个[一对多关系](https://en.wikipedia.org/wiki/One-to-many_(data_model))。
`roles` 表中的每一行都包含 `movies` 表和 `actors` 表中 `id` 列的值。

## ClickHouse 中支持的 JOIN 类型 {#join-types-supported-in-clickhouse}

ClickHouse 支持以下几种 JOIN 类型：

- [INNER JOIN](#inner-join)
- [OUTER JOIN](#left--right--full-outer-join)
- [CROSS JOIN](#cross-join)
- [SEMI JOIN](#left--right-semi-join)
- [ANTI JOIN](#left--right-anti-join)
- [ANY JOIN](#left--right--inner-any-join)
- [ASOF JOIN](#asof-join)

在接下来的章节中，您将为上述每种 JOIN 类型编写示例查询。

## INNER JOIN {#inner-join}

`INNER JOIN` 会针对每一对在连接键上匹配的行，返回左表中该行的列值与右表中该行的列值的组合。
如果某一行有多条匹配记录，则会返回所有匹配记录（这意味着对于连接键匹配的行会产生[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)）。

<Image img={inner_join} alt="Inner Join" />

下面这个查询通过将 `movies` 表与 `genres` 表进行连接，为每部电影查找其所属的一个或多个类型：

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
│ Harry Potter and the Half-Blood Prince │ Action    │
│ Harry Potter and the Half-Blood Prince │ Adventure │
│ Harry Potter and the Half-Blood Prince │ Family    │
│ Harry Potter and the Half-Blood Prince │ Fantasy   │
│ Harry Potter and the Half-Blood Prince │ Thriller  │
│ DragonBall Z                           │ Action    │
│ DragonBall Z                           │ Adventure │
│ DragonBall Z                           │ Comedy    │
│ DragonBall Z                           │ Fantasy   │
│ DragonBall Z                           │ Sci-Fi    │
└────────────────────────────────────────┴───────────┘
```

:::note
`INNER` 关键字可以省略。
:::

可以通过使用以下其他 JOIN 类型来扩展或改变 `INNER JOIN` 的行为。


## (LEFT / RIGHT / FULL) OUTER JOIN {#left--right--full-outer-join}

`LEFT OUTER JOIN` 的行为类似于 `INNER JOIN`；另外，对于左表中不匹配的行，ClickHouse 会为右表的列返回[默认值](/sql-reference/statements/create/table#default_values)。

`RIGHT OUTER JOIN` 查询类似，同样会返回右表中不匹配行的值，并为左表的列返回默认值。

`FULL OUTER JOIN` 查询相当于把 `LEFT` 和 `RIGHT OUTER JOIN` 组合在一起，会返回左表和右表中不匹配行的值，并分别为右表和左表的列返回默认值。

<Image img={outer_join} alt="Outer Join" />

:::note
可以将 ClickHouse [配置为](/operations/settings/settings#join_use_nulls) 返回 [NULL](/sql-reference/syntax/#null)，而不是默认值（但出于[性能原因](/sql-reference/data-types/nullable/#storage-features)，不太推荐这样做）。
:::

下面这个查询通过查询 `movies` 表中在 `genres` 表中没有匹配行的所有行，找到所有没有类型的电影，因此这些行在查询时会在 `movie_id` 列上得到默认值 0：

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
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```

:::note
可以省略 `OUTER` 关键字。
:::


## CROSS JOIN {#cross-join}

`CROSS JOIN` 会生成两个表的完整笛卡尔积，且不使用任何关联键。
左表中的每一行都会与右表中的每一行进行组合。

<Image img={cross_join} alt="Cross Join" />

因此，下面的查询会将 `movies` 表中的每一行与 `genres` 表中的每一行组合在一起：

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

虽然前一个示例查询本身意义不大，但可以通过添加一个 `WHERE` 子句进行扩展，将匹配的行关联起来，从而重现 `INNER JOIN` 的行为，用于查找每部电影所属的类型（可以是多个）：

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

`CROSS JOIN` 的另一种语法形式是在 `FROM` 子句中用逗号分隔指定多个表。

如果在查询的 `WHERE` 子句中存在连接条件，ClickHouse 会将 `CROSS JOIN` [重写](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/Core/Settings.h#L896) 为 `INNER JOIN`。

你可以通过 [EXPLAIN SYNTAX](/sql-reference/statements/explain/#explain-syntax) 来检查示例查询（它会返回查询在被[执行](https://youtu.be/hP6G2Nlz_cA)之前被重写成的语法优化版本）：

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

在语法优化后的 `CROSS JOIN` 查询版本中，`INNER JOIN` 子句包含了 `ALL` 关键字，该关键字是显式添加的，用于在将 `CROSS JOIN` 重写为 `INNER JOIN` 时，仍然保持 `CROSS JOIN` 的笛卡尔积语义；而对于 `INNER JOIN`，其笛卡尔积行为可以通过[禁用](/operations/settings/settings#join_default_strictness)相关设置来关闭。

```sql
ALL
```

由于如上所述，在 `RIGHT OUTER JOIN` 中可以省略 `OUTER` 关键字，并且可以添加可选的 `ALL` 关键字，所以你可以写成 `ALL RIGHT JOIN`，它同样可以正常工作。


## (LEFT / RIGHT) SEMI JOIN {#left--right-semi-join}

`LEFT SEMI JOIN` 查询会返回左表中每一行在右表中至少有一个连接键匹配的列值。
只返回找到的第一条匹配记录（不生成笛卡尔积）。

`RIGHT SEMI JOIN` 查询类似，会返回右表中所有在左表中至少有一个匹配的行的值，同样只返回找到的第一条匹配记录。

<Image img={semi_join} alt="Semi Join" />

此查询会查找所有在 2023 年参演过电影的演员/女演员。
请注意，使用普通的（`INNER`）连接时，如果某位演员/女演员在 2023 年有多个角色，那么他/她会出现多次：

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

`LEFT ANTI JOIN` 返回左表中所有不匹配行的列值。

同样，`RIGHT ANTI JOIN` 返回右表中所有不匹配行的列值。

<Image img={anti_join} alt="Anti Join" />

前一个外连接示例查询的另一种写法，是使用 ANTI JOIN 来查找在数据集中没有类型的电影：

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
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```


## (LEFT / RIGHT / INNER) ANY JOIN {#left--right--inner-any-join}

`LEFT ANY JOIN` 是 `LEFT OUTER JOIN` + `LEFT SEMI JOIN` 的组合，这意味着 ClickHouse 会为左表中的每一行返回列值，要么与右表中匹配行的列值组合，要么在不存在匹配时与右表的默认列值组合。
如果左表中的某一行在右表中有多个匹配，ClickHouse 只会返回来自第一个匹配行的组合列值（笛卡尔积被禁用）。

类似地，`RIGHT ANY JOIN` 是 `RIGHT OUTER JOIN` + `RIGHT SEMI JOIN` 的组合。

而 `INNER ANY JOIN` 则是禁用笛卡尔积的 `INNER JOIN`。

<Image img={any_join} alt="Any Join" />

下面的示例通过一个抽象示例演示了 `LEFT ANY JOIN` 的用法。该示例使用两个临时表（`left_table` 和 `right_table`），这些临时表是通过 [values](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/TableFunctions/TableFunctionValues.h) [表函数](/sql-reference/table-functions/) 创建的：

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

下面是使用 `RIGHT ANY JOIN` 的同一个查询：

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

`ASOF JOIN` 支持非精确匹配。
如果左表中的某一行在右表中没有精确匹配行，则会使用右表中与之时间上“最近”的行作为匹配结果。

这在时间序列分析中特别有用，并且可以大幅降低查询的复杂度。

<Image img={asof_join} alt="Asof Join" />

下面的示例对股票市场数据进行时间序列分析。
`quotes` 表包含基于一天中特定时间点的股票代码报价。
在示例数据中，价格每 10 秒更新一次。
`trades` 表列出了股票代码的成交记录——某个股票代码在某个特定时间成交了特定数量的交易量：

<Image img={asof_example} alt="Asof Example" />

为了计算每笔交易的确切成本，我们需要将交易与其最近的报价时间进行匹配。

使用 `ASOF JOIN` 可以非常简洁地完成这一点：使用 `ON` 子句来指定精确匹配条件，使用 `AND` 子句来指定最近匹配条件——对于某个特定股票代码（精确匹配），你要从 `quotes` 表中查找在该代码的交易时间点之前或恰好在该时间点、时间最接近的那一行（非精确匹配）：

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
Row 1:
──────
symbol:             ABC
volume:             200
trade_time:         2023-02-22 14:09:05
closest_quote_time: 2023-02-22 14:09:00
quote_price:        32.11
final_price:        6422

Row 2:
──────
symbol:             ABC
volume:             300
trade_time:         2023-02-22 14:09:28
closest_quote_time: 2023-02-22 14:09:20
quote_price:        32.15
final_price:        9645
```

:::note
`ASOF JOIN` 的 `ON` 子句是必需的，用于在 `AND` 子句中的非精确匹配条件之外再指定一个精确匹配条件。
:::


## 摘要 {#summary}

本指南介绍 ClickHouse 如何支持所有标准 SQL JOIN 类型，以及用于支持分析查询的专用 JOIN。
有关 JOIN 的更多详细信息，请参阅 [JOIN](/sql-reference/statements/select/join) 语句的文档。