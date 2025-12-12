---
description: 'ウィンドウ関数の概要ページ'
sidebar_label: 'ウィンドウ関数'
sidebar_position: 1
slug: /sql-reference/window-functions/
title: 'ウィンドウ関数'
doc_type: 'reference'
---

# ウィンドウ関数 {#window-functions}

ウィンドウ関数を使用すると、現在の行と関連する行の集合を対象に計算を実行できます。
実行できる計算の一部は集約関数で行えるものと似ていますが、ウィンドウ関数では行が 1 つの結果行にグループ化されないため、各行は個別の行として返されます。

## 標準ウィンドウ関数 {#standard-window-functions}

ClickHouse は、ウィンドウおよびウィンドウ関数を定義するための標準的な文法をサポートしています。以下の表は、各機能が現在サポートされているかどうかを示します。

| 機能                                                                  | サポート状況                                                                                                                                                                       |
|--------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| アドホックなウィンドウ指定（`count(*) over (partition by id order by time desc)`） | ✅                                                                                                                                                                                  |
| ウィンドウ関数を含む式（例: `(count(*) over ()) / 2`）             | ✅                                                                                                                                                                                   |
| `WINDOW` 句（`select ... from table window w as (partition by id)`）            | ✅                                                                                                                                                                                   |
| `ROWS` フレーム                                                                      | ✅                                                                                                                                                                                   |
| `RANGE` フレーム                                                                     | ✅（デフォルト）                                                                                                                                                                      |
| `DateTime` 用 `RANGE OFFSET` フレームに対する `INTERVAL` 構文                              | ❌（代わりに秒数を指定してください。`RANGE` は任意の数値型で動作します）                                                                                                                                 |
| `GROUPS` フレーム                                                                    | ❌                                                                                                                                                                               |
| フレームに対する集約関数の計算（`sum(value) over (order by time)`）   | ✅（すべての集約関数がサポートされています）                                                                                                                                                       |
| `rank()`, `dense_rank()`, `row_number()`                                           | ✅ <br/>別名: `denseRank()`                                                                                                                                                                                   |
| `percent_rank()` | ✅  パーティション内での値の相対的な順位を効率的に計算します。この関数は、`ifNull((rank() OVER(PARTITION BY x ORDER BY y) - 1) / nullif(count(1) OVER(PARTITION BY x) - 1, 0), 0)` のような、より冗長で計算コストの高い手動の SQL 計算を事実上置き換えます。<br/>別名: `percentRank()`| 
| `cume_dist()` | ✅  値の累積分布を計算します。現在の行の値以下の値を持つ行の割合（パーセンテージ）を返します。 | 
| `lag/lead(value, offset)`                                                          | ✅ <br/> 次のいずれかの回避策も使用できます:<br/> 1) `any(value) over (.... rows between &lt;offset&gt; preceding and &lt;offset&gt; preceding)`、または `lead` の場合は `following` を使用します。<br/> 2) ウィンドウフレームを考慮する、類似の `lagInFrame/leadInFrame` を使用します。`lag/lead` と同じ動作を得るには、`rows between unbounded preceding and unbounded following` を使用します。                                                                 |
| ntile(buckets) | ✅ <br/> 次のようにウィンドウを指定します: (partition by x order by y rows between unbounded preceding and unbounded following)。 |

## ClickHouse固有のウィンドウ関数 {#clickhouse-specific-window-functions}

以下のClickHouse固有のウィンドウ関数も提供されています：

### nonNegativeDerivative(metric_column, timestamp_column[, INTERVAL X UNITS]) {#nonnegativederivativemetric_column-timestamp_column-interval-x-units}

指定された`metric_column`の非負の微分値を`timestamp_column`に基づいて算出します。
`INTERVAL`は省略可能で、デフォルトは`INTERVAL 1 SECOND`です。
各行に対して算出される値は以下の通りです：

