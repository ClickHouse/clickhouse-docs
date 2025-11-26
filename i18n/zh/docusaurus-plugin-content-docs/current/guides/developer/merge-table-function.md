---
slug: /guides/developer/merge-table-function
sidebar_label: 'Merge 表函数'
title: 'Merge 表函数'
description: '同时查询多张表。'
doc_type: 'reference'
keywords: ['merge', 'table function', 'query patterns', 'table engine', 'data access']
---

[Merge 表函数](https://clickhouse.com/docs/sql-reference/table-functions/merge) 允许我们并行查询多张表。
它通过创建一个临时的 [Merge](https://clickhouse.com/docs/engines/table-engines/special/merge) 表来实现这一点，该表的结构是通过对这些表的列取并集，并推断其公共数据类型而得到的。

<iframe width="768" height="432" src="https://www.youtube.com/embed/b4YfRhD9SSI?si=MuoDwDWeikAV5ttk" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



## 设置数据表

我们将借助 [Jeff Sackmann 的网球数据集](https://github.com/JeffSackmann/tennis_atp) 来学习如何使用这个函数。
我们将处理包含自 20 世纪 60 年代起比赛记录的 CSV 文件，但会为每个十年创建略有不同的表结构。
我们还会为 20 世纪 90 年代的数据额外增加几列。

导入语句如下：

```sql
CREATE OR REPLACE TABLE atp_matches_1960s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1968..1969}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(String), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1970s ORDER BY tourney_id AS 
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1970..1979}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(UInt8), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1980s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1980..1989}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16)';

CREATE OR REPLACE TABLE atp_matches_1990s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score,
       toBool(arrayExists(x -> position(x, 'W/O') > 0, score))::Nullable(bool) AS walkover,
       toBool(arrayExists(x -> position(x, 'RET') > 0, score))::Nullable(bool) AS retirement
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1990..1999}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16), surface Enum(\'Hard\', \'Grass\', \'Clay\', \'Carpet\')';
```


## 多个表的结构

我们可以运行以下查询，将每个表中的列及其类型并排列出，便于对比差异。

```sql
SELECT * EXCEPT(position) FROM (
    SELECT position, name,
       any(if(table = 'atp_matches_1960s', type, null)) AS 1960s,
       any(if(table = 'atp_matches_1970s', type, null)) AS 1970s,
       any(if(table = 'atp_matches_1980s', type, null)) AS 1980s,
       any(if(table = 'atp_matches_1990s', type, null)) AS 1990s
    FROM system.columns
    WHERE database = currentDatabase() AND table LIKE 'atp_matches%'
    GROUP BY ALL
    ORDER BY position ASC
)
SETTINGS output_format_pretty_max_value_width=25;
```

```text
┌─name────────┬─1960s────────────┬─1970s───────────┬─1980s────────────┬─1990s─────────────────────┐
│ tourney_id  │ String           │ String          │ String           │ String                    │
│ surface     │ String           │ String          │ String           │ Enum8('Hard' = 1, 'Grass'⋯│
│ winner_name │ String           │ String          │ String           │ String                    │
│ loser_name  │ String           │ String          │ String           │ String                    │
│ winner_seed │ Nullable(String) │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ loser_seed  │ Nullable(UInt8)  │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ score       │ String           │ Array(String)   │ Array(String)    │ Array(String)             │
│ walkover    │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
│ retirement  │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
└─────────────┴──────────────────┴─────────────────┴──────────────────┴───────────────────────────┘
```

让我们逐一来看差异：

* 1970s 将 `winner_seed` 的类型从 `Nullable(String)` 更改为 `Nullable(UInt8)`，并将 `score` 的类型从 `String` 更改为 `Array(String)`。
* 1980s 将 `winner_seed` 和 `loser_seed` 的类型从 `Nullable(UInt8)` 更改为 `Nullable(UInt16)`。
* 1990s 将 `surface` 的类型从 `String` 更改为 `Enum('Hard', 'Grass', 'Clay', 'Carpet')`，并新增 `walkover` 和 `retirement` 两列。


## 使用 merge 查询多张表

让我们写一个查询，找出 John McEnroe 在对阵头号种子选手时获胜的比赛：

```sql
SELECT loser_name, score
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1;
```

```text
┌─loser_name────┬─score───────────────────────────┐
│ Bjorn Borg    │ ['6-3','6-4']                   │
│ Bjorn Borg    │ ['7-6','6-1','6-7','5-7','6-4'] │
│ Bjorn Borg    │ ['7-6','6-4']                   │
│ Bjorn Borg    │ ['4-6','7-6','7-6','6-4']       │
│ Jimmy Connors │ ['6-1','6-3']                   │
│ Ivan Lendl    │ ['6-2','4-6','6-3','6-7','7-6'] │
│ Ivan Lendl    │ ['6-3','3-6','6-3','7-6']       │
│ Ivan Lendl    │ ['6-1','6-3']                   │
│ Stefan Edberg │ ['6-2','6-3']                   │
│ Stefan Edberg │ ['7-6','6-2']                   │
│ Stefan Edberg │ ['6-2','6-2']                   │
│ Jakob Hlasek  │ ['6-3','7-6']                   │
└───────────────┴─────────────────────────────────┘
```

接下来，假设我们想要筛选这些比赛，只保留 McEnroe 种子排名为 3 号或更低的记录。
这会稍微棘手一些，因为 `winner_seed` 在不同的表中使用了不同的类型：

```sql
SELECT loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

我们使用 [`variantType`](/docs/sql-reference/functions/other-functions#variantType) 函数检查每一行中 `winner_seed` 的类型，然后使用 [`variantElement`](/docs/sql-reference/functions/other-functions#variantElement) 提取其对应的实际值。
当类型为 `String` 时，我们将其转换为数值类型再进行比较。
运行该查询的结果如下：

```text
┌─loser_name────┬─score─────────┬─winner_seed─┐
│ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────┴───────────────┴─────────────┘
```


## 在使用 merge 时，行是来自哪个表？

如果我们想知道每一行是从哪个表来的怎么办？
我们可以使用 `_table` 虚拟列来实现，如下面的查询所示：

```sql
SELECT _table, loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

```text
┌─_table────────────┬─loser_name────┬─score─────────┬─winner_seed─┐
│ atp_matches_1970s │ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ atp_matches_1980s │ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────────┴───────────────┴───────────────┴─────────────┘
```

我们还可以在查询中使用该虚拟列，对 `walkover` 列中的值进行计数：

```sql
SELECT _table, walkover, count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

```text
┌─_table────────────┬─walkover─┬─count()─┐
│ atp_matches_1960s │ ᴺᵁᴸᴸ     │    7542 │
│ atp_matches_1970s │ ᴺᵁᴸᴸ     │   39165 │
│ atp_matches_1980s │ ᴺᵁᴸᴸ     │   36233 │
│ atp_matches_1990s │ true     │     128 │
│ atp_matches_1990s │ false    │   37022 │
└───────────────────┴──────────┴─────────┘
```

我们可以看到，除了 `atp_matches_1990s` 之外，其他所有数据集中的 `walkover` 列都是 `NULL`。
如果 `walkover` 列为 `NULL`，我们需要在查询中增加一项检查，判断 `score` 列中是否包含字符串 `W/O`：

```sql
SELECT _table,
   multiIf(
     walkover IS NOT NULL,
     walkover,
     variantType(score) = 'Array(String)',
     toBool(arrayExists(
        x -> position(x, 'W/O') > 0,
        variantElement(score, 'Array(String)')
     )),
     variantElement(score, 'String') LIKE '%W/O%'
   ),
   count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

如果 `score` 的底层类型是 `Array(String)`，我们就必须遍历数组并查找 `W/O`；而如果它的类型是 `String`，则只需在该字符串中搜索 `W/O` 即可。

```text
┌─_table────────────┬─multiIf(isNo⋯, '%W/O%'))─┬─count()─┐
│ atp_matches_1960s │ true                     │     242 │
│ atp_matches_1960s │ false                    │    7300 │
│ atp_matches_1970s │ true                     │     422 │
│ atp_matches_1970s │ false                    │   38743 │
│ atp_matches_1980s │ true                     │      92 │
│ atp_matches_1980s │ false                    │   36141 │
│ atp_matches_1990s │ true                     │     128 │
│ atp_matches_1990s │ false                    │   37022 │
└───────────────────┴──────────────────────────┴─────────┘
```
