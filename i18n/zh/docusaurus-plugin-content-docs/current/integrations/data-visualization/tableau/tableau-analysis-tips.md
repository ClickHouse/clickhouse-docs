---
sidebar_label: '分析技巧'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: '使用 ClickHouse 官方连接器进行 Tableau 分析的技巧。'
title: '分析技巧'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

# 分析提示 \{#analysis-tips\}

## MEDIAN() 和 PERCENTILE() 函数 \\{#median-and-percentile-functions\\}

* 在 Live 模式下，自 connector v0.1.3 版本起，`MEDIAN()` 和 `PERCENTILE()` 函数使用 [ClickHouse quantile()() 函数](/sql-reference/aggregate-functions/reference/quantile/)，这在显著加快计算速度的同时，是基于抽样进行计算的。如果你希望获得精确的计算结果，请使用 `MEDIAN_EXACT()` 和 `PERCENTILE_EXACT()` 函数（基于 [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)）。
* 在 Extract 模式下无法使用 MEDIAN&#95;EXACT() 和 PERCENTILE&#95;EXACT()，因为 MEDIAN() 和 PERCENTILE() 本身就是精确的（但较慢）。

## 实时模式中计算字段的其他函数 \\{#additional-functions-for-calculated-fields-in-live-mode\\}

ClickHouse 提供了大量数据分析函数——远超 Tableau 所支持的数量。为方便用户，我们新增了可在 Live 模式下创建计算字段时使用的函数。由于 Tableau 界面无法为这些函数添加描述，我们将在此处直接提供说明。

* **[`-If` 聚合组合器](/sql-reference/aggregate-functions/combinators/#-if)** *(在 v0.2.3 中新增)* - 允许在聚合计算中直接应用行级过滤。已新增 `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 函数。
* **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(在 v0.2.1 中新增)* — 忘掉那些无聊的柱状图吧！改用 `BAR()` 函数（等同于 ClickHouse 中的 [`bar()`](/sql-reference/functions/other-functions#bar)）。例如，下列计算字段会返回以 String 形式表示的精美条形图：
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
* **`COUNTD_UNIQ([my_field])`** *(在 v0.2.0 中添加)* — 用于近似计算参数的不同取值个数。等价于 [uniq()](/sql-reference/aggregate-functions/reference/uniq/)。比 `COUNTD()` 快得多。
* **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(在 v0.2.1 中新增)* — 等价于 ClickHouse 中的 [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval)。将 Date 或 Date &amp; Time 类型的值按给定的时间间隔向下取整，例如：
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
* **`FORMAT_READABLE_QUANTITY([my_integer])`** *(新增于 v0.2.1)* — 返回一个经过四舍五入并带有后缀（thousand、million、billion 等）的数字字符串。便于人类阅读大型数值。等价于 [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity)。
* **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(在 v0.2.1 中新增)* —— 接受一个以秒为单位的时间间隔。返回一个以（年、月、日、时、分、秒）表示的时间间隔字符串。`optional_max_unit` 为要显示的最大时间单位。可接受的值：`seconds`、`minutes`、`hours`、`days`、`months`、`years`。等同于 [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta)。
* **`GET_SETTING([my_setting_name])`** *（在 v0.2.1 中新增）* — 返回自定义设置的当前值。等价于 [`getSetting()`](/sql-reference/functions/other-functions#getSetting)。
* **`HEX([my_string])`** *(在 v0.2.1 中新增)* — 返回一个包含参数十六进制表示的字符串。等价于 [`hex()`](/sql-reference/functions/encoding-functions/#hex)。
* **`KURTOSIS([my_number])`** — 计算序列的样本峰度。等价于 [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)。
* **`KURTOSISP([my_number])`** — 计算序列的峰度。等价于 [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)。
* **`MEDIAN_EXACT([my_number])`** *(自 v0.1.3 起新增)* — 精确计算数值数据序列的中位数。等价于 [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
* **`MOD([my_number_1], [my_number_2])`** — 计算除法运算的余数。若参数为浮点数，会先去掉小数部分并转换为整数。等价于 [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)。
* **`PERCENTILE_EXACT([my_number], [level_float])`** *(在 v0.1.3 中新增)* — 精确计算数值序列的百分位数。`level` 参数的推荐取值范围为 [0.01, 0.99]。等价于 [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
* **`PROPER([my_string])`** *(新增于 v0.2.5)* - 将文本字符串转换为每个单词首字母大写、其余字母小写。空格以及标点符号等非字母数字字符也会被视为分隔符。例如：
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
* **`RAND()`** *(在 v0.2.1 中新增)* — 返回 UInt32 整数值，例如 `3446222955`。等同于 [`rand()`](/sql-reference/functions/random-functions/#rand)。
* **`RANDOM()`** *(在 v0.2.1 中新增)* —— 非官方的 Tableau [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) 函数，返回介于 0 和 1 之间的浮点数值。
* **`RAND_CONSTANT([optional_field])`** *(在 v0.2.1 中新增)* — 生成一个值为随机数的常量列。类似 `{RAND()}` 的 Fixed LOD，但速度更快。等价于 [`randConstant()`](/sql-reference/functions/random-functions/#randConstant)。
* **`REAL([my_number])`** — 将字段转换为浮点数类型（Float64）。详细说明见[`此处`](/sql-reference/data-types/decimal/#operations-and-result-type)。
* **`SHA256([my_string])`** *(在 v0.2.1 中添加)* — 从字符串计算 SHA-256 哈希值，并将得到的字节序列以字符串（FixedString）形式返回。可方便地与 `HEX()` 函数配合使用，例如 `HEX(SHA256([my_string]))`。等价于 [`SHA256()`](/sql-reference/functions/hash-functions#SHA256)。
* **`SKEWNESS([my_number])`** — 计算序列的样本偏度。等价于 [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)。
* **`SKEWNESSP([my_number])`** — 计算序列的偏度。等价于 [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)。
* **`TO_TYPE_NAME([field])`** *(在 v0.2.1 中新增)* — 返回一个字符串，该字符串包含传入参数的 ClickHouse 类型名。等价于 [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName).
* **`TRUNC([my_float])`** — 与 `FLOOR([my_float])` 函数相同。等价于 [`trunc()`](/sql-reference/functions/rounding-functions#trunc) 函数。
* **`UNHEX([my_string])`** *(在 v0.2.1 中新增)* — 执行与 `HEX()` 相反的操作。等价于 [`unhex()`](/sql-reference/functions/encoding-functions#unhex)。