- 1行目：`0`
- $i$行目：${\text{metric}_i - \text{metric}_{i-1} \over \text{timestamp}_i - \text{timestamp}_{i-1}}  * \text{interval}$

## 構文 {#syntax}

```text
aggregate_function (column_name)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column]])
```

* `PARTITION BY` - 結果セットをどのようなグループに分割するかを定義します。
* `ORDER BY` - 集約関数 `aggregate_function` を計算するときに、グループ内の行をどのような順序で並べるかを定義します。
* `ROWS or RANGE` - フレームの境界を定義し、集約関数 `aggregate_function` はそのフレーム内で計算されます。
* `WINDOW` - 複数の式で同じウィンドウ定義を共通して利用できるようにします。

```text
      PARTITION
┌─────────────────┐  <-- UNBOUNDED PRECEDING (BEGINNING of the PARTITION)
│                 │
│                 │
│=================│  <-- N PRECEDING  <─┐
│      N ROWS     │                     │  F
│  Before CURRENT │                     │  R
│~~~~~~~~~~~~~~~~~│  <-- CURRENT ROW    │  A
│     M ROWS      │                     │  M
│   After CURRENT │                     │  E
│=================│  <-- M FOLLOWING  <─┘
│                 │
│                 │
└─────────────────┘  <--- UNBOUNDED FOLLOWING (END of the PARTITION)
```

### 関数 {#functions}

これらの関数は、ウィンドウ関数としてのみ使用可能です。

* [`row_number()`](./row_number.md) - パーティション内で現在の行に 1 から始まる連番を付与します。
* [`first_value(x)`](./first_value.md) - 順序付けられたフレーム内で最初に評価された値を返します。
* [`last_value(x)`](./last_value.md) - 順序付けられたフレーム内で最後に評価された値を返します。
* [`nth_value(x, offset)`](./nth_value.md) - 順序付けられたフレーム内で、offset で指定された n 行目に対して評価された最初の NULL でない値を返します。
* [`rank()`](./rank.md) - パーティション内で現在の行に順位を付けます（欠番あり）。
* [`dense_rank()`](./dense_rank.md) - パーティション内で現在の行に順位を付けます（欠番なし）。
* [`lagInFrame(x)`](./lagInFrame.md) - 順序付けられたフレーム内で、現在の行から指定された物理オフセットだけ前の行で評価された値を返します。
* [`leadInFrame(x)`](./leadInFrame.md) - 順序付けられたフレーム内で、現在の行から指定されたオフセットだけ後ろの行で評価された値を返します。

## 例 {#examples}

ウィンドウ関数をどのように利用できるか、いくつかの例を見ていきます。

### 行に番号を振る {#numbering-rows}

```sql
CREATE TABLE salaries
(
    `team` String,
    `player` String,
    `salary` UInt32,
    `position` String
)
Engine = Memory;

INSERT INTO salaries FORMAT Values
    ('Port Elizabeth Barbarians', 'Gary Chen', 195000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 150000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 150000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M');
```

```sql
SELECT
    player,
    salary,
    row_number() OVER (ORDER BY salary ASC) AS row
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─row─┐
│ Michael Stanley │ 150000 │   1 │
│ Scott Harrison  │ 150000 │   2 │
│ Charles Juarez  │ 190000 │   3 │
│ Gary Chen       │ 195000 │   4 │
│ Robert George   │ 195000 │   5 │
└─────────────────┴────────┴─────┘
```

```sql
SELECT
    player,
    salary,
    row_number() OVER (ORDER BY salary ASC) AS row,
    rank() OVER (ORDER BY salary ASC) AS rank,
    dense_rank() OVER (ORDER BY salary ASC) AS denseRank
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─row─┬─rank─┬─denseRank─┐
│ Michael Stanley │ 150000 │   1 │    1 │         1 │
│ Scott Harrison  │ 150000 │   2 │    1 │         1 │
│ Charles Juarez  │ 190000 │   3 │    3 │         2 │
│ Gary Chen       │ 195000 │   4 │    4 │         3 │
│ Robert George   │ 195000 │   5 │    4 │         3 │
└─────────────────┴────────┴─────┴──────┴───────────┘
```

