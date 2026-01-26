---
sidebar_label: '分析技巧'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: '在使用 ClickHouse 官方连接器时的 Tableau 分析技巧。'
title: '分析技巧'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

# 分析提示 \{#analysis-tips\}

## MEDIAN() 和 PERCENTILE() 函数 \{#median-and-percentile-functions\}

- 在 Live 模式下，MEDIAN() 和 PERCENTILE() 函数（自 connector v0.1.3 版本起）使用 [ClickHouse quantile()() 函数](/sql-reference/aggregate-functions/reference/quantile/)，这可以显著加快计算速度，但基于抽样。如果您需要获得精确的计算结果，请使用 `MEDIAN_EXACT()` 和 `PERCENTILE_EXACT()` 函数（基于 [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)）。
- 在 Extract 模式下，您不能使用 MEDIAN_EXACT() 和 PERCENTILE_EXACT()，因为 MEDIAN() 和 PERCENTILE() 始终是精确（但较慢）的。

## 在实时模式下用于计算字段的附加函数 \{#additional-functions-for-calculated-fields-in-live-mode\}

ClickHouse 拥有数量庞大的函数可用于数据分析——远远超过 Tableau 所支持的范围。为方便用户使用，我们新增了一些可在 Live 模式下用于创建 Calculated Fields 的函数。遗憾的是，无法在 Tableau 界面中为这些函数添加描述，因此我们会在此处对它们进行说明。

* **[`-If` Aggregation Combinator](/sql-reference/aggregate-functions/combinators/#-if)** *(在 v0.2.3 中新增)* —— 允许直接在聚合计算中使用行级过滤器（Row-Level Filters）。新增了 `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 函数。
* **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(在 v0.2.1 中新增)* — 忘掉枯燥的柱状图吧！请改用 `BAR()` 函数（等价于 ClickHouse 中的 [`bar()`](/sql-reference/functions/other-functions#bar)）。例如，下面这个计算字段会返回漂亮的条形图字符串，类型为 String：
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
* **`COUNTD_UNIQ([my_field])`** *(在 v0.2.0 中新增)* — 近似计算参数中不同取值的数量。等价于 [uniq()](/sql-reference/aggregate-functions/reference/uniq/)，比 `COUNTD()` 快得多。
* **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(新增于 v0.2.1)* — 等同于 ClickHouse 中的 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval) 函数。将 Date 或 Date &amp; Time 向下取整到指定区间，例如：
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
* **`FORMAT_READABLE_QUANTITY([my_integer])`** *(在 v0.2.1 版本中添加)* — 以字符串形式返回带有后缀（千、百万、十亿等）的四舍五入数字。便于人类读取大数值。等价于 [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity)。
* **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(在 v0.2.1 中添加)* — 接收以秒为单位的时间间隔。返回一个字符串形式的时间间隔，包含年、月、日、时、分、秒。`optional_max_unit` 为要显示的最大时间单位。可接受的取值为：`seconds`、`minutes`、`hours`、`days`、`months`、`years`。等同于 [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta)。
* **`GET_SETTING([my_setting_name])`** *(在 v0.2.1 中新增)* — 返回自定义设置的当前值。等价于 [`getSetting()`](/sql-reference/functions/other-functions#getSetting)。
* **`HEX([my_string])`** *(在 v0.2.1 中新增)* — 返回一个字符串，其中包含该参数的十六进制表示。等价于 [`hex()`](/sql-reference/functions/encoding-functions/#hex)。
* **`KURTOSIS([my_number])`** — 计算序列的样本峰度。等同于 [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)。
* **`KURTOSISP([my_number])`** — 计算一组数值的峰度。等同于 [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)。
* **`MEDIAN_EXACT([my_number])`** *(在 v0.1.3 版本中新增)* — 精确计算数值数据序列的中位数。等价于 [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact)。
* **`MOD([my_number_1], [my_number_2])`** — 计算除法后的余数。若参数为浮点数，则会先通过截断小数部分将其转换为整数。等价于 [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)。
* **`PERCENTILE_EXACT([my_number], [level_float])`** *(在 v0.1.3 中新增)* — 精确计算数值序列的百分位数。推荐的 level 范围为 [0.01, 0.99]。等价于 [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact)。
* **`PROPER([my_string])`** *(在 v0.2.5 中新增)* - 将文本字符串转换为“每个单词首字母大写、其余字母小写”的形式。空格以及标点符号等非字母数字字符也会作为分隔符。例如：
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
* **`RAND()`** *(在 v0.2.1 中新增)* — 返回一个整数 (UInt32) 值，例如 `3446222955`。等价于 [`rand()`](/sql-reference/functions/random-functions/#rand)。
* **`RANDOM()`** *(在 v0.2.1 中新增)* — 非官方的 [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 函数，返回 0 到 1 之间的浮点数。
* **`RAND_CONSTANT([optional_field])`** *(在 v0.2.1 中添加)* — 生成一个包含随机值的常量列。有点类似 `{RAND()}` 的固定 LOD，但速度更快。等价于 [`randConstant()`](/sql-reference/functions/random-functions/#randConstant)。
* **`REAL([my_number])`** — 将字段转换为浮点类型（Float64）。更多详情参见[`此处`](/sql-reference/data-types/decimal/#operations-and-result-type)。
* **`SHA256([my_string])`** *(在 v0.2.1 中新增)* — 从字符串计算 SHA-256 哈希，并将得到的字节集合作为字符串（FixedString 类型）返回。可方便地与 `HEX()` 函数一起使用，例如 `HEX(SHA256([my_string]))`。等价于 [`SHA256()`](/sql-reference/functions/hash-functions#SHA256)。
* **`SKEWNESS([my_number])`** — 计算序列的样本偏度。等价于 [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)。
* **`SKEWNESSP([my_number])`** — 计算一组数值的偏度。等价于 [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)。
* **`TO_TYPE_NAME([field])`** *(在 v0.2.1 中引入)* — 返回一个字符串，其中包含传入参数的 ClickHouse 类型名称。等同于 [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName)。
* **`TRUNC([my_float])`** — 与 `FLOOR([my_float])` 函数相同。等价于 [`trunc()`](/sql-reference/functions/rounding-functions#trunc)。
* **`UNHEX([my_string])`** *(在 v0.2.1 中新增)* — 执行与 `HEX()` 相反的操作。等价于 [`unhex()`](/sql-reference/functions/encoding-functions#unhex)。