### 集約関数 {#aggregation-functions}

各選手の年俸を、その所属チームの平均年俸と比較します。

```sql
SELECT
    player,
    salary,
    team,
    avg(salary) OVER (PARTITION BY team) AS teamAvg,
    salary - teamAvg AS diff
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─team──────────────────────┬─teamAvg─┬───diff─┐
│ Charles Juarez  │ 190000 │ New Coreystad Archdukes   │  170000 │  20000 │
│ Scott Harrison  │ 150000 │ New Coreystad Archdukes   │  170000 │ -20000 │
│ Gary Chen       │ 195000 │ Port Elizabeth Barbarians │  180000 │  15000 │
│ Michael Stanley │ 150000 │ Port Elizabeth Barbarians │  180000 │ -30000 │
│ Robert George   │ 195000 │ Port Elizabeth Barbarians │  180000 │  15000 │
└─────────────────┴────────┴───────────────────────────┴─────────┴────────┘
```

各選手の給与を、その選手のチーム内での最高給与と比較します。

```sql
SELECT
    player,
    salary,
    team,
    max(salary) OVER (PARTITION BY team) AS teamMax,
    salary - teamMax AS diff
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─team──────────────────────┬─teamMax─┬───diff─┐
│ Charles Juarez  │ 190000 │ New Coreystad Archdukes   │  190000 │      0 │
│ Scott Harrison  │ 150000 │ New Coreystad Archdukes   │  190000 │ -40000 │
│ Gary Chen       │ 195000 │ Port Elizabeth Barbarians │  195000 │      0 │
│ Michael Stanley │ 150000 │ Port Elizabeth Barbarians │  195000 │ -45000 │
│ Robert George   │ 195000 │ Port Elizabeth Barbarians │  195000 │      0 │
└─────────────────┴────────┴───────────────────────────┴─────────┴────────┘
```

### 列によるパーティション分割 {#partitioning-by-column}

```sql
CREATE TABLE wf_partition
(
    `part_key` UInt64,
    `value` UInt64,
    `order` UInt64    
)
ENGINE = Memory;

INSERT INTO wf_partition FORMAT Values
   (1,1,1), (1,2,2), (1,3,3), (2,0,0), (3,0,0);

SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key) AS frame_values
FROM wf_partition
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3]      │   <┐   
│        1 │     2 │     2 │ [1,2,3]      │    │  1-st group
│        1 │     3 │     3 │ [1,2,3]      │   <┘ 
│        2 │     0 │     0 │ [0]          │   <- 2-nd group
│        3 │     0 │     0 │ [0]          │   <- 3-d group
└──────────┴───────┴───────┴──────────────┘
```

### フレーム境界 {#frame-bounding}

```sql
CREATE TABLE wf_frame
(
    `part_key` UInt64,
    `value` UInt64,
    `order` UInt64
)
ENGINE = Memory;

INSERT INTO wf_frame FORMAT Values
   (1,1,1), (1,2,2), (1,3,3), (1,4,4), (1,5,5);
```

```sql
-- Frame is bounded by bounds of a partition (BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;
    
┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [1,2,3,4,5]  │
│        1 │     4 │     4 │ [1,2,3,4,5]  │
│        1 │     5 │     5 │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- short form - no bound expression, no order by,
-- an equalent of `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key) AS frame_values_short,
    groupArray(value) OVER (PARTITION BY part_key
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;
┌─part_key─┬─value─┬─order─┬─frame_values_short─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     4 │     4 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     5 │     5 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴────────────────────┴──────────────┘
```

```sql
-- frame is bounded by the beginning of a partition and the current row
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1]          │
│        1 │     2 │     2 │ [1,2]        │
│        1 │     3 │     3 │ [1,2,3]      │
│        1 │     4 │     4 │ [1,2,3,4]    │
│        1 │     5 │     5 │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- short form (frame is bounded by the beginning of a partition and the current row)
-- an equalent of `ORDER BY order ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order ASC) AS frame_values_short,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values_short─┬─frame_values─┐
│        1 │     1 │     1 │ [1]                │ [1]          │
│        1 │     2 │     2 │ [1,2]              │ [1,2]        │
│        1 │     3 │     3 │ [1,2,3]            │ [1,2,3]      │
│        1 │     4 │     4 │ [1,2,3,4]          │ [1,2,3,4]    │
│        1 │     5 │     5 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴────────────────────┴──────────────┘
```

```sql
-- frame is bounded by the beginning of a partition and the current row, but order is backward
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order DESC) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [5,4,3,2,1]  │
│        1 │     2 │     2 │ [5,4,3,2]    │
│        1 │     3 │     3 │ [5,4,3]      │
│        1 │     4 │     4 │ [5,4]        │
│        1 │     5 │     5 │ [5]          │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- sliding frame - 1 PRECEDING ROW AND CURRENT ROW
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1]          │
│        1 │     2 │     2 │ [1,2]        │
│        1 │     3 │     3 │ [2,3]        │
│        1 │     4 │     4 │ [3,4]        │
│        1 │     5 │     5 │ [4,5]        │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- sliding frame - ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING 
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [2,3,4,5]    │
│        1 │     4 │     4 │ [3,4,5]      │
│        1 │     5 │     5 │ [4,5]        │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- row_number does not respect the frame, so rn_1 = rn_2 = rn_3 != rn_4
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER w1 AS frame_values,
    row_number() OVER w1 AS rn_1,
    sum(1) OVER w1 AS rn_2,
    row_number() OVER w2 AS rn_3,
    sum(1) OVER w2 AS rn_4
FROM wf_frame
WINDOW
    w1 AS (PARTITION BY part_key ORDER BY order DESC),
    w2 AS (
        PARTITION BY part_key 
        ORDER BY order DESC 
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
    )
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┬─rn_1─┬─rn_2─┬─rn_3─┬─rn_4─┐
│        1 │     1 │     1 │ [5,4,3,2,1]  │    5 │    5 │    5 │    2 │
│        1 │     2 │     2 │ [5,4,3,2]    │    4 │    4 │    4 │    2 │
│        1 │     3 │     3 │ [5,4,3]      │    3 │    3 │    3 │    2 │
│        1 │     4 │     4 │ [5,4]        │    2 │    2 │    2 │    2 │
│        1 │     5 │     5 │ [5]          │    1 │    1 │    1 │    1 │
└──────────┴───────┴───────┴──────────────┴──────┴──────┴──────┴──────┘
```

┌─part&#95;key─┬─value─┬─order─┬─frame&#95;values─┬─rn&#95;1─┬─rn&#95;2─┬─rn&#95;3─┬─rn&#95;4─┐
│        1 │     1 │     1 │ [5,4,3,2,1]  │    5 │    5 │    5 │    2 │
│        1 │     2 │     2 │ [5,4,3,2]    │    4 │    4 │    4 │    2 │
│        1 │     3 │     3 │ [5,4,3]      │    3 │    3 │    3 │    2 │
│        1 │     4 │     4 │ [5,4]        │    2 │    2 │    2 │    2 │
│        1 │     5 │     5 │ [5]          │    1 │    1 │    1 │    1 │
└──────────┴───────┴───────┴──────────────┴──────┴──────┴──────┴──────┘

````sql
-- first_value and last_value respect the frame
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    first_value(value) OVER w1 AS first_value_1,
    last_value(value) OVER w1 AS last_value_1,
    groupArray(value) OVER w2 AS frame_values_2,
    first_value(value) OVER w2 AS first_value_2,
    last_value(value) OVER w2 AS last_value_2
FROM wf_frame
WINDOW
    w1 AS (PARTITION BY part_key ORDER BY order ASC),
    w2 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─first_value_1─┬─last_value_1─┬─frame_values_2─┬─first_value_2─┬─last_value_2─┐
│ [1]            │             1 │            1 │ [1]            │             1 │            1 │
│ [1,2]          │             1 │            2 │ [1,2]          │             1 │            2 │
│ [1,2,3]        │             1 │            3 │ [2,3]          │             2 │            3 │
│ [1,2,3,4]      │             1 │            4 │ [3,4]          │             3 │            4 │
│ [1,2,3,4,5]    │             1 │            5 │ [4,5]          │             4 │            5 │
└────────────────┴───────────────┴──────────────┴────────────────┴───────────────┴──────────────┘
```sql
-- first_value と last_value はフレームに従う
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    first_value(value) OVER w1 AS first_value_1,
    last_value(value) OVER w1 AS last_value_1,
    groupArray(value) OVER w2 AS frame_values_2,
    first_value(value) OVER w2 AS first_value_2,
    last_value(value) OVER w2 AS last_value_2
FROM wf_frame
WINDOW
    w1 AS (PARTITION BY part_key ORDER BY order ASC),
    w2 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─first_value_1─┬─last_value_1─┬─frame_values_2─┬─first_value_2─┬─last_value_2─┐
│ [1]            │             1 │            1 │ [1]            │             1 │            1 │
│ [1,2]          │             1 │            2 │ [1,2]          │             1 │            2 │
│ [1,2,3]        │             1 │            3 │ [2,3]          │             2 │            3 │
│ [1,2,3,4]      │             1 │            4 │ [3,4]          │             3 │            4 │
│ [1,2,3,4,5]    │             1 │            5 │ [4,5]          │             4 │            5 │
└────────────────┴───────────────┴──────────────┴────────────────┴───────────────┴──────────────┘
````sql
-- second value within the frame
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(value, 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─second_value─┐
│ [1]            │            0 │
│ [1,2]          │            2 │
│ [1,2,3]        │            2 │
│ [1,2,3,4]      │            2 │
│ [2,3,4,5]      │            3 │
└────────────────┴──────────────┘
```sql
-- フレーム内の2番目の値
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(value, 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─second_value─┐
│ [1]            │            0 │
│ [1,2]          │            2 │
│ [1,2,3]        │            2 │
│ [1,2,3,4]      │            2 │
│ [2,3,4,5]      │            3 │
└────────────────┴──────────────┘
```sql
-- second value within the frame + Null for missing values
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(toNullable(value), 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─second_value─┐
│ [1]            │         ᴺᵁᴸᴸ │
│ [1,2]          │            2 │
│ [1,2,3]        │            2 │
│ [1,2,3,4]      │            2 │
│ [2,3,4,5]      │            3 │
└────────────────┴──────────────┘
```sql
-- フレーム内の2番目の値 + 欠損値に対するNull
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(toNullable(value), 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;
```sql
CREATE TABLE employees
(
    `department` String,
    `employee_name` String,
    `salary` Float
)
ENGINE = Memory;

INSERT INTO employees FORMAT Values
   ('Finance', 'Jonh', 200),
   ('Finance', 'Joan', 210),
   ('Finance', 'Jean', 505),
   ('IT', 'Tim', 200),
   ('IT', 'Anna', 300),
   ('IT', 'Elen', 500);
```
```sql
SELECT
    department,
    employee_name AS emp,
    salary,
    max_salary_per_dep,
    total_salary_per_dep,
    round((salary / total_salary_per_dep) * 100, 2) AS `share_per_dep(%)`
FROM
(
    SELECT
        department,
        employee_name,
        salary,
        max(salary) OVER wndw AS max_salary_per_dep,
        sum(salary) OVER wndw AS total_salary_per_dep
    FROM employees
    WINDOW wndw AS (
        PARTITION BY department
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    )
    ORDER BY
        department ASC,
        employee_name ASC
);

┌─department─┬─emp──┬─salary─┬─max_salary_per_dep─┬─total_salary_per_dep─┬─share_per_dep(%)─┐
│ Finance    │ Jean │    505 │                505 │                  915 │            55.19 │
│ Finance    │ Joan │    210 │                505 │                  915 │            22.95 │
│ Finance    │ Jonh │    200 │                505 │                  915 │            21.86 │
│ IT         │ Anna │    300 │                500 │                 1000 │               30 │
│ IT         │ Elen │    500 │                500 │                 1000 │               50 │
│ IT         │ Tim  │    200 │                500 │                 1000 │               20 │
└────────────┴──────┴────────┴────────────────────┴──────────────────────┴──────────────────┘
```sql
CREATE TABLE employees
(
    `department` String,
    `employee_name` String,
    `salary` Float
)
ENGINE = Memory;

INSERT INTO employees FORMAT Values
   ('Finance', 'Jonh', 200),
   ('Finance', 'Joan', 210),
   ('Finance', 'Jean', 505),
   ('IT', 'Tim', 200),
   ('IT', 'Anna', 300),
   ('IT', 'Elen', 500);
```sql
CREATE TABLE warehouse
(
    `item` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory

INSERT INTO warehouse VALUES
    ('sku38', '2020-01-01', 9),
    ('sku38', '2020-02-01', 1),
    ('sku38', '2020-03-01', -4),
    ('sku1', '2020-01-01', 1),
    ('sku1', '2020-02-01', 1),
    ('sku1', '2020-03-01', 1);
```sql
SELECT
    department,
    employee_name AS emp,
    salary,
    max_salary_per_dep,
    total_salary_per_dep,
    round((salary / total_salary_per_dep) * 100, 2) AS `share_per_dep(%)`
FROM
(
    SELECT
        department,
        employee_name,
        salary,
        max(salary) OVER wndw AS max_salary_per_dep,
        sum(salary) OVER wndw AS total_salary_per_dep
    FROM employees
    WINDOW wndw AS (
        PARTITION BY department
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    )
    ORDER BY
        department ASC,
        employee_name ASC
);

┌─department─┬─emp──┬─salary─┬─max_salary_per_dep─┬─total_salary_per_dep─┬─share_per_dep(%)─┐
│ Finance    │ Jean │    505 │                505 │                  915 │            55.19 │
│ Finance    │ Joan │    210 │                505 │                  915 │            22.95 │
│ Finance    │ Jonh │    200 │                505 │                  915 │            21.86 │
│ IT         │ Anna │    300 │                500 │                 1000 │               30 │
│ IT         │ Elen │    500 │                500 │                 1000 │               50 │
│ IT         │ Tim  │    200 │                500 │                 1000 │               20 │
└────────────┴──────┴────────┴────────────────────┴──────────────────────┴──────────────────┘
```sql
SELECT
    item,
    ts,
    value,
    sum(value) OVER (PARTITION BY item ORDER BY ts ASC) AS stock_balance
FROM warehouse
ORDER BY
    item ASC,
    ts ASC;

┌─item──┬──────────────────ts─┬─value─┬─stock_balance─┐
│ sku1  │ 2020-01-01 00:00:00 │     1 │             1 │
│ sku1  │ 2020-02-01 00:00:00 │     1 │             2 │
│ sku1  │ 2020-03-01 00:00:00 │     1 │             3 │
│ sku38 │ 2020-01-01 00:00:00 │     9 │             9 │
│ sku38 │ 2020-02-01 00:00:00 │     1 │            10 │
│ sku38 │ 2020-03-01 00:00:00 │    -4 │             6 │
└───────┴─────────────────────┴───────┴───────────────┘
```sql
CREATE TABLE warehouse
(
    `item` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory

INSERT INTO warehouse VALUES
    ('sku38', '2020-01-01', 9),
    ('sku38', '2020-02-01', 1),
    ('sku38', '2020-03-01', -4),
    ('sku1', '2020-01-01', 1),
    ('sku1', '2020-02-01', 1),
    ('sku1', '2020-03-01', 1);
```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;

insert into sensors values('cpu_temp', '2020-01-01 00:00:00', 87),
                          ('cpu_temp', '2020-01-01 00:00:01', 77),
                          ('cpu_temp', '2020-01-01 00:00:02', 93),
                          ('cpu_temp', '2020-01-01 00:00:03', 87),
                          ('cpu_temp', '2020-01-01 00:00:04', 87),
                          ('cpu_temp', '2020-01-01 00:00:05', 87),
                          ('cpu_temp', '2020-01-01 00:00:06', 87),
                          ('cpu_temp', '2020-01-01 00:00:07', 87);
```sql
SELECT
    item,
    ts,
    value,
    sum(value) OVER (PARTITION BY item ORDER BY ts ASC) AS stock_balance
FROM warehouse
ORDER BY
    item ASC,
    ts ASC;

┌─item──┬──────────────────ts─┬─value─┬─stock_balance─┐
│ sku1  │ 2020-01-01 00:00:00 │     1 │             1 │
│ sku1  │ 2020-02-01 00:00:00 │     1 │             2 │
│ sku1  │ 2020-03-01 00:00:00 │     1 │             3 │
│ sku38 │ 2020-01-01 00:00:00 │     9 │             9 │
│ sku38 │ 2020-02-01 00:00:00 │     1 │            10 │
│ sku38 │ 2020-03-01 00:00:00 │    -4 │             6 │
└───────┴─────────────────────┴───────┴───────────────┘
```sql
SELECT
    metric,
    ts,
    value,
    avg(value) OVER (
        PARTITION BY metric 
        ORDER BY ts ASC 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;

┌─metric───┬──────────────────ts─┬─value─┬───moving_avg_temp─┐
│ cpu_temp │ 2020-01-01 00:00:00 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:01 │    77 │                82 │
│ cpu_temp │ 2020-01-01 00:00:02 │    93 │ 85.66666666666667 │
│ cpu_temp │ 2020-01-01 00:00:03 │    87 │ 85.66666666666667 │
│ cpu_temp │ 2020-01-01 00:00:04 │    87 │                89 │
│ cpu_temp │ 2020-01-01 00:00:05 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:06 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:07 │    87 │                87 │
└──────────┴─────────────────────┴───────┴───────────────────┘
```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;
```sql
SELECT
    metric,
    ts,
    value,
    avg(value) OVER (PARTITION BY metric ORDER BY ts
      RANGE BETWEEN 10 PRECEDING AND CURRENT ROW) AS moving_avg_10_seconds_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;
    
┌─metric───┬──────────────────ts─┬─value─┬─moving_avg_10_seconds_temp─┐
│ cpu_temp │ 2020-01-01 00:00:00 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:01:10 │    77 │                         77 │
│ cpu_temp │ 2020-01-01 00:02:20 │    93 │                         93 │
│ cpu_temp │ 2020-01-01 00:03:30 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:04:40 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:05:50 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:06:00 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:07:10 │    87 │                         87 │
└──────────┴─────────────────────┴───────┴────────────────────────────┘
````

```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;

insert into sensors values('ambient_temp', '2020-01-01 00:00:00', 16),
                          ('ambient_temp', '2020-01-01 12:00:00', 16),
                          ('ambient_temp', '2020-01-02 11:00:00', 9),
                          ('ambient_temp', '2020-01-02 12:00:00', 9),                          
                          ('ambient_temp', '2020-02-01 10:00:00', 10),
                          ('ambient_temp', '2020-02-01 12:00:00', 10),
                          ('ambient_temp', '2020-02-10 12:00:00', 12),                          
                          ('ambient_temp', '2020-02-10 13:00:00', 12),
                          ('ambient_temp', '2020-02-20 12:00:01', 16),
                          ('ambient_temp', '2020-03-01 12:00:00', 16),
                          ('ambient_temp', '2020-03-01 12:00:00', 16),
                          ('ambient_temp', '2020-03-01 12:00:00', 16);
````

### 移動平均／スライディング平均（10秒ごと） {#moving--sliding-average-per-10-seconds}

```sql
SELECT
    metric,
    ts,
    value,
    round(avg(value) OVER (PARTITION BY metric ORDER BY toDate(ts) 
       RANGE BETWEEN 10 PRECEDING AND CURRENT ROW),2) AS moving_avg_10_days_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;

┌─metric───────┬──────────────────ts─┬─value─┬─moving_avg_10_days_temp─┐
│ ambient_temp │ 2020-01-01 00:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-02 11:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-01-02 12:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-02-01 10:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-01 12:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-10 12:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-10 13:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-20 12:00:01 │    16 │                   13.33 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
└──────────────┴─────────────────────┴───────┴─────────────────────────┘
```

### 移動平均 / スライディング平均（10日ごと） {#moving--sliding-average-per-10-days}

温度データは秒精度で保存されていますが、`Range` と `ORDER BY toDate(ts)` を使用することでサイズ 10 のフレームを作成し、`toDate(ts)` によってその単位は日になります。

```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;
```

insert into sensors values(&#39;ambient&#95;temp&#39;, &#39;2020-01-01 00:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-02 11:00:00&#39;, 9),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-02 12:00:00&#39;, 9),\
(&#39;ambient&#95;temp&#39;, &#39;2020-02-01 10:00:00&#39;, 10),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-01 12:00:00&#39;, 10),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-10 12:00:00&#39;, 12),\
(&#39;ambient&#95;temp&#39;, &#39;2020-02-10 13:00:00&#39;, 12),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-20 12:00:01&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16);

````

```sql
SELECT
    metric,
    ts,
    value,
    round(avg(value) OVER (PARTITION BY metric ORDER BY toDate(ts) 
       RANGE BETWEEN 10 PRECEDING AND CURRENT ROW),2) AS moving_avg_10_days_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;

┌─metric───────┬──────────────────ts─┬─value─┬─moving_avg_10_days_temp─┐
│ ambient_temp │ 2020-01-01 00:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-02 11:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-01-02 12:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-02-01 10:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-01 12:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-10 12:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-10 13:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-20 12:00:01 │    16 │                   13.33 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
└──────────────┴─────────────────────┴───────┴─────────────────────────┘
````

## 参考 {#references}

### GitHub Issues {#github-issues}

ウィンドウ関数の初期サポートに関するロードマップは [この Issue](https://github.com/ClickHouse/ClickHouse/issues/18097) にあります。

ウィンドウ関数に関連するすべての GitHub Issue には [comp-window-functions](https://github.com/ClickHouse/ClickHouse/labels/comp-window-functions) タグが付いています。

### テスト {#tests}

次のテストには、現在サポートされている構文の例が含まれています。

https://github.com/ClickHouse/ClickHouse/blob/master/tests/performance/window_functions.xml

https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/01591_window_functions.sql

### Postgres ドキュメント {#postgres-docs}

https://www.postgresql.org/docs/current/sql-select.html#SQL-WINDOW

https://www.postgresql.org/docs/devel/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS

https://www.postgresql.org/docs/devel/functions-window.html

https://www.postgresql.org/docs/devel/tutorial-window.html

### MySQL ドキュメント {#mysql-docs}

https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html

https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html

https://dev.mysql.com/doc/refman/8.0/en/window-functions-frames.html

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における時系列データの扱い方](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- ブログ: [Git コミットシーケンス向けウィンドウ関数と配列関数](https://clickhouse.com/blog/clickhouse-window-array-functions-git-commits)
- ブログ: [ClickHouse へのデータ投入 - パート 3 - S3 の利用](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
